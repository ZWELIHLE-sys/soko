import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { isUnlocked } = await req.json()

  const country = await prisma.location.update({
    where: { id: params.id },
    data: { isUnlocked },
    select: { id: true, name: true, code: true, isUnlocked: true },
  })
  return NextResponse.json(country)
}
