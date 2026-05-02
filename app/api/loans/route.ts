import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('ub_role')?.value;
    const userId = cookieStore.get('ub_user_id')?.value;

    if (role === 'admin' || role === 'employee') {
      const loans = await query(`
        SELECT l.*, c.first_name as customer_name, 'N/A' as customer_email
        FROM loans l
        LEFT JOIN customers c ON l.customer_id = c.id
        ORDER BY l.created_at DESC
      `);
      return NextResponse.json(loans);
    } else {
      const { searchParams } = new URL(request.url);
      let customerId = searchParams.get('customerId');
      
      if (!customerId && userId) {
        const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
        if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
      }
      
      if (!customerId) return NextResponse.json([]);

      const loans = await query('SELECT * FROM loans WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
      return NextResponse.json(loans);
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, loan_id, amount, tenure, interest_rate } = await request.json();
    const cookieStore = await cookies();
    const role = cookieStore.get('ub_role')?.value;
    const userId = cookieStore.get('ub_user_id')?.value;

    if (action === 'apply') {
      let customerId = null;
      if (userId) {
        const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
        if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
      }

      if (!customerId) {
        return NextResponse.json({ success: false, error: 'Customer session not found' }, { status: 401 });
      }

      if (!amount || !tenure || !interest_rate) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
      }

      const P = amount;
      const R = (interest_rate / 100) / 12; // Monthly interest rate
      const N = tenure; // Tenure in months
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

      await query(
        'INSERT INTO loans (customer_id, amount, interest_rate, tenure, emi, status) VALUES (?, ?, ?, ?, ?, "pending")',
        [customerId, amount, interest_rate, tenure, emi]
      );
      return NextResponse.json({ success: true, message: 'Loan application submitted successfully' });
    } else if (action === 'approve' || action === 'reject') {
      if (role !== 'admin' && role !== 'employee') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
      if (!loan_id) {
        return NextResponse.json({ success: false, error: 'Missing loan_id' }, { status: 400 });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await query('UPDATE loans SET status = ? WHERE id = ?', [newStatus, loan_id]);
      return NextResponse.json({ success: true, message: `Loan ${newStatus} successfully` });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
