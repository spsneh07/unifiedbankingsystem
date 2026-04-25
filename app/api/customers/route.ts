import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
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
