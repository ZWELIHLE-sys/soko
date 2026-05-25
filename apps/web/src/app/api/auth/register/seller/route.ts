import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      password,
      phone,
      brandName,
      bio,
      suburb,
      customCategory,
      proofUrls,
      videoUrl,
      socialMediaLink,
      hasDeclaration,
      locationId,
      categoryId,
    } = body

    // Validate required fields
    if (!name || !email || !password || !phone || !brandName || !locationId || !categoryId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (categoryId === 'cat-other' && !customCategory?.trim()) {
      return NextResponse.json(
        { error: 'Please describe what you make' },
        { status: 400 }
      )
    }

    if (!proofUrls || proofUrls.length === 0) {
      return NextResponse.json(
        { error: 'Please upload at least one photo of you making your product' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.seller.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A seller account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create seller — status starts as PENDING until admin verifies
    const seller = await prisma.seller.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        brandName,
        bio,
        suburb:         suburb         || null,
        customCategory: customCategory || null,
        proofUrls:       proofUrls      || [],
        videoUrl:        videoUrl       || null,
        socialMediaLink: socialMediaLink || null,
        hasDeclaration:  hasDeclaration  || false,
        locationId,
        categoryId,
        status: 'PENDING',
        isVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        brandName: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      {
        message: 'Seller application submitted! We will review and verify your account within 24 hours.',
        seller
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Seller registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
