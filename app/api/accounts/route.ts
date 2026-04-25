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
    // If admin/employee and they provided a param, use it.
    // If customer, they can only see their own (ignore param if they try to fish)
    let targetCustomerId = paramCustomerId;
    if (userRole === 'customer') {
      targetCustomerId = sessionCustomerId;
    }

    // Role-based Query Logic
    if ((userRole === 'admin' || userRole === 'employee') && !targetCustomerId) {
      // Return ALL accounts for admin/employee if no specific customer is requested
      const accounts = await query(`
        SELECT a.account_id as id, a.account_no as account_number, a.bank_name, a.account_type as type, a.balance, a.status, a.created_at, c.name as customer_name 
        FROM accounts a 
        LEFT JOIN customers c ON a.customer_id = c.customer_id
        ORDER BY a.created_at DESC
      `);
      return NextResponse.json(accounts);
    }

    if (!targetCustomerId) return NextResponse.json([]);

    const accounts = await query(`
      SELECT a.account_id as id, a.account_no as account_number, a.bank_name, a.account_type as type, a.balance, a.status, a.created_at, c.name as customer_name 
      FROM accounts a 
      LEFT JOIN customers c ON a.customer_id = c.customer_id
      WHERE a.customer_id = ?
      ORDER BY a.created_at DESC
    `, [targetCustomerId]);
    
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
