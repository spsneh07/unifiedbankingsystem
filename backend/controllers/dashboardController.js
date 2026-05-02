const { query } = require('../db/connection');

async function getDashboard(req, res) {
  try {
    const user = req.user;
    const userRole = user?.role || 'customer';
    let customerId = user?.customer_id;

    if (userRole === 'customer' && !customerId) {
      // Lazy initialize customer profile
      const customerRes = await query(
        'INSERT INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
        [user.user_id, user.email.split('@')[0], 'User', 'N/A', 'N/A']
      );
      customerId = customerRes.insertId;
      await query('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, user.user_id]);

      const accountNo = 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
      await query(
        'INSERT INTO accounts (customer_id, account_number, type, balance, status) VALUES (?, ?, ?, ?, ?)',
        [customerId, accountNo, 'savings', 0, 'active']
      );
    }

    if (userRole === 'admin' || userRole === 'employee') {
      const [b] = await query('SELECT SUM(balance) as totalBalance FROM accounts');
      const [a] = await query('SELECT COUNT(*) as totalAccounts FROM accounts');
      const [c] = await query('SELECT COUNT(*) as totalCustomers FROM customers');

      const fraudAlerts = await query(`
        SELECT t.*, a.account_number as account_no 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.is_suspicious = 1
      `);

      const recentTx = await query(`
        SELECT t.id as id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_number as account_no
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        ORDER BY t.created_at DESC LIMIT 10
      `);

      return res.json({
        success: true,
        data: {
          totalBalance: b?.totalBalance || 0,
          totalAccounts: a?.totalAccounts || 0,
          totalCustomers: c?.totalCustomers || 0,
          fraudAlerts,
          recentTx
        }
      });
    }

    if (!customerId) {
      return res.status(401).json({ success: false, error: 'Customer context not found' });
    }

    const [b] = await query('SELECT SUM(balance) as totalBalance FROM accounts WHERE customer_id = ?', [customerId]);
    const [a] = await query('SELECT COUNT(*) as totalAccounts FROM accounts WHERE customer_id = ?', [customerId]);

    const fraudAlerts = await query(`
      SELECT t.*, a.account_number as account_no 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.is_suspicious = 1 AND a.customer_id = ?
    `, [customerId]);

    const recentTx = await query(`
      SELECT t.id as id, t.description, t.type, t.amount, t.created_at as transaction_date, a.account_number as account_no
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC LIMIT 8
    `, [customerId]);

    const myAccounts = await query(`
      SELECT id as id, account_number as account_no, balance, type as type, status FROM accounts WHERE customer_id = ? LIMIT 3
    `, [customerId]);

    return res.json({
      success: true,
      data: {
        totalBalance: b?.totalBalance || 0,
        totalAccounts: a?.totalAccounts || 0,
        totalCustomers: 1,
        fraudAlerts,
        recentTx,
        myAccounts
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getDashboard };
