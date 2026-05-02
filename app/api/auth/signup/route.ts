import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password, role, name, phone, address, aadhar } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const validRoles = ['admin', 'employee', 'customer']
    const userRole = validRoles.includes(role) ? role : 'customer'

    const existingUser: any = await query('SELECT user_id FROM users WHERE email = ?', [email])
    
    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result: any = await query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, userRole]
    )
    const userId = result.insertId;

    if (userRole === 'customer') {
      const customerRes: any = await query(
        'INSERT INTO customers (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
        [userId, name || email.split('@')[0], 'User', phone || 'N/A', address || 'N/A']
      );
      const customerId = customerRes.insertId;
      await query('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, userId]);

      // Create a default Savings account
      const accountNo = 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
      await query(
        'INSERT INTO accounts (customer_id, account_number, type, balance, status) VALUES (?, ?, ?, ?, ?)',
        [customerId, accountNo, 'Savings', 0, 'Active']
      );
    }

    return NextResponse.json({ success: true, message: 'Account created successfully' })
  } catch (error: any) {
    console.error('Signup Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Email or identity details already registered' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
