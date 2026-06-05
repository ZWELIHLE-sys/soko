import { prisma } from './index'

/**
 * Single source of truth for event lifecycle transitions.
 * Runs cheap queries that only return rows needing change.
 * Safe to call on every public page load.
 */
export async function tickEventLifecycle() {
  const now = new Date()
  await Promise.all([
    tickAuctionEvents(now),
    tickMarketApplications(now),
  ])
}

async function tickAuctionEvents(now: Date) {
  // 1) ANNOUNCED → CATALOGUE_OPEN when catalogueOpenDate has passed (but bidding hasn't started)
  await prisma.auctionEvent.updateMany({
    where: {
      status: 'ANNOUNCED',
      catalogueOpenDate: { lte: now },
      biddingStartDate:  { gt: now },
    },
    data: { status: 'CATALOGUE_OPEN' },
  })

  // 2) ANNOUNCED or CATALOGUE_OPEN → LIVE when biddingStartDate has passed
  //    Promote all APPROVED items into the event to LIVE simultaneously.
  const toGoLive = await prisma.auctionEvent.findMany({
    where: {
      status:           { in: ['ANNOUNCED', 'CATALOGUE_OPEN'] },
      biddingStartDate: { lte: now },
      biddingEndDate:   { gt: now },
    },
    select: { id: true },
  })
  if (toGoLive.length > 0) {
    const ids = toGoLive.map(e => e.id)
    await Promise.all([
      prisma.auctionEvent.updateMany({
        where: { id: { in: ids } },
        data:  { status: 'LIVE' },
      }),
      prisma.auction.updateMany({
        where: { auctionEventId: { in: ids }, status: 'APPROVED' },
        data:  { status: 'LIVE' },
      }),
    ])
  }

  // 3) Anything before ENDED → ENDED when biddingEndDate has passed.
  //    For each item, the highest bidder wins (reserve price is guidance only).
  const toEnd = await prisma.auctionEvent.findMany({
    where: {
      status:         { in: ['ANNOUNCED', 'CATALOGUE_OPEN', 'LIVE'] },
      biddingEndDate: { lte: now },
    },
    select: {
      id: true,
      items: {
        where: { status: { in: ['APPROVED', 'LIVE'] } },
        select: {
          id: true,
          bids: {
            orderBy: { amount: 'desc' },
            take:    1,
            select:  { bidderId: true },
          },
        },
      },
    },
  })

  if (toEnd.length > 0) {
    const eventIds = toEnd.map(e => e.id)
    const itemUpdates = toEnd.flatMap(event =>
      event.items.map(item =>
        prisma.auction.update({
          where: { id: item.id },
          data:  {
            status:   'ENDED',
            winnerId: item.bids[0]?.bidderId ?? null,
          },
        })
      )
    )

    await Promise.all([
      ...itemUpdates,
      prisma.auctionEvent.updateMany({
        where: { id: { in: eventIds } },
        data:  { status: 'ENDED' },
      }),
    ])
  }
}

async function tickMarketApplications(now: Date) {
  // PENDING listings whose market application deadline has passed → REJECTED with a clear note.
  const stale = await prisma.marketListing.findMany({
    where: {
      status: 'PENDING',
      market: { applicationDeadline: { lte: now } },
    },
    select: { id: true },
  })

  if (stale.length > 0) {
    await prisma.marketListing.updateMany({
      where: { id: { in: stale.map(s => s.id) } },
      data:  {
        status:    'REJECTED',
        adminNote: 'Application deadline passed before review.',
      },
    })
  }
}
