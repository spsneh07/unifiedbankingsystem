import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
    }
    if (!newPassword) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 })
    }

    const rows: any = await query('SELECT id, email, expires_at FROM password_resets WHERE token = ? LIMIT 1', [token])

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 })
    }

    const reset = rows[0]
    const expiresAt = new Date(reset.expires_at)
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      await query('DELETE FROM password_resets WHERE id = ?', [reset.id])
      return NextResponse.json({ success: false, error: 'Token expired' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, reset.email])
    await query('DELETE FROM password_resets WHERE id = ?', [reset.id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

