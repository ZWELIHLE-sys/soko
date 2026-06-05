export type EventStatus = 'ANNOUNCED' | 'CATALOGUE_OPEN' | 'LIVE' | 'ENDED'

export interface Bid {
  id:        string
  amount:    number
  createdAt: string
  bidder:    { name: string }
}

export interface AuctionItem {
  id:              string
  title:           string
  description:     string
  artistStatement: string | null
  images:          string[]
  startPrice:      number
  reservePrice:    number | null
  currentBid:      number | null
  status:          string
  adminNote:       string | null
  seller:   { brandName: string; locationId: string; location: { name: string } | null }
  category: { name: string }
  winner:   { name: string; locationId: string; location: { name: string } | null } | null
  _count:          { bids: number }
}

export interface AuctionEvent {
  id:                 string
  title:              string
  theme:              string | null
  status:             EventStatus
  submissionDeadline: string
  catalogueOpenDate:  string
  biddingStartDate:   string
  biddingEndDate:     string
  isActive:           boolean
  _count:             { items: number }
  items:              { id: string }[]
}

export const EVENT_STATUS_STYLE: Record<EventStatus, { color: string; bg: string; label: string }> = {
  ANNOUNCED:      { color: '#92400E', bg: '#FEF9C3', label: 'Announced' },
  CATALOGUE_OPEN: { color: '#9A3412', bg: '#FFEDD5', label: 'Catalogue Open' },
  LIVE:           { color: '#14532D', bg: '#DCFCE7', label: 'Live — Bidding Open' },
  ENDED:          { color: '#374151', bg: '#F3F4F6', label: 'Ended' },
}

export const ITEM_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:   { color: '#92400E', bg: '#FEF9C3' },
  APPROVED:  { color: '#065F46', bg: '#D1FAE5' },
  LIVE:      { color: '#14532D', bg: '#DCFCE7' },
  ENDED:     { color: '#374151', bg: '#F3F4F6' },
  CANCELLED: { color: '#991B1B', bg: '#FEE2E2' },
}

export const STATUS_TRANSITIONS: Record<EventStatus, { next: EventStatus; label: string } | null> = {
  ANNOUNCED:      { next: 'CATALOGUE_OPEN', label: 'Open Catalogue' },
  CATALOGUE_OPEN: { next: 'LIVE',           label: 'Go Live' },
  LIVE:           { next: 'ENDED',          label: 'End Auction' },
  ENDED:          null,
}

export const EMPTY_EVENT_FORM = {
  title: '', description: '', theme: '',
  submissionDeadline: '', catalogueOpenDate: '',
  biddingStartDate: '', biddingEndDate: '',
}

export function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}
