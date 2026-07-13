import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { checkRateLimit } from '@/lib/rate-limit'
import { vString, vPassword, validationError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'reset-password', 5, 60_000)
  if (limited) return limited

  try {
    const body = await req.json()

    let token: string, password: string
    try {
      token    = vString(body.token, 'Token', { max: 200 })
      password = vPassword(body.password)
    } catch (err) {
      const bad = validationError(err); if (bad) return bad
      throw err
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const now = new Date()

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: tokenHash, resetPasswordExpiry: { gt: now } },
    })
    const seller = !user
      ? await prisma.seller.findFirst({
          where: { resetPasswordToken: tokenHash, resetPasswordExpiry: { gt: now } },
        })
      : null

    if (!user && !seller) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpiry: null },
      })
    } else {
      await prisma.seller.update({
        where: { id: seller!.id },
        data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpiry: null },
      })
    }

    return NextResponse.json({ message: 'Password updated successfully.' })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
