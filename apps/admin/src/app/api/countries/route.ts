import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const countries = await prisma.location.findMany({
    where: { type: 'COUNTRY' },
    select: { id: true, name: true, code: true, isUnlocked: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(countries)
}
