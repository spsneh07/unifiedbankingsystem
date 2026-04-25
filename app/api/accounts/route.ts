import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get('customerId');

    if (!customerId) {
      const cookieStore = await cookies();
      const userId = cookieStore.get('ub_user_id')?.value;
      if (userId) {
        const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
        if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
      }
    }

    if (!customerId) return NextResponse.json([]);

    const accounts = await query(`
      SELECT a.account_id as id, a.account_no as account_number, a.account_type as type, a.balance, a.status, a.created_at, c.name as first_name, '' as last_name 
      FROM accounts a 
      LEFT JOIN customers c ON a.customer_id = c.customer_id
      WHERE a.customer_id = ?
      ORDER BY a.created_at DESC
    `, [customerId]);
    
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
