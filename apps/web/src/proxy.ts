import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname

  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  if (path.startsWith('/buyer') && token.role !== 'BUYER')
    return NextResponse.redirect(new URL('/login', req.url))

  if (path.startsWith('/seller') && token.role !== 'SELLER')
    return NextResponse.redirect(new URL('/login', req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/buyer/:path*', '/seller/:path*'],
}
