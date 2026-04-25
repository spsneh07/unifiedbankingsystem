import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transactions = await query(`
      SELECT t.transaction_id as id, t.type, t.amount, t.description, t.created_at, t.is_suspicious, t.category, a.account_no as account_number 
      FROM transactions t 
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ORDER BY t.created_at DESC
    `);
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
