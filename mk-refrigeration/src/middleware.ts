import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

// These paths require role === 'ADMIN' (on top of being authenticated)
const ADMIN_ONLY_PATHS = ['/admin/staff', '/admin/reports']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Deny-by-default: every /admin/* path is protected except /admin/login
  const isAdminProtected =
    (pathname === '/admin' || pathname.startsWith('/admin/')) &&
    pathname !== '/admin/login' &&
    !pathname.startsWith('/admin/login/')

  if (!isAdminProtected) {
    return withSecurityHeaders(NextResponse.next())
  }

  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie) : null

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const requiresAdmin = ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (requiresAdmin && session.role !== 'ADMIN') {
    const url = new URL('/admin/dashboard', request.url)
    url.searchParams.set('error', 'You do not have permission to access that page.')
    return NextResponse.redirect(url)
  }

  return withSecurityHeaders(NextResponse.next())
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  const h = response.headers
  h.set('X-Frame-Options', 'SAMEORIGIN')
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
