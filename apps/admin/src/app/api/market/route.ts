import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { listMarkets, createMarket } from '@/services/market'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const markets = await listMarkets()
  return NextResponse.json(markets)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await req.json()
  const { marketType, title, description, theme, startDate, endDate, applicationDeadline, maxListings, welcomeVideoUrl } = body

  if (typeof title !== 'string' || !title.trim() || title.length > 120)
    return badRequest('A title (up to 120 characters) is required.')

  const start = new Date(startDate)
  const end = new Date(endDate)
  const deadline = new Date(applicationDeadline)
  if ([start, end, deadline].some(d => Number.isNaN(d.getTime())))
    return badRequest('Start, end and application deadline dates are required and must be valid.')
  if (!(deadline <= start && start < end))
    return badRequest('Dates must run in order: application deadline → market start → market end.')

  const market = await createMarket({
    marketType,
    title,
    description,
    theme,
    startDate,
    endDate,
    applicationDeadline,
    maxListings: maxListings ? parseInt(maxListings) : null,
    welcomeVideoUrl,
  })

  return NextResponse.json(market)
}
