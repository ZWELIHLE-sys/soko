import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { removeFeaturedListing } from '@/services/featured'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  await removeFeaturedListing(id)
  return NextResponse.json({ ok: true })
}
