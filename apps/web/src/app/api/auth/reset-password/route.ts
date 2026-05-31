import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
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
