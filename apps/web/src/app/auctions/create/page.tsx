'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateAuctionRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/seller/auctions') }, [router])
  return null
}
