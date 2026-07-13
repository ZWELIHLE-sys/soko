import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function requireSeller() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') return null
  return prisma.seller.findUnique({ where: { email: session.user.email! } })
}

export async function requireBuyerId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'BUYER') return null
  return session.user.id
}

export async function requireBuyer() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'BUYER') return null
  return prisma.user.findUnique({ where: { id: session.user.id } })
}

// Any authenticated user (buyer or seller) — used by shared endpoints like uploads
export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session
}

export function unauthorized(msg = 'Unauthorised') {
  return NextResponse.json({ error: msg }, { status: 401 })
}

export function forbidden(msg = 'Forbidden') {
  return NextResponse.json({ error: msg }, { status: 403 })
}

export function notFound(msg = 'Not found') {
  return NextResponse.json({ error: msg }, { status: 404 })
}

export function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 })
}
