const { query } = require('../db/connection');

async function authMiddleware(req, res, next) {
  try {
    const userId = req.cookies?.ub_user_id;
    const role = req.cookies?.ub_role;

    if (!userId) {
      req.user = null;
      return next();
    }

    const userRes = await query('SELECT user_id, customer_id, role, email FROM users WHERE user_id = ?', [userId]);
    if (userRes.length) {
      req.user = {
        user_id: userRes[0].user_id,
        customer_id: userRes[0].customer_id,
        role: userRes[0].role,
        email: userRes[0].email
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireAuth, requireRole };
