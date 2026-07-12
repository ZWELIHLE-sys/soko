import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

// How long a room keeps showing its event after it ends — the formal closing window
const CLOSING_WINDOW_MS = 24 * 60 * 60 * 1000

// One poll for everything the live layer needs: the day's announcements,
// the featured maker, and the current market/auction events for the drumbeat
// and the room feeds. Events stay visible through their closing window so the
// MC's formal close is heard.
export async function GET() {
  const now = new Date()
  const graceCutoff = new Date(now.getTime() - CLOSING_WINDOW_MS)

  const [announcements, featuredMaker, currentMarket, gracedMarket, activeAuctions, gracedAuction] = await Promise.all([
    // The MC's day: everything sent in the last 24h that wasn't manually ended.
    // Clients split this into "on air" (not expired) vs "earlier today".
    prisma.announcement.findMany({
      where: {
        isActive: true,
        createdAt: { gte: graceCutoff },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true, message: true, link: true, kind: true, channel: true,
        marketId: true, auctionEventId: true, expiresAt: true, createdAt: true,
      },
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
    // Just-ended market still inside its closing window
    prisma.market.findFirst({
      where: { isActive: true, endDate: { gte: graceCutoff, lt: now } },
      orderBy: { endDate: 'desc' },
      select: { id: true, title: true, startDate: true, endDate: true },
    }),
    prisma.auctionEvent.findMany({
      where: { isActive: true, status: { in: ['LIVE', 'CATALOGUE_OPEN', 'ANNOUNCED'] } },
      orderBy: { biddingStartDate: 'asc' },
      select: {
        id: true, title: true, status: true,
        catalogueOpenDate: true, biddingStartDate: true, biddingEndDate: true,
      },
    }),
    prisma.auctionEvent.findFirst({
      where: { isActive: true, status: 'ENDED', biddingEndDate: { gte: graceCutoff } },
      orderBy: { biddingEndDate: 'desc' },
      select: {
        id: true, title: true, status: true,
        catalogueOpenDate: true, biddingStartDate: true, biddingEndDate: true,
      },
    }),
  ])

  // Same featured priority as the auctions page: LIVE → CATALOGUE_OPEN → ANNOUNCED,
  // falling back to a just-ended event so the formal close is heard.
  const nextAuction =
    activeAuctions.find(e => e.status === 'LIVE') ??
    activeAuctions.find(e => e.status === 'CATALOGUE_OPEN') ??
    activeAuctions[0] ??
    gracedAuction ??
    null

  const nextMarket = currentMarket ?? gracedMarket ?? null

  return NextResponse.json({ announcements, featuredMaker, nextMarket, nextAuction })
}
