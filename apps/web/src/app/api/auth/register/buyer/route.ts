import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp = generateOTP()
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.user.create({
      data: {
        name,
        email,
        password:           hashedPassword,
        phone:              phone || null,
        role:               'BUYER',
        isVerified:         false,
        emailVerifyToken:   otp,
        emailVerifyExpiry:  expiry,
      },
    })

    try {
      await sendVerificationEmail(email, name, otp)
    } catch (mailErr) {
      console.error('Email send failed:', mailErr)
      // Account is created — don't block the user, just log the failure
    }

    return NextResponse.json(
      { message: 'Account created. Please check your email for your verification code.' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Buyer registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
