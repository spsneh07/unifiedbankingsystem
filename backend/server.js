const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
require('dotenv').config();

const { authMiddleware } = require('./middleware/auth');

// Import Routes
const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/accounts');
const transactionsRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const customersRoutes = require('./routes/customers');
const alertsRoutes = require('./routes/alerts');
const loansRoutes = require('./routes/loans');
const creditCardsRoutes = require('./routes/creditCards');
const creditScoreRoutes = require('./routes/creditScore');
const analyticsRoutes = require('./routes/analytics');
const scheduledRoutes = require('./routes/scheduled');
const branchesRoutes = require('./routes/branches');
const otpRoutes = require('./routes/otp');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

// ─── Security Headers (Helmet) ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled since we have a SPA — configure properly for prod
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks
app.use(cookieParser());

// ─── Request ID Middleware ────────────────────────────────────────────────────
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// ─── Structured Logger ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(JSON.stringify({
      level,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      request_id: req.requestId,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    }));
  });
  next();
});

// ─── CSRF Origin Check for state-changing requests ───────────────────────────
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const host = req.get('Host');

    // Allow requests from allowed origins or same host (for health checks etc.)
    const originOk = !origin || allowedOrigins.includes(origin);
    const refererOk = !referer || allowedOrigins.some(o => referer.startsWith(o));

    if (!originOk && !refererOk) {
      return res.status(403).json({ success: false, error: 'CSRF check failed' });
    }
  }
  next();
});

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 10,                     // 10 attempts per IP per minute (generous for demo)
  message: { success: false, error: 'Too many login attempts. Please wait 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,                     // 10 signups per IP per hour
  message: { success: false, error: 'Too many signup attempts. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const transactionLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 30,                     // 30 transactions per IP per minute
  message: { success: false, error: 'Too many transaction requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const balanceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'Rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const profileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,
  message: { success: false, error: 'Too many profile updates. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,
  message: { success: false, error: 'Too many password reset requests. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────
app.use(authMiddleware);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/signup', signupLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/accounts', balanceLimiter, accountsRoutes);
app.use('/api/transactions', transactionLimiter, transactionsRoutes);
app.use('/api/dashboard', balanceLimiter, dashboardRoutes);
app.use('/api/customers', profileLimiter, customersRoutes);
app.use('/api/alerts', balanceLimiter, alertsRoutes);
app.use('/api/loans', balanceLimiter, loansRoutes);
app.use('/api/credit-cards', transactionLimiter, creditCardsRoutes);
app.use('/api/credit-score', balanceLimiter, creditScoreRoutes);
app.use('/api/analytics', balanceLimiter, analyticsRoutes);
app.use('/api/scheduled', balanceLimiter, scheduledRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/otp', otpRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
const { pool } = require('./db/connection');
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      db: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Log full error server-side
  console.error(JSON.stringify({
    level: 'ERROR',
    message: err.message,
    stack: err.stack,
    request_id: req.requestId,
    path: req.path,
    timestamp: new Date().toISOString(),
  }));

  // Don't leak internal errors to client
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ success: false, error: message, request_id: req.requestId });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: 'INFO',
    message: 'NexusBank Backend started',
    port: PORT,
    db: process.env.DB_NAME || 'banking_db',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  }));
});
