'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, UserRole } from '@/components/SessionProvider'

/**
 * Call at the top of any protected page.
 * allowedRoles: which roles can access the page.
 * If no session → redirect to /auth/login
 * If wrong role → redirect to user's own dashboard
 */
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const router = useRouter()
  const { user, loading } = useSession()

  useEffect(() => {
    if (loading) return // Wait for session to load

    if (!user) {
      router.replace('/auth/login')
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their own dashboard
      const dashboardPath = user.role === 'admin' ? '/admin' : user.role === 'employee' ? '/employee' : '/dashboard'
      router.replace(dashboardPath)
    }
  }, [user, loading, router, allowedRoles])

  return { user, loading }
}
