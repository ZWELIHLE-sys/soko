import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

/**
 * Metadata for the admin piece-promotion modals — upcoming markets + auction events
 * that pieces can be assigned to.
 */
export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const now = new Date()

  const [markets, auctionEvents] = await Promise.all([
    prisma.market.findMany({
      where:  { isActive: true, endDate: { gte: now } },
      orderBy: { startDate: 'asc' },
      select: { id: true, title: true, startDate: true, endDate: true, marketType: true },
    }),
    prisma.auctionEvent.findMany({
      where:  { isActive: true, biddingEndDate: { gte: now } },
      orderBy: { biddingStartDate: 'asc' },
      select: { id: true, title: true, biddingStartDate: true, biddingEndDate: true, status: true },
    }),
  ])

  return NextResponse.json({ markets, auctionEvents })
}
