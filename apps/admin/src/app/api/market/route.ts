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
  const { marketType, title, description, theme, startDate, endDate, applicationDeadline, maxListings } = body

  if (!title || !startDate || !endDate || !applicationDeadline)
    return badRequest('Missing required fields')

  const market = await createMarket({
    marketType,
    title,
    description,
    theme,
    startDate,
    endDate,
    applicationDeadline,
    maxListings: maxListings ? parseInt(maxListings) : null,
  })

  return NextResponse.json(market)
}
