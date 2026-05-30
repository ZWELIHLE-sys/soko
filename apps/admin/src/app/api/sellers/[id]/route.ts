import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { updateSellerStatus } from '@/services/sellers'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const { status } = await req.json()
  const seller = await updateSellerStatus(id, status)
  return NextResponse.json(seller)
}
