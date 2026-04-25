import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const validRoles = ['admin', 'employee', 'customer']
    const userRole = validRoles.includes(role) ? role : 'customer'

    const existingUser: any = await query('SELECT user_id FROM users WHERE email = ?', [email])
    const existingCustomer: any = await query('SELECT customer_id FROM customers WHERE email = ?', [email])
    
    if (existingUser.length > 0 || existingCustomer.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result: any = await query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, userRole]
    )
    const userId = result.insertId;

    if (userRole === 'customer') {
      const aadhar = 'AD' + Math.floor(Math.random() * 100000000000).toString().padStart(12, '0');
      const customerRes: any = await query(
        'INSERT INTO customers (name, email, phone, address, aadhar) VALUES (?, ?, ?, ?, ?)',
        [email.split('@')[0], email, 'N/A', 'N/A', aadhar]
      );
      const customerId = customerRes.insertId;
      await query('UPDATE users SET customer_id = ? WHERE user_id = ?', [customerId, userId]);

      const accountNo = 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
      await query(
        'INSERT INTO accounts (customer_id, account_no, branch_id, bank_name, account_type, balance, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [customerId, accountNo, 1, 'SBI', 'Savings', 0, 'Active']
      );
    }

    return NextResponse.json({ success: true, message: 'Account created successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
