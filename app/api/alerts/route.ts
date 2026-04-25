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

    if (!customerId) return NextResponse.json({ success: true, data: [], unreadCount: 0 });

    const alerts = await query(`
      SELECT * FROM alerts 
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `, [customerId]);
    
    const [countResult]: any = await query(`
      SELECT COUNT(*) as count FROM alerts WHERE customer_id = ? AND is_read = FALSE
    `, [customerId]);

    return NextResponse.json({ 
      success: true, 
      data: alerts,
      unreadCount: countResult?.count || 0
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    let customerId = null;
    if (userId) {
      const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
      if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
    }

    if (!customerId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    if (id) {
      await query(`UPDATE alerts SET is_read = TRUE WHERE alert_id = ? AND customer_id = ?`, [id, customerId]);
    } else {
      await query(`UPDATE alerts SET is_read = TRUE WHERE customer_id = ?`, [customerId]);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
