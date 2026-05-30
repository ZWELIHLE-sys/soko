import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const buyers = await prisma.user.findMany({
    where: { role: 'BUYER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true, createdAt: true,
      location: { select: { name: true } },
      _count: { select: { orders: true, reviews: true } },
    },
  })

  return NextResponse.json(buyers)
}
