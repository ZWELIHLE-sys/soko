import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const parentId = new URL(req.url).searchParams.get('parentId')
  if (!parentId) return NextResponse.json([])

  const children = await prisma.location.findMany({
    where: { parentId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(children)
}
