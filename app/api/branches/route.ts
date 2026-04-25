import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('API: GET /api/branches hit');
  try {
    const branches = await query('SELECT * FROM branches ORDER BY name ASC') as any[];
    console.log(`API: Successfully fetched ${branches.length} branches`);
    return NextResponse.json(branches);
  } catch (error: any) {
    console.error('API Error /api/branches:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
