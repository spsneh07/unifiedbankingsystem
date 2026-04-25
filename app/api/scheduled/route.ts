import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function autoExecuteScheduledTransactions() {
  const pending: any = await query(`
    SELECT * FROM scheduled_transactions 
    WHERE is_active = 1 AND next_execution <= CURDATE()
  `);

  for (const st of pending) {
    await query('UPDATE accounts SET balance = balance - ? WHERE account_id = ?', [st.amount, st.account_id]);
    
    await query(`
      INSERT INTO transactions (account_id, type, amount, description, category, created_at)
      VALUES (?, 'withdraw', ?, ?, ?, NOW())
    `, [st.account_id, st.amount, `Auto-pay: ${st.bill_type}`, 'Bills']);

    let interval = '1 MONTH';
    if (st.frequency === 'weekly') interval = '1 WEEK';
    if (st.frequency === 'yearly') interval = '1 YEAR';
    
    await query(`
      UPDATE scheduled_transactions 
      SET next_execution = DATE_ADD(next_execution, INTERVAL ${interval})
      WHERE schedule_id = ?
    `, [st.schedule_id]);
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    
    await autoExecuteScheduledTransactions();

    let customerId = 1;
    if (userId) {
      const userRes: any = await query('SELECT id as customer_id FROM customers WHERE user_id = ?', [userId]);
      if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
    }

    const scheduled = await query(`
      SELECT st.*, a.account_no
      FROM scheduled_transactions st
      JOIN accounts a ON st.account_id = a.account_id
      WHERE a.customer_id = ?
      ORDER BY st.next_execution ASC
    `, [customerId]);
    
    return NextResponse.json(scheduled);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, schedule_id, is_active, account_id, amount, frequency, bill_type, next_execution } = body;

    if (action === 'toggle') {
      await query('UPDATE scheduled_transactions SET is_active = ? WHERE schedule_id = ?', [is_active ? 1 : 0, schedule_id]);
      return NextResponse.json({ success: true, message: 'Auto-pay toggled successfully' });
    } else if (action === 'create') {
      if (!account_id || !amount || !frequency || !bill_type || !next_execution) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }
      await query(`
        INSERT INTO scheduled_transactions (account_id, amount, frequency, bill_type, next_execution, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [account_id, amount, frequency, bill_type, next_execution]);
      return NextResponse.json({ success: true, message: 'Scheduled transaction created' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
