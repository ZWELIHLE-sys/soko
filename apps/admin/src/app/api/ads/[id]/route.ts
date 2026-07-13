import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const { isActive } = await req.json()

  const ad = await prisma.adBanner.update({
    where: { id },
    data:  { isActive: isActive === true },
  })
  return NextResponse.json(ad)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  await prisma.adBanner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
