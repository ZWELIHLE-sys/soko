import { NextRequest, NextResponse } from 'next/server'
import { requireBuyer, unauthorized, notFound } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'
import { vString, vOptionalString, validationError } from '@/lib/validation'

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

  const body = await req.json()

  let data: { name?: string; phone?: string | null; avatar?: string | null }
  try {
    data = {
      ...(body.name   !== undefined && { name:   vString(body.name, 'Name', { min: 2, max: 80 }) }),
      ...(body.phone  !== undefined && { phone:  vOptionalString(body.phone, 'Phone', 30) }),
      ...(body.avatar !== undefined && { avatar: vOptionalString(body.avatar, 'Avatar', 600) }),
    }
  } catch (err) {
    const bad = validationError(err); if (bad) return bad
    throw err
  }

  const updated = await prisma.user.update({
    where: { id: buyer.id },
    data,
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  })

  return NextResponse.json(updated)
}
