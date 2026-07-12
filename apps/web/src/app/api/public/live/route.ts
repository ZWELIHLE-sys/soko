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

  // ── The crowd noise ──────────────────────────────────────────────────
  // A real MC never lets the room go quiet. Real activity during a live
  // event becomes auto-moments in the feed — sellers celebrated by name,
  // buyers always anonymous. Derived at read time: nothing stored, nothing
  // for the admin to manage, and the human MC's voice stays the soul.
  type Moment = {
    id: string; message: string; link: string | null; kind: string; channel: string
    marketId: string | null; auctionEventId: string | null
    expiresAt: Date; createdAt: Date
  }
  const FRESH_MS = 15 * 60 * 1000 // moments glow as "on air" for 15 min, then settle into history
  const moments: Moment[] = []

  if (nextMarket && now >= new Date(nextMarket.startDate)) {
    const marketSales = await prisma.order.findMany({
      where: {
        createdAt: { gte: nextMarket.startDate },
        status:    { not: 'CANCELLED' },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, status: true, createdAt: true,
        seller: { select: { brandName: true } },
        items:  { take: 1, select: { quantity: true, product: { select: { name: true, yieldUnit: true } } } },
      },
    })
    for (const o of marketSales) {
      const item = o.items[0]
      if (!item) continue
      moments.push(o.status === 'RESERVED'
        ? {
            id: `auto-reserve-${o.id}`,
            message: `Harvest claimed — ${item.quantity} ${item.product.yieldUnit ?? ''} of “${item.product.name}” reserved from ${o.seller.brandName}.`,
            link: null, kind: 'HARVEST', channel: 'MARKET',
            marketId: nextMarket.id, auctionEventId: null,
            expiresAt: new Date(o.createdAt.getTime() + FRESH_MS), createdAt: o.createdAt,
          }
        : {
            id: `auto-sale-${o.id}`,
            message: `SOLD — “${item.product.name}” from ${o.seller.brandName} finds a home. Sivunile.`,
            link: null, kind: 'HAMMER', channel: 'MARKET',
            marketId: nextMarket.id, auctionEventId: null,
            expiresAt: new Date(o.createdAt.getTime() + FRESH_MS), createdAt: o.createdAt,
          })
    }
  }

  if (nextAuction && now >= new Date(nextAuction.biddingStartDate)) {
    const recentBids = await prisma.bid.findMany({
      where: {
        createdAt: { gte: nextAuction.biddingStartDate },
        auction:   { auctionEventId: nextAuction.id },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, amount: true, createdAt: true,
        auction: { select: { id: true, title: true } },
      },
    })
    for (const b of recentBids) {
      moments.push({
        id: `auto-bid-${b.id}`,
        message: `New bid — R${b.amount.toFixed(2)} on “${b.auction.title}”. The hammer is warming.`,
        link: `/auctions/${b.auction.id}`, kind: 'BID', channel: 'AUCTION',
        marketId: null, auctionEventId: nextAuction.id,
        expiresAt: new Date(b.createdAt.getTime() + FRESH_MS), createdAt: b.createdAt,
      })
    }
  }

  // MC's own words first at equal times; newest overall first; cap the feed
  const feed = [...announcements, ...moments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 14)

  return NextResponse.json({ announcements: feed, featuredMaker, nextMarket, nextAuction })
}
