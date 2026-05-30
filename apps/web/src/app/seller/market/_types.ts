export interface MakerInResident {
  id: string
  brandName: string
  name: string
  avatar: string | null
  bio: string | null
}

export interface Market {
  id: string
  title: string
  description: string | null
  theme: string | null
  startDate: string
  endDate: string
  applicationDeadline: string
  maxListings: number | null
  makerInResident: MakerInResident | null
  _count: { listings: number }
}

export interface SellerProduct {
  id: string
  name: string
  images: string[]
  price: number
  category: { name: string }
}

export interface ListingProduct {
  id: string
  name: string
  images: string[]
  price: number
}

export interface MarketListing {
  id: string
  status: string
  sellerNote: string | null
  adminNote: string | null
  stallNumber: number | null
  createdAt: string
  productIds: string[]
  products: ListingProduct[]
  market: Market
}
