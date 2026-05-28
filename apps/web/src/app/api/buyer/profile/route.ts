import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })


  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { name, phone, avatar } = await req.json()

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name   !== undefined && { name: name.trim() }),
      ...(phone  !== undefined && { phone: phone.trim() || null }),
      ...(avatar !== undefined && { avatar }),
    },
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  })

  return NextResponse.json(updated)
}
