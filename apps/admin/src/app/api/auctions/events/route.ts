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

  if (typeof title !== 'string' || !title.trim() || title.length > 120)
    return badRequest('A title (up to 120 characters) is required.')
  if (description != null && (typeof description !== 'string' || description.length > 2000))
    return badRequest('Description is too long.')

  const sub = new Date(submissionDeadline)
  const cat = new Date(catalogueOpenDate)
  const start = new Date(biddingStartDate)
  const end = new Date(biddingEndDate)
  if ([sub, cat, start, end].some(d => Number.isNaN(d.getTime())))
    return badRequest('All four dates are required and must be valid.')

  // The event lifecycle depends on this order — reject anything that would break it
  if (!(sub <= cat && cat <= start && start < end))
    return badRequest('Dates must run in order: submission deadline → catalogue open → bidding start → bidding end.')

  const event = await createAuctionEvent({
    title: title.trim(), description, theme,
    submissionDeadline, catalogueOpenDate, biddingStartDate, biddingEndDate,
  })
  return NextResponse.json(event)
}
