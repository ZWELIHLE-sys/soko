import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q     = searchParams.get('q') ?? ''
  const limit = parseInt(searchParams.get('limit') ?? '0') || undefined

  const products = await prisma.product.findMany({
    where: q ? {
      status: 'ACTIVE',
      name: { contains: q, mode: 'insensitive' },
    } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      seller:   { select: { brandName: true } },
      category: { select: { name: true, icon: true } },
    },
  })

  return NextResponse.json(products)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id, status } = await req.json()
  const product = await prisma.product.update({ where: { id }, data: { status } })
  return NextResponse.json(product)
}
