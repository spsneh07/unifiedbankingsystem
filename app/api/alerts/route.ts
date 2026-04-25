import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const alerts = await query(`
      SELECT * FROM alerts 
      ORDER BY created_at DESC
    `);
    
    // Also get the unread count
    const [countResult]: any = await query(`
      SELECT COUNT(*) as count FROM alerts WHERE is_read = FALSE
    `);

    return NextResponse.json({ 
      success: true, 
      data: alerts,
      unreadCount: countResult.count || 0
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;
    
    if (id) {
      await query(`UPDATE alerts SET is_read = TRUE WHERE alert_id = ?`, [id]);
    } else {
      await query(`UPDATE alerts SET is_read = TRUE`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
