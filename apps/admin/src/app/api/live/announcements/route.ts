import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

// GLOBAL = the marketing mic (site-wide strip). SHOP = the shop room (no event
// structure). MARKET/AUCTION announcements must anchor to an actual event.
const CHANNELS = ['GLOBAL', 'MARKET', 'AUCTION', 'SHOP'] as const

const CLOSING_WINDOW_MS = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const channel        = url.searchParams.get('channel')
  const marketId       = url.searchParams.get('marketId')
  const auctionEventId = url.searchParams.get('auctionEventId')

  const announcements = await prisma.announcement.findMany({
    where: {
      ...(channel ? { channel } : {}),
      ...(marketId ? { marketId } : {}),
      ...(auctionEventId ? { auctionEventId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      market:       { select: { title: true } },
      auctionEvent: { select: { title: true } },
    },
  })
  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { message, link, kind, channel, pieceId, marketId, auctionEventId, expiresInMinutes } = await req.json()
  if (!message?.trim()) return badRequest('Message is required.')
  if (message.length > 200) return badRequest('Keep announcements under 200 characters.')
  if (channel && !CHANNELS.includes(channel)) return badRequest('Unknown channel.')

  const now = new Date()
  const chosenExpiry = expiresInMinutes
    ? new Date(now.getTime() + Number(expiresInMinutes) * 60 * 1000)
    : null
  let expiresAt = chosenExpiry
  let eventData: { marketId?: string; auctionEventId?: string } = {}

  // Market/auction mics must speak into a real event that is still warm
  // (upcoming, live, or inside the 24h formal closing window).
  if (channel === 'MARKET') {
    if (!marketId) return badRequest('This announcement must belong to a market event.')
    const market = await prisma.market.findUnique({
      where:  { id: marketId },
      select: { endDate: true, isActive: true },
    })
    if (!market || !market.isActive) return badRequest('Market event not found.')
    const micCold = market.endDate.getTime() + CLOSING_WINDOW_MS < now.getTime()
    if (micCold) return badRequest('This market closed more than 24 hours ago — the mic is off.')

    // Default expiry: die with the event; closing messages get the closing window.
    const eventEnd = market.endDate.getTime()
    const hardCap  = eventEnd + CLOSING_WINDOW_MS
    const fallback = now.getTime() < eventEnd ? eventEnd : hardCap
    expiresAt = new Date(Math.min(chosenExpiry?.getTime() ?? fallback, hardCap))
    eventData = { marketId }
  }

  if (channel === 'AUCTION') {
    if (!auctionEventId) return badRequest('This announcement must belong to an auction event.')
    const event = await prisma.auctionEvent.findUnique({
      where:  { id: auctionEventId },
      select: { biddingEndDate: true, isActive: true },
    })
    if (!event || !event.isActive) return badRequest('Auction event not found.')
    const micCold = event.biddingEndDate.getTime() + CLOSING_WINDOW_MS < now.getTime()
    if (micCold) return badRequest('This auction closed more than 24 hours ago — the mic is off.')

    const eventEnd = event.biddingEndDate.getTime()
    const hardCap  = eventEnd + CLOSING_WINDOW_MS
    const fallback = now.getTime() < eventEnd ? eventEnd : hardCap
    expiresAt = new Date(Math.min(chosenExpiry?.getTime() ?? fallback, hardCap))
    eventData = { auctionEventId }
  }

  const announcement = await prisma.announcement.create({
    data: {
      message:   message.trim(),
      link:      link?.trim() || null,
      kind:      kind || 'GENERAL',
      channel:   channel || 'GLOBAL',
      pieceId:   pieceId || null,
      isActive:  true,
      expiresAt,
      ...eventData,
    },
  })
  return NextResponse.json(announcement, { status: 201 })
}
