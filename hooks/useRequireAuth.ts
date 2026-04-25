'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, UserRole } from '@/lib/auth'

/**
 * Call at the top of any protected page.
 * allowedRoles: which roles can access the page.
 * If no session → redirect to /auth/login
 * If wrong role → redirect to user's own dashboard
 */
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const router = useRouter()

  useEffect(() => {
    const session = getSession()

    if (!session) {
      router.replace('/auth/login')
      return
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      // Redirect to their own dashboard
      router.replace('/dashboard')
    }
  }, [router])

  return getSession()
}
