import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({ where: { email: session.user.email! } })
  if (!seller || seller.status !== 'VERIFIED') {
    return NextResponse.json({ error: 'Only verified sellers can create auctions' }, { status: 403 })
  }

  const { title, description, images, startPrice, reservePrice, startTime, endTime, categoryId } = await req.json()

  if (!title || !description || !startPrice || !startTime || !endTime || !categoryId) {
    return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
  }

  if (new Date(endTime) <= new Date(startTime)) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  const auction = await prisma.auction.create({
    data: {
      title,
      description,
      images: images || [],
      startPrice: parseFloat(startPrice),
      reservePrice: reservePrice ? parseFloat(reservePrice) : null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      sellerId: seller.id,
      categoryId,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ auction }, { status: 201 })
}
