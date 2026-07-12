import { Gavel, Store, Package, CheckCircle2, XCircle, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Stage = 'MARKET' | 'AUCTION' | 'FEATURED' | 'SHOP' | 'SOLD' | 'RETIRED'

export interface Piece {
  id:           string
  title:        string
  description:  string
  images:       string[]
  currentStage: Stage
  createdAt:    string
  seller:   { id: string; brandName: string; location: { name: string } | null }
  category: { name: string; slug: string }
  marketListings: { id: string; status: string; stallNumber: number | null; market: { id: string; title: string } }[]
  auctions:       { id: string; status: string; currentBid: number | null; startPrice: number; auctionEvent: { id: string; title: string; biddingEndDate: string } | null; _count: { bids: number } }[]
  products:       { id: string; name: string; price: number; status: string }[]
}

export interface MarketOption {
  id: string
  title: string
  startDate: string
  endDate: string
  marketType: string
}

export interface AuctionEventOption {
  id: string
  title: string
  biddingStartDate: string
  biddingEndDate: string
  status: string
}

export const STAGE_STYLE: Record<Stage, { bg: string; color: string; label: string; Icon: LucideIcon }> = {
  MARKET:   { bg: '#FFEDD5', color: '#9A3412', label: 'In Market',   Icon: Store },
  AUCTION:  { bg: '#FEF9C3', color: '#92400E', label: 'In Auction',  Icon: Gavel },
  FEATURED: { bg: '#FDE68A', color: '#7C2D12', label: 'Featured',    Icon: Star },
  SHOP:     { bg: '#D1FAE5', color: '#065F46', label: 'In Shop',     Icon: Package },
  SOLD:     { bg: '#DCFCE7', color: '#14532D', label: 'Sold',        Icon: CheckCircle2 },
  RETIRED:  { bg: '#F3F4F6', color: '#6B7280', label: 'Retired',     Icon: XCircle },
}

export const FILTERS: ('ALL' | Stage)[] = ['ALL', 'MARKET', 'AUCTION', 'FEATURED', 'SHOP', 'SOLD', 'RETIRED']
