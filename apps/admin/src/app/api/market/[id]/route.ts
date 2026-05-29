import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  const market = await prisma.market.findUnique({
    where: { id },
    include: {
      makerInResident: { select: { id: true, brandName: true } },
      listings: {
        include: {
          seller: {
            select: {
              brandName: true,
              email: true,
              _count: { select: { products: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!market) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(market)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const market = await prisma.market.update({
    where: { id },
    data: {
      ...(body.makerInResidenceId !== undefined && {
        makerInResidenceId: body.makerInResidenceId || null,
      }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    include: {
      makerInResident: { select: { id: true, brandName: true } },
    },
  })

  return NextResponse.json(market)
}
