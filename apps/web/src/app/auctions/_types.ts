export interface AuctionItem {
  id: string
  title: string
  status: string
  images: string[]
  currentBid: number | null
  startPrice: number
  seller: {
    brandName: string
    isVerified: boolean
    location: { name: string }
  }
  category: { name: string; slug: string }
  auctionEvent: { biddingStartDate: Date; biddingEndDate: Date } | null
  _count: { bids: number }
}
