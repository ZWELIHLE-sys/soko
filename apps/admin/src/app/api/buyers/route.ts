import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const locationId = new URL(req.url).searchParams.get('locationId') ?? undefined

  const buyers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      ...(locationId ? { locationId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true, createdAt: true,
      status: true, isVerified: true, isAdminVerified: true, suburb: true,
      location: { select: { name: true } },
      _count: { select: { orders: true, reviews: true } },
    },
  })

  return NextResponse.json(buyers)
}
