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

      const cashFlow = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%b') as month,
          SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as deposits,
          SUM(CASE WHEN type != 'deposit' THEN amount ELSE 0 END) as withdrawals
        FROM transactions
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
        ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
      `);

      return res.json({
        success: true,
        data: {
          totalBalance: b?.totalBalance || 0,
          totalAccounts: a?.totalAccounts || 0,
          totalCustomers: c?.totalCustomers || 0,
          fraudAlerts,
          recentTx,
          cashFlow
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

    const cashFlow = await query(`
      SELECT 
        DATE_FORMAT(t.created_at, '%b') as month,
        SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as deposits,
        SUM(CASE WHEN t.type != 'deposit' THEN t.amount ELSE 0 END) as withdrawals
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND a.customer_id = ?
      GROUP BY YEAR(t.created_at), MONTH(t.created_at), DATE_FORMAT(t.created_at, '%b')
      ORDER BY YEAR(t.created_at) ASC, MONTH(t.created_at) ASC
    `, [customerId]);

    return res.json({
      success: true,
      data: {
        totalBalance: b?.totalBalance || 0,
        totalAccounts: a?.totalAccounts || 0,
        totalCustomers: 1,
        fraudAlerts,
        recentTx,
        myAccounts,
        cashFlow
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getDashboard };
