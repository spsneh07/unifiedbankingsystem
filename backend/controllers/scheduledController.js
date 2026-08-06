const { pool } = require('../db/connection');

async function autoExecuteScheduledTransactions() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [pending] = await conn.execute(`
      SELECT st.schedule_id, st.account_id, st.amount, st.frequency, st.bill_type, a.balance
      FROM scheduled_transactions st
      JOIN accounts a ON st.account_id = a.id
      WHERE st.is_active = 1 AND st.next_execution <= CURRENT_DATE
      FOR UPDATE
    `);

    for (const st of pending) {
      const amount = parseFloat(st.amount);
      const balance = parseFloat(st.balance);

      if (balance < amount) {
        // Skip — insufficient balance. Log it.
        await conn.execute(
          'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
          [null, 'SCHEDULED_TX_SKIPPED', `Schedule ${st.schedule_id}: Insufficient balance (${balance} < ${amount})`]
        );
      } else {
        await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, st.account_id]);
        await conn.execute(
          `INSERT INTO transactions (account_id, type, amount, description, category, status)
           VALUES (?, 'Withdrawal', ?, ?, 'Bills', 'SUCCESS')`,
          [st.account_id, amount, `Auto-pay: ${st.bill_type}`]
        );
      }

      // Advance next execution date regardless (to avoid stuck schedules)
      let interval = 'INTERVAL 1 MONTH';
      if (st.frequency === 'weekly') interval = 'INTERVAL 1 WEEK';
      if (st.frequency === 'daily') interval = 'INTERVAL 1 DAY';

      await conn.execute(
        `UPDATE scheduled_transactions SET next_execution = next_execution + ${interval} WHERE schedule_id = ?`,
        [st.schedule_id]
      );
    }

    await conn.commit();
    return pending.length;
  } catch (error) {
    await conn.rollback();
    console.error('Scheduled transaction execution error:', error);
    throw error;
  } finally {
    conn.release();
  }
}

async function getScheduled(req, res) {
  try {
    const customerId = req.user?.customer_id;

    // Run pending scheduled transactions
    await autoExecuteScheduledTransactions().catch(err => {
      console.error('Auto-execute failed (non-blocking):', err.message);
    });

    if (!customerId) return res.json([]);

    const [scheduled] = await pool.execute(`
      SELECT st.*, a.account_number as account_no
      FROM scheduled_transactions st
      JOIN accounts a ON st.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY st.next_execution ASC
    `, [customerId]);

    return res.json(scheduled);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch scheduled transactions' });
  }
}

async function manageScheduled(req, res) {
  try {
    const { action, schedule_id, is_active, account_id, amount, frequency, bill_type, next_execution } = req.body;

    if (action === 'toggle') {
      if (!schedule_id) return res.status(400).json({ success: false, error: 'schedule_id is required' });
      await pool.execute(
        'UPDATE scheduled_transactions SET is_active = ? WHERE schedule_id = ?',
        [is_active ? 1 : 0, schedule_id]
      );
      return res.json({ success: true, message: 'Auto-pay toggled successfully' });

    } else if (action === 'create') {
      const amtNum = parseFloat(amount);
      if (!account_id || isNaN(amtNum) || amtNum <= 0 || !frequency || !bill_type || !next_execution) {
        return res.status(400).json({ success: false, error: 'Missing or invalid required fields' });
      }
      const validFreqs = ['daily', 'weekly', 'monthly'];
      if (!validFreqs.includes(frequency)) {
        return res.status(400).json({ success: false, error: 'Invalid frequency' });
      }
      await pool.execute(
        `INSERT INTO scheduled_transactions (account_id, amount, frequency, bill_type, start_date, next_execution, is_active)
         VALUES (?, ?, ?, ?, CURRENT_DATE, ?, 1)`,
        [account_id, amtNum, frequency, bill_type, next_execution]
      );
      return res.json({ success: true, message: 'Scheduled transaction created' });

    } else if (action === 'delete') {
      if (!schedule_id) return res.status(400).json({ success: false, error: 'schedule_id is required' });
      await pool.execute('DELETE FROM scheduled_transactions WHERE schedule_id = ?', [schedule_id]);
      return res.json({ success: true, message: 'Scheduled transaction deleted' });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to manage scheduled transaction' });
  }
}

module.exports = { getScheduled, manageScheduled };
