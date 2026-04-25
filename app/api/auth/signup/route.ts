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

    const existing: any = await query('SELECT user_id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, userRole]
    )

    return NextResponse.json({ success: true, message: 'Account created successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
