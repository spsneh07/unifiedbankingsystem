const { query } = require('../db/connection');
const crypto = require('crypto');

const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production-please';

/**
 * Sign a value using HMAC-SHA256.
 * Returns: `value.signature` so the original value can be read before verification.
 */
function signValue(value) {
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(String(value))
    .digest('hex');
  return `${value}.${sig}`;
}

/**
 * Verify a signed value. Returns the original value or null if tampered.
 */
function verifySignedValue(signed) {
  if (!signed || typeof signed !== 'string') return null;
  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) return null;
  const value = signed.substring(0, lastDot);
  const sig = signed.substring(lastDot + 1);
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(value)
    .digest('hex');
  // Timing-safe comparison
  try {
    const expectedBuf = Buffer.from(expected, 'hex');
    const sigBuf = Buffer.from(sig, 'hex');
    if (expectedBuf.length !== sigBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) return null;
    return value;
  } catch {
    return null;
  }
}

/**
 * Attach user info to req.user from a signed session cookie.
 * Falls back to legacy unsigned cookies (for backward compat during transition).
 */
async function authMiddleware(req, res, next) {
  try {
    let userId = null;

    // Try signed session cookie first (new secure approach)
    const signedUserId = req.cookies?.ub_session;
    if (signedUserId) {
      userId = verifySignedValue(signedUserId);
      if (!userId) {
        // Tampered cookie — clear it and treat as unauthenticated
        res.clearCookie('ub_session');
        res.clearCookie('ub_role');
        res.clearCookie('ub_user_id');
        req.user = null;
        return next();
      }
    } else {
      // Fallback: legacy unsigned cookie (will be phased out)
      userId = req.cookies?.ub_user_id;
    }

    if (!userId) {
      req.user = null;
      return next();
    }

    const userRes = await query(
      'SELECT user_id, customer_id, role, email FROM users WHERE user_id = ?',
      [userId]
    );

    if (userRes.length) {
      req.user = {
        user_id: userRes[0].user_id,
        customer_id: userRes[0].customer_id,
        role: userRes[0].role,
        email: userRes[0].email,
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

module.exports = { authMiddleware, requireAuth, requireRole, signValue, verifySignedValue };
