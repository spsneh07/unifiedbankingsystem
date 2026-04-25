import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLE_ROUTES: Record<string, string[]> = {
  admin:    ['/admin'],
  employee: ['/employee'],
  customer: ['/dashboard', '/accounts', '/transactions', '/analytics', '/alerts', '/scheduled', '/credit-cards', '/loans'],
}

const PUBLIC_PATHS = ['/', '/auth', '/api', '/signup']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function getRoleHome(role: string): string {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/dashboard'
}

function isAllowed(role: string, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role] || []
  return allowed.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public paths and static assets
  if (
    isPublic(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const role = request.cookies.get('ub_role')?.value

  // No session → redirect to login
  if (!role) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role access
  if (!isAllowed(role, pathname)) {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
