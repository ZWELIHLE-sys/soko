import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: { brandName: true, isVerified: true }
      },
      category: {
        select: { name: true, icon: true }
      },
      location: {
        select: { name: true }
      }
    }
  })
  return NextResponse.json(products)
}