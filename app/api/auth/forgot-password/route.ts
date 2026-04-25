import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const users: any = await query('SELECT user_id FROM users WHERE email = ?', [email])
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const rawToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    await query('DELETE FROM password_resets WHERE email = ?', [email])
    await query('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [
      email,
      rawToken,
      expiresAt,
    ])

    return NextResponse.json({ success: true, token: rawToken })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

