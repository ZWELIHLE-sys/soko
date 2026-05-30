export interface Category { id: string; name: string }

export interface AuctionEvent {
  id: string
  title: string
  description: string | null
  theme: string | null
  status: string
  submissionDeadline: string
  catalogueOpenDate: string
  biddingStartDate: string
  biddingEndDate: string
  _count: { items: number }
}

export interface MyItem {
  id: string
  title: string
  artistStatement: string | null
  startPrice: number
  currentBid: number | null
  status: string
  adminNote: string | null
  auctionEventId: string | null
  auctionEvent: {
    id: string; title: string; status: string;
    biddingStartDate: string; biddingEndDate: string;
  } | null
  category: { name: string }
  _count: { bids: number }
}
