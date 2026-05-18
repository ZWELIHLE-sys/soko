import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Seller tries to access buyer dashboard
    if (path.startsWith('/buyer') && token?.role !== 'BUYER') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Buyer tries to access seller dashboard
    if (path.startsWith('/seller') && token?.role !== 'SELLER') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Non-admin tries to access admin panel
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/buyer/:path*', '/seller/:path*', '/admin/:path*']
}