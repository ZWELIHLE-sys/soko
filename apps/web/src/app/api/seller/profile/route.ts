import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerProfile, updateSellerProfile } from '@/services/sellers'
import { vString, vOptionalString, validationError } from '@/lib/validation'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const profile = await getSellerProfile(seller.id)
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const b = await req.json()

  // Only update fields actually present in the request (don't null-out omitted ones)
  let data: Parameters<typeof updateSellerProfile>[1]
  try {
    data = {
      ...(b.bio           !== undefined && { bio:           vOptionalString(b.bio, 'Bio', 1000) }),
      ...(b.avatar        !== undefined && { avatar:        vOptionalString(b.avatar, 'Avatar', 600) }),
      ...(b.banner        !== undefined && { banner:        vOptionalString(b.banner, 'Banner', 600) }),
      ...(b.phone         !== undefined && { phone:         vString(b.phone, 'Phone', { min: 6, max: 30 }) }),
      ...(b.suburb        !== undefined && { suburb:        vOptionalString(b.suburb, 'Suburb', 120) }),
      ...(b.bankName      !== undefined && { bankName:      vOptionalString(b.bankName, 'Bank name', 80) }),
      ...(b.accountHolder !== undefined && { accountHolder: vOptionalString(b.accountHolder, 'Account holder', 120) }),
      ...(b.accountNumber !== undefined && { accountNumber: vOptionalString(b.accountNumber, 'Account number', 40) }),
      ...(b.accountType   !== undefined && { accountType:   vOptionalString(b.accountType, 'Account type', 40) }),
      ...(b.branchCode    !== undefined && { branchCode:    vOptionalString(b.branchCode, 'Branch code', 20) }),
    }
  } catch (err) {
    const bad = validationError(err); if (bad) return bad
    throw err
  }

  const updated = await updateSellerProfile(seller.id, data)
  return NextResponse.json(updated)
}
