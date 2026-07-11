import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const admins = await prisma.user.findMany({
    where:   { role: 'ADMIN' },
    select:  { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(admins)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { name, email, password } = await req.json()
  if (!name?.trim() || !email?.trim() || !password) {
    return badRequest('Name, email and password are required.')
  }
  if (password.length < 8) {
    return badRequest('Password must be at least 8 characters.')
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (existing) return badRequest('An account with this email already exists.')

  const hashed = await bcrypt.hash(password, 12)
  const admin = await prisma.user.create({
    data: {
      name:       name.trim(),
      email:      email.trim(),
      password:   hashed,
      role:       'ADMIN',
      isVerified: true,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json(admin, { status: 201 })
}
