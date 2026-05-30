import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, notFound } from '@/lib/auth-helpers'
import { getAuctionItem, updateAuctionItem } from '@/services/auctions'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const item = await getAuctionItem(id)
  if (!item) return notFound()
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const { status, adminNote } = await req.json()
  const auction = await updateAuctionItem(id, { status, adminNote })
  return NextResponse.json(auction)
}
