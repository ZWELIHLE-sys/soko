export interface Seller {
  id: string
  name: string
  brandName: string
  email: string
  phone: string
  status: string
  isVerified: boolean
  createdAt: string
  bio: string | null
  customCategory: string | null
  socialMediaLink: string | null
  proofUrls: string[]
  videoUrl: string | null
  location: { name: string }
  category: { name: string; icon: string }
  _count: { products: number; orders: number }
}

export const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:   { color: '#92400E', bg: '#FEF9C3' },
  VERIFIED:  { color: '#14532D', bg: '#DCFCE7' },
  SUSPENDED: { color: '#991B1B', bg: '#FEE2E2' },
  REJECTED:  { color: '#374151', bg: '#F3F4F6' },
}

export const FILTERS = ['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED']
