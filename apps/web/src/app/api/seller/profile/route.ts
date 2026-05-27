import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
    include: { location: true, category: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  return NextResponse.json(seller)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const { bio, avatar, banner, phone, suburb,
          bankName, accountHolder, accountNumber, accountType, branchCode } = await req.json()

  const updated = await prisma.seller.update({
    where: { id: seller.id },
    data: { bio, avatar, banner, phone, suburb,
            bankName, accountHolder, accountNumber, accountType, branchCode },
  })
  return NextResponse.json(updated)
}
