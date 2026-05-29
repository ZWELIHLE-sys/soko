import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const sellers = await prisma.seller.findMany({
    where:   { status: 'VERIFIED' },
    orderBy: { brandName: 'asc' },
    select: {
      id:        true,
      brandName: true,
      category:  { select: { name: true } },
      location:  { select: { name: true } },
      _count:    { select: { products: true } },
    },
  })

  return NextResponse.json(sellers)
}
