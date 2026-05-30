import { NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerProductStats } from '@/services/products'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const stats = await getSellerProductStats(seller.id)
  return NextResponse.json(stats)
}
