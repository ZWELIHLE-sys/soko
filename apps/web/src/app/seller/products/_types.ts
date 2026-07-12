export interface Category { id: string; name: string; icon: string | null; slug?: string }

export interface LivestockDetail {
  species: string
  breed: string
  purpose: string
  sex: string | null
  approxAgeMonths: number | null
  weightKg: number | null
  colour: string | null
  brandMark: string | null
  vaccinations: string | null
  dipRecords: string | null
  breedingHistory: string | null
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  status: string
  images: string[]
  categoryId: string
  category: { name: string; slug?: string }
  bulkMinQty: number | null
  bulkPrice: number | null
  // Agriculture
  isHarvestPreOrder: boolean
  plantedAt: string | null
  expectedHarvestDate: string | null
  estimatedYield: number | null
  yieldUnit: string | null
  harvestStatus: string | null
  livestockDetail: LivestockDetail | null
  orderItems?: { quantity: number }[]  // open RESERVED quantities (harvest listings)
}

export interface ProductStat {
  orderCount: number
  revenue: number
}

export interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  categoryId: string
  images: string[]
  bulkMinQty: string
  bulkPrice: string
  // Harvest pre-order (Farm Produce)
  isHarvestPreOrder: boolean
  plantedAt: string
  expectedHarvestDate: string
  estimatedYield: string
  yieldUnit: string
  // Livestock (live animals)
  lsSpecies: string
  lsBreed: string
  lsPurpose: string
  lsSex: string
  lsAgeMonths: string
  lsWeightKg: string
  lsColour: string
  lsBrandMark: string
  lsVaccinations: string
  lsDipRecords: string
  lsBreedingHistory: string
}

export const EMPTY_FORM: ProductFormData = {
  name: '', description: '', price: '', stock: '1', categoryId: '', images: [], bulkMinQty: '', bulkPrice: '',
  isHarvestPreOrder: false, plantedAt: '', expectedHarvestDate: '', estimatedYield: '', yieldUnit: '',
  lsSpecies: '', lsBreed: '', lsPurpose: '', lsSex: '', lsAgeMonths: '', lsWeightKg: '', lsColour: '',
  lsBrandMark: '', lsVaccinations: '', lsDipRecords: '', lsBreedingHistory: '',
}
