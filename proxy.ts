import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/employee', '/accounts', '/transactions', '/analytics', '/alerts', '/loans', '/credit-cards', '/scheduled']

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/login', '/signup']

// Role-based route access
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/employee': ['employee', 'admin'],
}

// Must export default or named 'proxy'
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read role cookie (not httpOnly — readable in proxy)
  const role = request.cookies.get('ub_role')?.value
  const hasSession = request.cookies.has('ub_session') || request.cookies.has('ub_user_id')

  // Check if route requires auth
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && hasSession && role) {
    const dashboardPath = role === 'admin' ? '/admin' : role === 'employee' ? '/employee' : '/dashboard'
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  // Role-based access control
  if (hasSession && role) {
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(routePrefix) && !allowedRoles.includes(role)) {
        // Redirect to their own dashboard
        const dashboardPath = role === 'admin' ? '/admin' : role === 'employee' ? '/employee' : '/dashboard'
        return NextResponse.redirect(new URL(dashboardPath, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - /api/* (proxied to Express backend)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)',
  ],
}
