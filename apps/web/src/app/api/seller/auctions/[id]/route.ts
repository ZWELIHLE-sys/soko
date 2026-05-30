import { NextResponse } from 'next/server'
import { requireSeller, unauthorized, notFound } from '@/lib/auth-helpers'
import { getSellerAuction } from '@/services/auctions'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const { id } = await params
  const auction = await getSellerAuction(seller.id, id)
  if (!auction) return notFound()

  return NextResponse.json(auction)
}
