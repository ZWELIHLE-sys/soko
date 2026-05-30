import { NextRequest, NextResponse } from 'next/server'
import { requireBuyer, unauthorized, notFound } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export async function GET() {
  const buyer = await requireBuyer()
  if (!buyer) return unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: buyer.id },
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  })
  if (!user) return notFound('User not found')

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const buyer = await requireBuyer()
  if (!buyer) return unauthorized()

  const { name, phone, avatar } = await req.json()

  const updated = await prisma.user.update({
    where: { id: buyer.id },
    data: {
      ...(name   !== undefined && { name: name.trim() }),
      ...(phone  !== undefined && { phone: phone.trim() || null }),
      ...(avatar !== undefined && { avatar }),
    },
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  })

  return NextResponse.json(updated)
}
