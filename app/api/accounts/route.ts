import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    let accounts;
    if (customerId) {
      accounts = await query(`
        SELECT a.account_id as id, a.account_no as account_number, a.account_type as type, a.balance, a.status, a.created_at, c.name as first_name, '' as last_name 
        FROM accounts a 
        LEFT JOIN customers c ON a.customer_id = c.customer_id
        WHERE a.customer_id = ?
        ORDER BY a.created_at DESC
      `, [customerId]);
    } else {
      accounts = await query(`
        SELECT a.account_id as id, a.account_no as account_number, a.account_type as type, a.balance, a.status, a.created_at, c.name as first_name, '' as last_name 
        FROM accounts a 
        LEFT JOIN customers c ON a.customer_id = c.customer_id
        ORDER BY a.created_at DESC
      `);
    }
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
