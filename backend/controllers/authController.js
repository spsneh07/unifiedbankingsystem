const { query } = require('../db/connection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { signValue } = require('../middleware/auth');

// ─── Validation rules ─────────────────────────────────────────────────────────
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().trim().isLength({ max: 100 }),
  body('phone').optional().trim().isLength({ max: 20 }),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// ─── Helper: set secure session cookies ──────────────────────────────────────
function setSessionCookies(res, user) {
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    path: '/',
  };

  // Signed session cookie (tamper-proof)
  res.cookie('ub_session', signValue(String(user.id)), cookieOpts);

  // Role cookie: NOT httpOnly so Next.js middleware can read it client-side for UI
  res.cookie('ub_role', user.role, {
    ...cookieOpts,
    httpOnly: false,
  });

  // User ID for client-side use (NOT httpOnly — just for UI display, not auth)
  res.cookie('ub_user_id', String(user.id), {
    ...cookieOpts,
    httpOnly: false,
  });
}

function clearSessionCookies(res) {
  const clearOpts = { path: '/', maxAge: 0 };
  res.clearCookie('ub_session', clearOpts);
  res.clearCookie('ub_role', clearOpts);
  res.clearCookie('ub_user_id', clearOpts);
}

// ─── Controllers ──────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const users = await query(
      'SELECT user_id as id, email, password_hash as password, role, customer_id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Use generic message to prevent email enumeration
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = users[0];

    let passwordMatch = false;
    if (user.password) {
      const isBcrypt = user.password.startsWith('$2');
      if (isBcrypt) {
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plaintext
        passwordMatch = user.password === password;
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      customer_id: user.customer_id,
    };

    setSessionCookies(res, userData);

    // Audit log
    await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [
      user.id, 'LOGIN_SUCCESS', `IP: ${req.ip}`
    ]).catch(() => {}); // Non-blocking

    return res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed: ' + error.message, stack: error.stack });
  }
}

async function signup(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, password, role, name, phone, address } = req.body;

    // Only allow customer self-registration; admin/employee must be created by admin
    const validRoles = ['customer'];
    const userRole = 'customer'; // Always customer for self-registration

    const existingUser = await query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, userRole]
    );
    const userId = result.insertId;

    const nameParts = (name || email.split('@')[0]).trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Account';

    const customerRes = await query(
      'INSERT INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
      [userId, firstName, lastName, phone || 'N/A', address || 'N/A']
    );
    const customerId = customerRes.insertId;
    await query('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, userId]);

    const accountNo = 'ACC' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
    await query(
      'INSERT INTO accounts (customer_id, account_number, type, balance, status) VALUES (?, ?, ?, ?, ?)',
      [customerId, accountNo, 'Savings', 0, 'Active']
    );

    return res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Signup failed. Please try again.' });
  }
}

async function logout(req, res) {
  try {
    if (req.user) {
      await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [
        req.user.user_id, 'LOGOUT', `IP: ${req.ip}`
      ]).catch(() => {});
    }
    clearSessionCookies(res);
    return res.json({ success: true });
  } catch (error) {
    clearSessionCookies(res);
    return res.json({ success: true });
  }
}

async function forgotPassword(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email } = req.body;

    const users = await query('SELECT user_id FROM users WHERE email = ?', [email]);

    // Always return success to prevent email enumeration
    if (!Array.isArray(users) || users.length === 0) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await query('DELETE FROM password_resets WHERE email = ?', [email]);
    await query('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [
      email, rawToken, expiresAt,
    ]);

    // In production: send email. For demo: return token directly.
    return res.json({ success: true, token: rawToken, message: 'Reset token generated (demo mode)' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, error: 'Request failed. Please try again.' });
  }
}

async function resetPassword(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { token, newPassword } = req.body;

    const rows = await query(
      'SELECT id, email, expires_at FROM password_resets WHERE token = ? LIMIT 1',
      [token]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    const reset = rows[0];
    const expiresAt = new Date(reset.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      await query('DELETE FROM password_resets WHERE id = ?', [reset.id]);
      return res.status(400).json({ success: false, error: 'Reset token has expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, reset.email]);
    await query('DELETE FROM password_resets WHERE id = ?', [reset.id]);

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Reset failed. Please try again.' });
  }
}

module.exports = {
  login,
  signup,
  logout,
  forgotPassword,
  resetPassword,
  loginValidation,
  signupValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
