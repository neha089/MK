import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const ADMIN_PATHS = [
  '/admin/dashboard', '/admin/products', '/admin/categories', '/admin/brands',
  '/admin/inventory', '/admin/suppliers', '/admin/purchases', '/admin/sales',
  '/admin/quotations', '/admin/customers', '/admin/enquiries', '/admin/staff',
  '/admin/offers', '/admin/reports',
]

// These paths require role === 'ADMIN'
const ADMIN_ONLY_PATHS = ['/admin/staff', '/admin/reports']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminProtected = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

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
