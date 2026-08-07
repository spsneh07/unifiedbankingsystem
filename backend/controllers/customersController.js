const { query } = require('../db/connection');

async function getCustomers(req, res) {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const customers = await query(`
      SELECT id as id, first_name as name, 'No Email' as email, phone, address, 'N/A' as aadhar_number, created_at 
      FROM customers 
      ORDER BY created_at DESC
    `);
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function createCustomer(req, res) {
  try {
    const { name, email, phone, address, aadhar } = req.body;

    if (!name || !email || !phone || !address || !aadhar) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await query(
      'INSERT INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
      [null, name, 'User', phone, address]
    );

    return res.json({ success: true, message: 'Customer created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function updateCustomer(req, res) {
  try {
    const { id, name, email, phone, address, aadhar } = req.body;

    if (!id || !name || !email || !phone || !address || !aadhar) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await query(
      'UPDATE customers SET first_name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone, address, id]
    );

    return res.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const user = req.user;
    if (!user || !user.customer_id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const rows = await query(`
      SELECT c.first_name, c.last_name, c.phone, c.address, u.email 
      FROM customers c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.id = ?
    `, [user.customer_id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const user = req.user;
    if (!user || !user.customer_id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { first_name, last_name, phone, address } = req.body;

    if (!first_name || !last_name || !phone || !address) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await query(
      'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE id = ?',
      [first_name, last_name, phone, address, user.customer_id]
    );

    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getCustomers, createCustomer, updateCustomer, getProfile, updateProfile };
