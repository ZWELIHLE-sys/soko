import { NextResponse } from 'next/server'
import { requireSeller, unauthorized, forbidden, badRequest } from '@/lib/auth-helpers'
import { getSellerAuctions, submitAuction } from '@/services/auctions'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const auctions = await getSellerAuctions(seller.id)
  return NextResponse.json(auctions)
}

export async function POST(req: Request) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  if (!seller.isVerified) return forbidden('Only verified sellers can submit auction items.')

  const { auctionEventId, title, description, artistStatement,
          categoryId, startPrice, reservePrice, images } = await req.json()

  if (!auctionEventId) return badRequest('Please select an auction event to submit to.')
  if (!title || !description || !categoryId || !startPrice)
    return badRequest('Title, description, category and starting price are required.')

  const result = await submitAuction(seller.id, {
    auctionEventId,
    title,
    description,
    artistStatement,
    categoryId,
    startPrice:   parseFloat(startPrice),
    reservePrice: reservePrice ? parseFloat(reservePrice) : null,
    images:       images ?? [],
  })

  if (result.error) return badRequest(result.error)
  return NextResponse.json(result.auction, { status: 201 })
}
