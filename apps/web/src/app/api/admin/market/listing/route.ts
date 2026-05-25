import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

// PATCH /api/admin/market/listing  { listingId, status: APPROVED | REJECTED, adminNote? }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { listingId, status, adminNote } = await req.json()

  if (!listingId || !['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'listingId and valid status required' }, { status: 400 })
  }

  const listing = await prisma.marketListing.update({
    where: { id: listingId },
    data: {
      status,
      adminNote: adminNote || null,
      approvedAt: status === 'APPROVED' ? new Date() : null,
    },
  })

  return NextResponse.json({ listing })
}
