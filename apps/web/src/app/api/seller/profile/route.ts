import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerProfile, updateSellerProfile } from '@/services/sellers'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const profile = await getSellerProfile(seller.id)
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const { bio, avatar, banner, phone, suburb,
          bankName, accountHolder, accountNumber, accountType, branchCode } = await req.json()

  const updated = await updateSellerProfile(seller.id, {
    bio, avatar, banner, phone, suburb,
    bankName, accountHolder, accountNumber, accountType, branchCode,
  })
  return NextResponse.json(updated)
}
