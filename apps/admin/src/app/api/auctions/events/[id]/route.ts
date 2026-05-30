import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized, notFound } from '@/lib/auth-helpers'
import { getAuctionEvent, setEventStatus } from '@/services/auctions'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const event = await getAuctionEvent(id)
  if (!event) return notFound()
  return NextResponse.json(event)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const { status } = await req.json()
  const event = await setEventStatus(id, status)
  return NextResponse.json(event)
}
