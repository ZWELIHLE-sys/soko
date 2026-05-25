import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
  })
  if (!seller) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  }

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id, status: 'ACTIVE' },
    select: { id: true, name: true, price: true, images: true, stock: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ products })
}
