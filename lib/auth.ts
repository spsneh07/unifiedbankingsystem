/**
 * Shared auth utilities — client-side session management.
 * Note: Components should prefer useSession() from SessionProvider.
 * These helpers are for the login/signup flow before the context is available.
 */

export type UserRole = 'admin' | 'employee' | 'customer'

export interface SessionUser {
  id: number
  email: string
  role: UserRole
  customer_id: number | null
}

const SESSION_KEY = 'ub_user'

export function saveSession(user: SessionUser) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  // Set non-httpOnly cookies so Next.js middleware can read role for routing
  const maxAge = 60 * 60 * 8 // 8 hours
  document.cookie = `ub_role=${user.role};path=/;max-age=${maxAge};SameSite=Lax`
  document.cookie = `ub_user_id=${user.id};path=/;max-age=${maxAge};SameSite=Lax`
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.id || !parsed?.role) return null
    return parsed
  } catch {
    return null
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  // Only clear our own session key, not all localStorage
  localStorage.removeItem(SESSION_KEY)
  // Clear cookies
  document.cookie = 'ub_role=;path=/;max-age=0;SameSite=Lax'
  document.cookie = 'ub_user_id=;path=/;max-age=0;SameSite=Lax'
  document.cookie = 'ub_session=;path=/;max-age=0;SameSite=Lax'
}

export function getDashboardByRole(role: UserRole): string {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/dashboard'
}
