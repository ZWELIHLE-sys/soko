export interface Category { id: string; name: string; icon: string | null }

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  status: string
  images: string[]
  categoryId: string
  category: { name: string }
  bulkMinQty: number | null
  bulkPrice: number | null
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
}

export const EMPTY_FORM: ProductFormData = {
  name: '', description: '', price: '', stock: '1', categoryId: '', images: [], bulkMinQty: '', bulkPrice: '',
}
