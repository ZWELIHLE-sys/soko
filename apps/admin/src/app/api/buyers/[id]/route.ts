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
  const { status, isAdminVerified } = await req.json()

  const VALID_STATUSES = ['ACTIVE', 'SUSPENDED', 'FLAGGED']
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (status !== undefined)          data.status          = status
  if (isAdminVerified !== undefined) data.isAdminVerified = isAdminVerified

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, status: true, isAdminVerified: true },
  })

  return NextResponse.json(updated)
}
