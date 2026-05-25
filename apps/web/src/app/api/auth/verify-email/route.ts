import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 })
    }

    if (!user.emailVerifyToken || user.emailVerifyToken !== otp) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    if (!user.emailVerifyExpiry || new Date() > user.emailVerifyExpiry) {
      return NextResponse.json({ error: 'Verification code has expired. Please register again.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified:        true,
        emailVerifyToken:  null,
        emailVerifyExpiry: null,
      },
    })

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
