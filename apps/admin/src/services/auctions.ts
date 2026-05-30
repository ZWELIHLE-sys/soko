import { prisma } from '@vuna/db'

export async function listAuctionEvents() {
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
  return prisma.auctionEvent.findUnique({
    where: { id: eventId },
    include: {
      items: {
        include: {
          seller:   { select: { brandName: true } },
          category: { select: { name: true } },
          winner:   { select: { name: true } },
          _count:   { select: { bids: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function setEventStatus(eventId: string, status: string) {
  const [event] = await Promise.all([
    prisma.auctionEvent.update({ where: { id: eventId }, data: { status: status as never } }),
    status === 'LIVE'
      ? prisma.auction.updateMany({ where: { auctionEventId: eventId, status: 'APPROVED' }, data: { status: 'LIVE' } })
      : Promise.resolve(),
    status === 'ENDED'
      ? prisma.auction.updateMany({ where: { auctionEventId: eventId, status: 'LIVE' }, data: { status: 'ENDED' } })
      : Promise.resolve(),
  ])
  return event
}

export async function getAuctionItem(itemId: string) {
  return prisma.auction.findUnique({
    where: { id: itemId },
    include: {
      seller:   { select: { brandName: true } },
      category: { select: { name: true } },
      winner:   { select: { name: true } },
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
