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
      SELECT customer_id as id, name, email, phone, address, aadhar as aadhar_number, created_at 
      FROM customers 
      ORDER BY created_at DESC
    `);
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, address, aadhar } = await req.json();

    if (!name || !email || !phone || !address || !aadhar) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      'INSERT INTO customers (name, email, phone, address, aadhar) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, address, aadhar]
    );

    return NextResponse.json({ success: true, message: 'Customer created successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, email, phone, address, aadhar } = await req.json();

    if (!id || !name || !email || !phone || !address || !aadhar) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, aadhar = ? WHERE customer_id = ?',
      [name, email, phone, address, aadhar, id]
    );

    return NextResponse.json({ success: true, message: 'Customer updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
