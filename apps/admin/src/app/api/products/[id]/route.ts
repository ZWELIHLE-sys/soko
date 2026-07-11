import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

/**
 * Admin product delete — soft-delete by setting status to SUSPENDED so the product
 * disappears from public shop listings but remains intact for past orders that reference it.
 * Hard delete is avoided to prevent FK violations on OrderItem, Wishlist, Review, etc.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  await prisma.product.update({
    where: { id },
    data:  { status: 'SUSPENDED' },
  })
  return NextResponse.json({ ok: true })
}
