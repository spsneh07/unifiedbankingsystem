const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/credit-cards', creditCardsRoutes);
app.use('/api/credit-score', creditScoreRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scheduled', scheduledRoutes);
app.use('/api/branches', branchesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n  NexusBank Backend Server`);
  console.log(`  =======================`);
  console.log(`  Status:  Running`);
  console.log(`  Port:    ${PORT}`);
  console.log(`  URL:     http://localhost:${PORT}`);
  console.log(`  DB:      ${process.env.DB_NAME || 'banking_db'}`);
  console.log();
});
// trigger restart
