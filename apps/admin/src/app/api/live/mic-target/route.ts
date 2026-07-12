import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

// How long the mic stays warm after an event ends — the formal closing window
export const CLOSING_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Which event does the MARKET/AUCTION mic currently speak into?
 * Mirrors exactly what the public pages feature, plus the closing window:
 *   UPCOMING → event exists, not started; LIVE → happening now;
 *   CLOSING → ended less than 24h ago (formal close allowed); NONE → mic off.
 */
export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const channel = new URL(req.url).searchParams.get('channel')
  const now = new Date()
  const graceCutoff = new Date(now.getTime() - CLOSING_WINDOW_MS)

  if (channel === 'MARKET') {
    const market = await prisma.market.findFirst({
      where:   { isActive: true, endDate: { gte: graceCutoff } },
      orderBy: { startDate: 'asc' },
      select:  { id: true, title: true, startDate: true, endDate: true },
    })
    if (!market) return NextResponse.json({ event: null, state: 'NONE' })

    const state = now < market.startDate ? 'UPCOMING' : now <= market.endDate ? 'LIVE' : 'CLOSING'
    return NextResponse.json({ event: market, state })
  }

  if (channel === 'AUCTION') {
    // Same featured-event priority as the public auctions page: LIVE → CATALOGUE_OPEN → ANNOUNCED
    const activeEvents = await prisma.auctionEvent.findMany({
      where:   { isActive: true, status: { in: ['LIVE', 'CATALOGUE_OPEN', 'ANNOUNCED'] } },
      orderBy: { biddingStartDate: 'asc' },
      select:  { id: true, title: true, status: true, biddingStartDate: true, biddingEndDate: true },
    })
    const featured =
      activeEvents.find(e => e.status === 'LIVE') ??
      activeEvents.find(e => e.status === 'CATALOGUE_OPEN') ??
      activeEvents[0]

    if (featured) {
      const state = featured.status === 'LIVE' ? 'LIVE' : 'UPCOMING'
      return NextResponse.json({ event: featured, state })
    }

    // No running event — is one still inside its closing window?
    const justEnded = await prisma.auctionEvent.findFirst({
      where:   { isActive: true, status: 'ENDED', biddingEndDate: { gte: graceCutoff } },
      orderBy: { biddingEndDate: 'desc' },
      select:  { id: true, title: true, status: true, biddingStartDate: true, biddingEndDate: true },
    })
    if (justEnded) return NextResponse.json({ event: justEnded, state: 'CLOSING' })

    return NextResponse.json({ event: null, state: 'NONE' })
  }

  return badRequest('channel must be MARKET or AUCTION.')
}
