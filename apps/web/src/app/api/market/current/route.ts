import { NextResponse } from 'next/server'
import { getCurrentMarket } from '@/services/market'

export async function GET() {
  const market = await getCurrentMarket()
  return NextResponse.json({ market: market ?? null })
}
