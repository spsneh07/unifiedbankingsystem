const { query } = require('../db/connection');

async function getAnalytics(req, res) {
  try {
    const user = req.user;
    const userRole = user?.role || 'customer';
    let targetCustomerId = req.query.customerId;

    if (userRole === 'customer') {
      targetCustomerId = user?.customer_id;
      if (!targetCustomerId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const isGlobal = (userRole === 'admin' || userRole === 'employee') && !targetCustomerId;
    const whereClause = isGlobal ? '' : 'WHERE a.customer_id = ?';
    const params = isGlobal ? [] : [targetCustomerId];

    const byCategory = await query(`
      SELECT
        COALESCE(t.category, 'Other') as category,
        COUNT(*) as transaction_count,
        SUM(t.amount) as total_amount,
        AVG(t.amount) as avg_amount,
        MAX(t.amount) as max_amount
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      ${whereClause}
      GROUP BY category
      ORDER BY total_amount DESC
    `, params);

    const monthly = await query(`
      SELECT
        DATE_FORMAT(t.created_at, '%b %Y') as month,
        DATE_FORMAT(t.created_at, '%Y-%m') as month_key,
        SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as deposits,
        SUM(CASE WHEN t.type != 'deposit' THEN t.amount ELSE 0 END) as withdrawals,
        COUNT(*) as transaction_count
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      ${isGlobal ? 'WHERE' : whereClause + ' AND'} t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month_key, month
      ORDER BY month_key ASC
    `, params);

    const topSpending = await query(`
      SELECT
        COALESCE(t.category, 'Other') as category,
        SUM(t.amount) as total_amount,
        COUNT(*) as count
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      ${isGlobal ? 'WHERE' : whereClause + ' AND'} t.type != 'deposit'
      GROUP BY category
      ORDER BY total_amount DESC
      LIMIT 10
    `, params);

    const byType = await query(`
      SELECT
        t.type,
        COUNT(*) as count,
        SUM(t.amount) as total_amount
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      ${whereClause}
      GROUP BY t.type
    `, params);

    let globalStats = null;
    if (isGlobal) {
      const [stats] = await query(`
        SELECT 
          (SELECT COUNT(*) FROM customers) as total_customers,
          (SELECT COUNT(*) FROM accounts) as total_accounts,
          (SELECT SUM(balance) FROM accounts) as total_liquidity,
          (SELECT COUNT(*) FROM transactions WHERE created_at >= CURDATE()) as today_transactions
      `);
      globalStats = stats;
    }

    return res.json({
      success: true,
      data: { byCategory, monthly, topSpending, byType, globalStats }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getAnalytics };
