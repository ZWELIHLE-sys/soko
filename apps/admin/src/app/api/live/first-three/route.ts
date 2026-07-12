import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const now = new Date()
  const liveMarket = await prisma.market.findFirst({
    where:  { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    select: { id: true, title: true, startDate: true, endDate: true },
  })

  // If no market is live, show the most recent market's first three instead
  const market = liveMarket ?? await prisma.market.findFirst({
    where:   { isActive: true },
    orderBy: { endDate: 'desc' },
    select:  { id: true, title: true, startDate: true, endDate: true },
  })

  if (!market) return NextResponse.json({ market: null, orders: [] })

  const orders = await prisma.order.findMany({
    where:   { firstThreeMarketId: market.id },
    orderBy: { createdAt: 'asc' },
    take: 3,
    include: {
      buyer:  { select: { name: true, email: true, phone: true } },
      seller: { select: { brandName: true } },
    },
  })

  return NextResponse.json({ market: { ...market, isLive: !!liveMarket }, orders })
}
