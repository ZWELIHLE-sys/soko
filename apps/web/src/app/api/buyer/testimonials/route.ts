import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { content, rating } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Please write something before submitting.' }, { status: 400 })
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      userId:  session.user.id,
      content: content.trim(),
      rating:  rating ? parseInt(rating) : 5,
    },
  })

  return NextResponse.json(testimonial, { status: 201 })
}
