import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { sql } = await request.json();
    if (!sql) {
      return NextResponse.json({ success: false, error: 'SQL query is required' }, { status: 400 });
    }
    const results = await query(sql);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
