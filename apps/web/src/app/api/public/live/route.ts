import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

// One poll for everything the live layer needs: active announcements,
// the featured maker, and the next market/auction dates for the drumbeat.
export async function GET() {
  const now = new Date()

  const [announcements, featuredMaker, nextMarket, nextAuction] = await Promise.all([
    // The MC's day: everything sent in the last 24h that wasn't manually ended.
    // Clients split this into "on air" (not expired) vs "earlier today" (feed history).
    prisma.announcement.findMany({
      where: {
        isActive: true,
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, message: true, link: true, kind: true, channel: true, expiresAt: true, createdAt: true },
    }),
    prisma.featuredMaker.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        note: true,
        weekStart: true,
        seller: {
          select: {
            id: true, brandName: true, avatar: true, bio: true,
            location: { select: { name: true } },
            category: { select: { name: true, icon: true } },
          },
        },
      },
    }),
    prisma.market.findFirst({
      where: { isActive: true, endDate: { gte: now } },
      orderBy: { startDate: 'asc' },
      select: { id: true, title: true, startDate: true, endDate: true },
    }),
    prisma.auctionEvent.findFirst({
      where: { isActive: true, biddingEndDate: { gte: now } },
      orderBy: { biddingStartDate: 'asc' },
      select: {
        id: true, title: true,
        catalogueOpenDate: true, biddingStartDate: true, biddingEndDate: true,
      },
    }),
  ])

  return NextResponse.json({ announcements, featuredMaker, nextMarket, nextAuction })
}
