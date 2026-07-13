import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'
import { vString, vEmail, vPassword, validationError } from '@/lib/validation'

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

  let name: string, email: string, password: string
  try {
    const body = await req.json()
    name     = vString(body.name, 'Name', { min: 2, max: 80 })
    email    = vEmail(body.email)   // lowercased — keeps login (which lowercases) consistent
    password = vPassword(body.password)
  } catch (err) {
    const bad = validationError(err); if (bad) return bad
    throw err
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return badRequest('An account with this email already exists.')

  const hashed = await bcrypt.hash(password, 12)
  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password:   hashed,
      role:       'ADMIN',
      isVerified: true,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json(admin, { status: 201 })
}
