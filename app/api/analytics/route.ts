import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    let customerFilter = '';
    const params: any[] = [];

    if (customerId) {
      customerFilter = 'WHERE a.customer_id = ?';
      params.push(customerId);
    }

    const byCategory: any = await query(`
      SELECT
        COALESCE(t.category, 'Other') as category,
        COUNT(*) as transaction_count,
        SUM(t.amount) as total_amount,
        AVG(t.amount) as avg_amount,
        MAX(t.amount) as max_amount
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ${customerFilter}
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
      ${customerFilter}
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
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
      ${customerFilter}
      WHERE t.type != 'deposit'
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
      ${customerFilter}
      GROUP BY t.type
    `, params);

    return NextResponse.json({
      success: true,
      data: { byCategory, monthly, topSpending, byType }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
