import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { updateSellerStatus } from '@/services/sellers'
import { vEnum, validationError } from '@/lib/validation'

export const dynamic = 'force-dynamic'

const SELLER_STATUSES = ['PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED'] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params

  let status: string
  try {
    status = vEnum((await req.json()).status, SELLER_STATUSES, 'Status')
  } catch (err) {
    const bad = validationError(err); if (bad) return bad
    throw err
  }

  const seller = await updateSellerStatus(id, status)
  return NextResponse.json(seller)
}
