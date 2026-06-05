export type MarketType = 'SUNDAY_MARKET' | 'FRIDAY_NIGHT_MARKET'

export interface VerifiedSeller {
  id:        string
  brandName: string
  category:  { name: string }
  location:  { name: string } | null
  _count:    { products: number }
}

export interface MarketListing {
  id:           string
  status:       string
  sellerNote:   string | null
  adminNote:    string | null
  stallNumber:  number | null
  stallMessage: string | null
  marketPrice:  number | null
  productIds:   string[]
  seller: {
    brandName:  string
    email:      string
    locationId: string
    location:   { name: string } | null
    _count:     { products: number }
  }
}

export interface Market {
  id:                  string
  marketType:          MarketType
  title:               string
  theme:               string | null
  startDate:           string
  endDate:             string
  applicationDeadline: string
  isActive:            boolean
  maxListings:         number | null
  makerInResident:     { id: string; brandName: string } | null
  _count:              { listings: number }
  listings:            { id: string }[]
}

export const TYPE_LABEL: Record<MarketType, string> = {
  SUNDAY_MARKET:       'Sunday Vuna Market',
  FRIDAY_NIGHT_MARKET: 'Friday Night Market',
}

export const TYPE_TIMES: Record<MarketType, string> = {
  SUNDAY_MARKET:       '8:00 AM – 6:00 PM · Weekly',
  FRIDAY_NIGHT_MARKET: '5:00 PM – 11:00 PM · Monthly (last Friday)',
}

export const TYPE_COLOR: Record<MarketType, { color: string; bg: string }> = {
  SUNDAY_MARKET:       { color: '#92400E', bg: '#FEF9C3' },
  FRIDAY_NIGHT_MARKET: { color: '#1C0A00', bg: '#FEF3C7' },
}

export const LISTING_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:  { color: '#92400E', bg: '#FEF9C3' },
  APPROVED: { color: '#14532D', bg: '#DCFCE7' },
  REJECTED: { color: '#991B1B', bg: '#FEE2E2' },
}

export const EVENT_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  UPCOMING: { color: '#9A3412', bg: '#FFEDD5' },
  LIVE:     { color: '#14532D', bg: '#DCFCE7' },
  ENDED:    { color: '#6B7280', bg: '#F3F4F6' },
}

export const EMPTY_MARKET_FORM = {
  marketType: 'SUNDAY_MARKET' as MarketType,
  title: '', description: '', theme: '',
  startDate: '', endDate: '', applicationDeadline: '',
  maxListings: '',
}

export function getEventStatus(startDate: string, endDate: string): 'UPCOMING' | 'LIVE' | 'ENDED' {
  const now = new Date()
  if (now < new Date(startDate)) return 'UPCOMING'
  if (now > new Date(endDate))   return 'ENDED'
  return 'LIVE'
}
