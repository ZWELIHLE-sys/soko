import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { brandName: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
              category: { select: { icon: true } }
            }
          }
        }
      }
    }
  })

  return NextResponse.json(orders)
}
