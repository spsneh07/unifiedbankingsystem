const { query } = require('../db/connection');

async function getAccounts(req, res) {
  try {
    const paramCustomerId = req.query.customerId;
    const user = req.user;
    const userRole = user?.role || 'customer';
    const sessionCustomerId = user?.customer_id;

    let targetCustomerId = paramCustomerId;
    if (userRole === 'customer') {
      targetCustomerId = sessionCustomerId;
    }

    if ((userRole === 'admin' || userRole === 'employee') && !targetCustomerId) {
      const accounts = await query(`
        SELECT a.id as id, a.account_number as account_number, 'NexusBank' as bank_name, a.type as type, a.balance, a.status, a.created_at, c.first_name as customer_name 
        FROM accounts a 
        LEFT JOIN customers c ON a.customer_id = c.id
        ORDER BY a.created_at DESC
      `);
      return res.json(accounts);
    }

    if (!targetCustomerId) return res.json([]);

    const accounts = await query(`
      SELECT a.id as id, a.account_number as account_number, 'NexusBank' as bank_name, a.type as type, a.balance, a.status, a.created_at, c.first_name as customer_name 
      FROM accounts a 
      LEFT JOIN customers c ON a.customer_id = c.id
      WHERE a.customer_id = ?
      ORDER BY a.created_at DESC
    `, [targetCustomerId]);

    return res.json(accounts);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function createAccount(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { customer_id, bank_name, account_type, initial_deposit } = req.body;

    if (!customer_id || !bank_name || !account_type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const account_no = `${bank_name.substring(0, 3).toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    await query(
      'INSERT INTO accounts (account_number, customer_id, type, balance, status) VALUES (?, ?, ?, ?, ?)',
      [account_no, customer_id, account_type, initial_deposit || 0, 'Active']
    );

    return res.json({ success: true, message: 'Account created successfully', account_no });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getAccounts, createAccount };
