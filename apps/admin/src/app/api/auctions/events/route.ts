import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { listAuctionEvents, createAuctionEvent } from '@/services/auctions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const events = await listAuctionEvents()
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await req.json()
  const { title, description, theme, submissionDeadline, catalogueOpenDate, biddingStartDate, biddingEndDate } = body

  if (!title || !submissionDeadline || !catalogueOpenDate || !biddingStartDate || !biddingEndDate)
    return badRequest('Missing required fields')

  const event = await createAuctionEvent({
    title, description, theme,
    submissionDeadline, catalogueOpenDate, biddingStartDate, biddingEndDate,
  })
  return NextResponse.json(event)
}
