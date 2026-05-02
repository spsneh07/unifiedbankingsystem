const { query } = require('../db/connection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const users = await query(
      `SELECT user_id as id, email, password_hash as password, role, customer_id FROM users WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];

    let passwordMatch = false;
    if (user.password) {
      const isBcrypt = user.password.startsWith('$2');
      if (isBcrypt) {
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        passwordMatch = user.password === password;
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      customer_id: user.customer_id,
    };

    res.cookie('ub_role', user.role, { httpOnly: false, maxAge: 8 * 60 * 60 * 1000, path: '/' });
    res.cookie('ub_user_id', String(user.id), { httpOnly: false, maxAge: 8 * 60 * 60 * 1000, path: '/' });

    return res.json({ success: true, user: userData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function signup(req, res) {
  try {
    const { email, password, role, name, phone, address } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const validRoles = ['admin', 'employee', 'customer'];
    const userRole = validRoles.includes(role) ? role : 'customer';

    const existingUser = await query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, userRole]
    );
    const userId = result.insertId;

    if (userRole === 'customer') {
      const customerRes = await query(
        'INSERT INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
        [userId, name || email.split('@')[0], 'User', phone || 'N/A', address || 'N/A']
      );
      const customerId = customerRes.insertId;
      await query('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, userId]);

      const accountNo = 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
      await query(
        'INSERT INTO accounts (customer_id, account_number, type, balance, status) VALUES (?, ?, ?, ?, ?)',
        [customerId, accountNo, 'Savings', 0, 'Active']
      );
    }

    return res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'Email or identity details already registered' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const users = await query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const rawToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query('DELETE FROM password_resets WHERE email = ?', [email]);
    await query('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [
      email, rawToken, expiresAt,
    ]);

    return res.json({ success: true, token: rawToken });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token) return res.status(400).json({ success: false, error: 'Token is required' });
    if (!newPassword) return res.status(400).json({ success: false, error: 'Password is required' });

    const rows = await query('SELECT id, email, expires_at FROM password_resets WHERE token = ? LIMIT 1', [token]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    const reset = rows[0];
    const expiresAt = new Date(reset.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      await query('DELETE FROM password_resets WHERE id = ?', [reset.id]);
      return res.status(400).json({ success: false, error: 'Token expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, reset.email]);
    await query('DELETE FROM password_resets WHERE id = ?', [reset.id]);

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { login, signup, forgotPassword, resetPassword };
