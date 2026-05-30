import { NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerStats } from '@/services/sellers'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const stats = await getSellerStats(seller.id)
  return NextResponse.json({ status: seller.status, ...stats })
}
