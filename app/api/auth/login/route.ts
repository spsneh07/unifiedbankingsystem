import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const users: any = await query(
      `SELECT user_id as id, email, password_hash as password, role, customer_id 
       FROM users 
       WHERE email = ?`,
      [email]
    )

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const user = users[0]

    let passwordMatch = false
    if (user.password) {
      const isBcrypt = user.password.startsWith('$2')
      if (isBcrypt) {
        passwordMatch = await bcrypt.compare(password, user.password)
      } else {
        passwordMatch = user.password === password
      }
    }

    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role as 'admin' | 'employee' | 'customer',
      customer_id: user.customer_id,
    }

    const response = NextResponse.json({ success: true, user: userData })
    response.cookies.set('ub_role', user.role, { httpOnly: false, maxAge: 60 * 60 * 8, path: '/' })
    response.cookies.set('ub_user_id', String(user.id), { httpOnly: false, maxAge: 60 * 60 * 8, path: '/' })

    return response
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
