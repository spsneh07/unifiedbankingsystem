// Shared auth utilities — client-side only

export type UserRole = 'admin' | 'employee' | 'customer'

export interface SessionUser {
  id: number
  email: string
  role: UserRole
}

export function saveSession(user: any) {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
  localStorage.setItem('user', JSON.stringify(user))
  // Also set a cookie so server can read it
  document.cookie = `ub_role=${user.role};path=/;max-age=${60 * 60 * 8}`
  document.cookie = `ub_user_id=${user.id};path=/;max-age=${60 * 60 * 8}`
}

export function getSession(): any | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.clear()
  document.cookie = 'ub_role=;path=/;max-age=0'
  document.cookie = 'ub_user_id=;path=/;max-age=0'
}

export function getDashboardByRole(role: UserRole): string {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/dashboard'
}
