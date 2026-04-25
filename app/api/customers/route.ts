import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userRes: any = await query('SELECT role FROM users WHERE user_id = ?', [userId]);
    if (!userRes.length || (userRes[0].role !== 'admin' && userRes[0].role !== 'employee')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const customers = await query(`
      SELECT customer_id as id, name as first_name, '' as last_name, email, phone, address, aadhar as aadhar_number, created_at 
      FROM customers 
      ORDER BY created_at DESC
    `);
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
