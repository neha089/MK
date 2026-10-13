import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const ADMIN_PATHS = ['/admin/dashboard', '/admin/products', '/admin/categories', '/admin/brands',
  '/admin/inventory', '/admin/purchases', '/admin/sales', '/admin/quotations',
  '/admin/customers', '/admin/enquiries', '/admin/staff', '/admin/offers']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminProtected = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (!isAdminProtected) return NextResponse.next()

  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie) : null

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
