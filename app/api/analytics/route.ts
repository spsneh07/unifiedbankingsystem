import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paramCustomerId = searchParams.get('customerId');
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    let userRole = 'customer';
    let sessionCustomerId = null;

    if (userId) {
      const userRes: any = await query('SELECT customer_id, role FROM users WHERE user_id = ?', [userId]);
      if (userRes.length) {
        userRole = userRes[0].role;
        sessionCustomerId = userRes[0].customer_id;
      }
    }

    // Determine target customerId
    let targetCustomerId = paramCustomerId;
    if (userRole === 'customer') {
      targetCustomerId = sessionCustomerId;
      if (!targetCustomerId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isGlobal = (userRole === 'admin' || userRole === 'employee') && !targetCustomerId;
    const whereClause = isGlobal ? '' : 'WHERE a.customer_id = ?';
    const params = isGlobal ? [] : [targetCustomerId];

    const byCategory: any = await query(`
      SELECT
        COALESCE(t.category, 'Other') as category,
        COUNT(*) as transaction_count,
        SUM(t.amount) as total_amount,
        AVG(t.amount) as avg_amount,
        MAX(t.amount) as max_amount
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ${whereClause}
      GROUP BY category
      ORDER BY total_amount DESC
    `, params);

    const monthly: any = await query(`
      SELECT
        DATE_FORMAT(t.created_at, '%b %Y') as month,
        DATE_FORMAT(t.created_at, '%Y-%m') as month_key,
        SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as deposits,
        SUM(CASE WHEN t.type != 'deposit' THEN t.amount ELSE 0 END) as withdrawals,
        COUNT(*) as transaction_count
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ${isGlobal ? 'WHERE' : whereClause + ' AND'} t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month_key, month
      ORDER BY month_key ASC
    `, params);

    const topSpending: any = await query(`
      SELECT
        COALESCE(t.category, 'Other') as category,
        SUM(t.amount) as total_amount,
        COUNT(*) as count
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ${isGlobal ? 'WHERE' : whereClause + ' AND'} t.type != 'deposit'
      GROUP BY category
      ORDER BY total_amount DESC
      LIMIT 10
    `, params);

    const byType: any = await query(`
      SELECT
        t.type,
        COUNT(*) as count,
        SUM(t.amount) as total_amount
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ${whereClause}
      GROUP BY t.type
    `, params);

    // Additional Global Stats for Admin
    let globalStats = null;
    if (isGlobal) {
      const [stats]: any = await query(`
        SELECT 
          (SELECT COUNT(*) FROM customers) as total_customers,
          (SELECT COUNT(*) FROM accounts) as total_accounts,
          (SELECT SUM(balance) FROM accounts) as total_liquidity,
          (SELECT COUNT(*) FROM transactions WHERE created_at >= CURDATE()) as today_transactions
      `);
      globalStats = stats;
    }

    return NextResponse.json({
      success: true,
      data: { byCategory, monthly, topSpending, byType, globalStats }
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
