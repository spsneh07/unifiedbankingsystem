'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type UserRole = 'admin' | 'employee' | 'customer'

export interface SessionUser {
  id: number
  email: string
  role: UserRole
  customer_id: number | null
}

interface SessionContextValue {
  user: SessionUser | null
  loading: boolean
  setUser: (user: SessionUser | null) => void
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: async () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load session from localStorage once (client-side only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ub_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.id && parsed?.role) {
          setUserState(parsed)
        }
      }
    } catch {
      localStorage.removeItem('ub_user')
    } finally {
      setLoading(false)
    }
  }, [])

  const setUser = useCallback((newUser: SessionUser | null) => {
    setUserState(newUser)
    if (newUser) {
      localStorage.setItem('ub_user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('ub_user')
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Best-effort
    }
    setUserState(null)
    localStorage.removeItem('ub_user')
    // Clear only our cookies (not all cookies)
    document.cookie = 'ub_role=;path=/;max-age=0'
    document.cookie = 'ub_user_id=;path=/;max-age=0'
    document.cookie = 'ub_session=;path=/;max-age=0'
    router.replace('/')
  }, [router])

  return (
    <SessionContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}

export function getDashboardByRole(role: UserRole): string {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/dashboard'
}
