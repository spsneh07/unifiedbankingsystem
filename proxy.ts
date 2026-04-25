import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLE_ROUTES: Record<string, string[]> = {
  admin:    ['/admin'],
  employee: ['/employee'],
  customer: ['/dashboard', '/accounts', '/transactions', '/analytics', '/alerts', '/scheduled', '/credit-cards', '/loans', '/branches'],
}

const PUBLIC_PATHS = ['/', '/auth', '/api', '/signup', '/branches']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function getRoleHome(role: string): string {
  const r = role.toLowerCase()
  if (r === 'admin') return '/admin'
  if (r === 'employee') return '/employee'
  return '/dashboard'
}

function isAllowed(role: string, pathname: string): boolean {
  const normalizedRole = role.toLowerCase()
  const allowed = ROLE_ROUTES[normalizedRole] || []
  return allowed.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export default function proxy(request: NextRequest) {
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
