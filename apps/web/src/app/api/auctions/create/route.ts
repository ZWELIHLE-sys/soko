import { NextResponse } from 'next/server'

// Sellers now submit auction items through the seller dashboard (/seller/auctions)
// which uses /api/seller/auctions and requires an auctionEventId.
export async function POST() {
  return NextResponse.json(
    { error: 'Please submit auction items through your Seller Dashboard under Auctions.' },
    { status: 410 },
  )
}
