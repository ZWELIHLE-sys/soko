import { NextResponse } from 'next/server'
import { getPublicAuctions } from '@/services/auctions'

export async function GET() {
  const auctions = await getPublicAuctions()
  return NextResponse.json({ auctions })
}
