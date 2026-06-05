import { prisma, tickEventLifecycle } from '@vuna/db'

export async function listAuctionEvents() {
  await tickEventLifecycle()
  return prisma.auctionEvent.findMany({
    orderBy: { biddingStartDate: 'desc' },
    include: {
      _count: { select: { items: true } },
      items: { where: { status: 'PENDING' }, select: { id: true } },
    },
  })
}

export async function createAuctionEvent(data: {
  title: string
  description?: string
  theme?: string
  submissionDeadline: string
  catalogueOpenDate: string
  biddingStartDate: string
  biddingEndDate: string
}) {
  return prisma.auctionEvent.create({
    data: {
      title:              data.title,
      description:        data.description || null,
      theme:              data.theme || null,
      submissionDeadline: new Date(data.submissionDeadline),
      catalogueOpenDate:  new Date(data.catalogueOpenDate),
      biddingStartDate:   new Date(data.biddingStartDate),
      biddingEndDate:     new Date(data.biddingEndDate),
    },
  })
}

export async function getAuctionEvent(eventId: string) {
  await tickEventLifecycle()
  return prisma.auctionEvent.findUnique({
    where: { id: eventId },
    include: {
      items: {
        include: {
          seller: {
            select: {
              brandName: true,
              locationId: true,
              location: { select: { name: true } },
            },
          },
          category: { select: { name: true } },
          winner: {
            select: {
              name: true,
              locationId: true,
              location: { select: { name: true } },
            },
          },
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function setEventStatus(eventId: string, status: string) {
  if (status === 'LIVE') {
    await prisma.auction.updateMany({
      where: { auctionEventId: eventId, status: 'APPROVED' },
      data:  { status: 'LIVE' },
    })
  } else if (status === 'ENDED') {
    // Close items AND assign winners (highest bidder wins regardless of reserve)
    const items = await prisma.auction.findMany({
      where:  { auctionEventId: eventId, status: { in: ['APPROVED', 'LIVE'] } },
      select: {
        id: true,
        bids: { orderBy: { amount: 'desc' }, take: 1, select: { bidderId: true } },
      },
    })
    await Promise.all(items.map(item =>
      prisma.auction.update({
        where: { id: item.id },
        data:  { status: 'ENDED', winnerId: item.bids[0]?.bidderId ?? null },
      })
    ))
  }

  return prisma.auctionEvent.update({
    where: { id: eventId },
    data:  { status: status as never },
  })
}

export async function getAuctionItem(itemId: string) {
  return prisma.auction.findUnique({
    where: { id: itemId },
    include: {
      seller: {
        select: {
          brandName: true,
          locationId: true,
          location: { select: { name: true } },
        },
      },
      category: { select: { name: true } },
      winner: {
        select: {
          name: true,
          locationId: true,
          location: { select: { name: true } },
        },
      },
      bids: {
        orderBy: { amount: 'desc' },
        include: { bidder: { select: { name: true } } },
      },
    },
  })
}

export async function updateAuctionItem(itemId: string, data: { status: string; adminNote?: string }) {
  return prisma.auction.update({
    where: { id: itemId },
    data: { status: data.status as never, adminNote: data.adminNote ?? null },
  })
}
