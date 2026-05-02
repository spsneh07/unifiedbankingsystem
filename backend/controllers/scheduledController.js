const { query } = require('../db/connection');

async function autoExecuteScheduledTransactions() {
  const pending = await query(`
    SELECT st.*, a.balance 
    FROM scheduled_transactions st
    JOIN accounts a ON st.account_id = a.id
    WHERE st.is_active = 1 AND st.next_execution <= CURDATE()
  `);

  for (const st of pending) {
    const newBalance = parseFloat(st.balance) - parseFloat(st.amount);
    await query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, st.account_id]);

    await query(`
      INSERT INTO transactions (account_id, type, amount, description, category, created_at)
      VALUES (?, 'Withdrawal', ?, ?, 'Bills', NOW())
    `, [st.account_id, st.amount, `Auto-pay: ${st.bill_type}`]);

    let interval = '1 MONTH';
    if (st.frequency === 'weekly') interval = '1 WEEK';
    if (st.frequency === 'daily') interval = '1 DAY';

    await query(`
      UPDATE scheduled_transactions 
      SET next_execution = DATE_ADD(next_execution, INTERVAL ${interval})
      WHERE schedule_id = ?
    `, [st.schedule_id]);
  }
}

async function getScheduled(req, res) {
  try {
    const customerId = req.user?.customer_id;

    await autoExecuteScheduledTransactions();

    if (!customerId) return res.json([]);

    const scheduled = await query(`
      SELECT st.*, a.account_number as account_no
      FROM scheduled_transactions st
      JOIN accounts a ON st.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY st.next_execution ASC
    `, [customerId]);

    return res.json(scheduled);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function manageScheduled(req, res) {
  try {
    const { action, schedule_id, is_active, account_id, amount, frequency, bill_type, next_execution } = req.body;

    if (action === 'toggle') {
      await query('UPDATE scheduled_transactions SET is_active = ? WHERE schedule_id = ?', [is_active ? 1 : 0, schedule_id]);
      return res.json({ success: true, message: 'Auto-pay toggled successfully' });
    } else if (action === 'create') {
      if (!account_id || !amount || !frequency || !bill_type || !next_execution) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      await query(`
        INSERT INTO scheduled_transactions (account_id, amount, frequency, bill_type, start_date, next_execution, is_active)
        VALUES (?, ?, ?, ?, CURDATE(), ?, 1)
      `, [account_id, amount, frequency, bill_type, next_execution]);
      return res.json({ success: true, message: 'Scheduled transaction created' });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getScheduled, manageScheduled };
