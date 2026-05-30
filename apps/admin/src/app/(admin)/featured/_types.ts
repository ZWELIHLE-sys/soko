export interface FeaturedListing {
  id: string
  expiresAt: string
  note: string | null
  isPaidTier: boolean
  createdAt: string
  product: {
    id: string
    name: string
    price: number
    status: string
    images: string[]
    seller: { brandName: string }
    category: { name: string; icon: string | null }
  }
}

export interface ProductResult {
  id: string
  name: string
  price: number
  status: string
  images: string[]
  seller: { brandName: string }
  category: { name: string; icon: string | null }
}

export const DURATIONS = [
  { label: '7 days',  days: 7  },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
]

export function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysLeft(d: string) {
  const diff = new Date(d).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.ceil(diff / 86400000)
  return `${days} day${days !== 1 ? 's' : ''} left`
}
