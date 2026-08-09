const { pool } = require('../db/connection');

async function getDashboard(req, res) {
  try {
    const user = req.user;
    const userRole = user?.role || 'customer';
    let customerId = user?.customer_id;

    // Auto-initialize customer profile if missing
    if (userRole === 'customer' && !customerId) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [existing] = await conn.execute(
          'SELECT id FROM customers WHERE user_id = ?', [user.user_id]
        );
        if (existing.length > 0) {
          customerId = existing[0].id;
          await conn.execute('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, user.user_id]);
        } else {
          const [customerRes] = await conn.execute(
            'INSERT INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
            [user.user_id, user.email.split('@')[0], 'User', 'N/A', 'N/A']
          );
          customerId = customerRes.insertId;
          await conn.execute('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, user.user_id]);

          const accountNo = 'ACC' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
          await conn.execute(
            'INSERT INTO accounts (customer_id, account_number, type, balance, status) VALUES (?, ?, ?, ?, ?)',
            [customerId, accountNo, 'Savings', 0, 'Active']
          );
        }
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    // ─── Admin / Employee dashboard ───────────────────────────────────────────
    if (userRole === 'admin' || userRole === 'employee') {
      const [[balRow]] = await pool.execute('SELECT COALESCE(SUM(balance), 0) as "totalBalance" FROM accounts');
      const [[accRow]] = await pool.execute('SELECT COUNT(*) as "totalAccounts" FROM accounts');
      const [[custRow]] = await pool.execute('SELECT COUNT(*) as "totalCustomers" FROM customers');

      const [fraudAlerts] = await pool.execute(`
        SELECT t.id, t.amount, t.created_at, t.type, t.description,
               a.account_number as account_no
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.is_suspicious = true
        ORDER BY t.created_at DESC
        LIMIT 50
      `);

      const [recentTx] = await pool.execute(`
        SELECT t.id, t.description, t.type, t.amount,
               t.created_at as transaction_date,
               a.account_number as account_no
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        ORDER BY t.created_at DESC LIMIT 10
      `);

      const [cashFlow] = await pool.execute(`
        SELECT 
          EXTRACT(YEAR FROM created_at) as year, 
          EXTRACT(MONTH FROM created_at) as month_num,
          TO_CHAR(created_at, 'Mon') as month,
          SUM(CASE WHEN type IN ('deposit', 'Deposit') THEN amount ELSE 0 END) as deposits,
          SUM(CASE WHEN type IN ('withdrawal', 'Withdrawal', 'transfer', 'Transfer') THEN amount ELSE 0 END) as withdrawals
        FROM transactions
        WHERE created_at >= NOW() - INTERVAL '6 months'
          AND status = 'SUCCESS'
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
        ORDER BY year ASC, month_num ASC
      `);

      return res.json({
        success: true,
        data: {
          totalBalance: parseFloat(balRow.totalBalance) || 0,
          totalAccounts: parseInt(accRow.totalAccounts) || 0,
          totalCustomers: parseInt(custRow.totalCustomers) || 0,
          fraudAlerts,
          recentTx,
          cashFlow,
        },
      });
    }

    // ─── Customer dashboard ───────────────────────────────────────────────────
    if (!customerId) {
      return res.status(401).json({ success: false, error: 'Customer context not found' });
    }

    const [[balRow]] = await pool.execute(
      'SELECT COALESCE(SUM(balance), 0) as "totalBalance" FROM accounts WHERE customer_id = ?',
      [customerId]
    );
    const [[accRow]] = await pool.execute(
      'SELECT COUNT(*) as "totalAccounts" FROM accounts WHERE customer_id = ?',
      [customerId]
    );

    const [fraudAlerts] = await pool.execute(`
      SELECT t.id, t.amount, t.created_at, t.description,
             a.account_number as account_no
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.is_suspicious = true AND a.customer_id = ?
      ORDER BY t.created_at DESC LIMIT 20
    `, [customerId]);

    const [recentTx] = await pool.execute(`
      SELECT t.id, t.description, t.type, t.amount,
             t.created_at as transaction_date,
             a.account_number as account_no
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC LIMIT 8
    `, [customerId]);

    const [myAccounts] = await pool.execute(`
      SELECT id, account_number as account_no, balance, type, status
      FROM accounts
      WHERE customer_id = ?
      ORDER BY created_at ASC
      LIMIT 5
    `, [customerId]);

    const [cashFlow] = await pool.execute(`
      SELECT 
        EXTRACT(YEAR FROM t.created_at) as year, 
        EXTRACT(MONTH FROM t.created_at) as month_num,
        TO_CHAR(t.created_at, 'Mon') as month,
        SUM(CASE WHEN t.type IN ('deposit', 'Deposit') THEN t.amount ELSE 0 END) as deposits,
        SUM(CASE WHEN t.type IN ('withdrawal', 'Withdrawal', 'transfer', 'Transfer') THEN t.amount ELSE 0 END) as withdrawals
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.created_at >= NOW() - INTERVAL '6 months'
        AND t.status = 'SUCCESS'
        AND a.customer_id = ?
      GROUP BY EXTRACT(YEAR FROM t.created_at), EXTRACT(MONTH FROM t.created_at), TO_CHAR(t.created_at, 'Mon')
      ORDER BY year ASC, month_num ASC
    `, [customerId]);

    return res.json({
      success: true,
      data: {
        totalBalance: parseFloat(balRow.totalBalance) || 0,
        totalAccounts: parseInt(accRow.totalAccounts) || 0,
        totalCustomers: 1, // For customer view, this is always 1 (themselves)
        fraudAlerts,
        recentTx,
        myAccounts,
        cashFlow,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load dashboard' });
  }
}

module.exports = { getDashboard };
