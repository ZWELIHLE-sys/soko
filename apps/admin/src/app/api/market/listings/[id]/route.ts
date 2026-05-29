import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const { status, adminNote, stallNumber } = await req.json()

  const listing = await prisma.marketListing.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote ?? null,
      stallNumber: stallNumber ? parseInt(stallNumber) : null,
      approvedAt: status === 'APPROVED' ? new Date() : null,
    },
  })

  return NextResponse.json(listing)
}
