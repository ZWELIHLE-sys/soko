import { NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerEarnings } from '@/services/sellers'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const earnings = await getSellerEarnings(seller.id)
  return NextResponse.json(earnings)
}
