'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import {
  Gavel, Clock, MapPin, BadgeCheck, ArrowLeft,
  ChevronRight, AlertTriangle, Lock, CheckCircle, PawPrint,
} from 'lucide-react'
import { SPECIES, PURPOSES, SEXES } from '@/lib/livestock'
import styles from './auction.module.css'

interface Bid {
  id: string
  amount: number
  createdAt: string
  bidder: { name: string }
}

interface LivestockPapers {
  species: string
  breed: string
  purpose: string
  sex: string | null
  approxAgeMonths: number | null
  weightKg: number | null
  colour: string | null
  brandMark: string | null
  vaccinations: string | null
  breedingHistory: string | null
}

interface Auction {
  id: string
  title: string
  description: string
  images: string[]
  startPrice: number
  currentBid: number | null
  livestockDetail: LivestockPapers | null
  piece: { livestockDetail: LivestockPapers | null; videoUrl: string | null } | null
  auctionEvent: {
    biddingStartDate: string
    biddingEndDate: string
  } | null
  status: string
  seller: {
    brandName: string
    isVerified: boolean
    bio: string | null
    location: { name: string }
  }
  category: { name: string; slug: string }
  bids: Bid[]
  winner: { name: string } | null
  _count?: { bids: number }
}

function getTimeLeft(endTime: string) {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now())
  if (diff === 0) return 'Ended'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [auction, setAuction]     = useState<Auction | null>(null)
  const [loading, setLoading]     = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidding, setBidding]     = useState(false)
  const [bidError, setBidError]   = useState('')
  const [bidSuccess, setBidSuccess] = useState('')
  const [timeLeft, setTimeLeft]   = useState('')
  const [selectedImg, setSelectedImg] = useState(0)

  const loadAuction = useCallback(() => {
    fetch(`/api/auctions/${id}`)
      .then(r => r.json())
      .then(data => {
        setAuction(data.auction)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  // Initial load + poll every 8 seconds when live
  useEffect(() => {
    loadAuction()
    const poll = setInterval(loadAuction, 8000)
    return () => clearInterval(poll)
  }, [loadAuction])

  // Live countdown
  useEffect(() => {
    if (!auction) return
    const endDate = auction.auctionEvent?.biddingEndDate ?? ''
    const tick = () => setTimeLeft(endDate ? getTimeLeft(endDate) : '')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [auction])

  const handleBid = async () => {
    if (!session) { router.push('/login?callbackUrl=/auctions/' + id); return }
    if (!bidAmount) return
    setBidding(true)
    setBidError('')
    setBidSuccess('')

    const res = await fetch('/api/auctions/bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionId: id, amount: parseFloat(bidAmount) }),
    })
    const data = await res.json()
    if (!res.ok) {
      setBidError(data.error || 'Bid failed')
    } else {
      setBidSuccess(`Bid of R${parseFloat(bidAmount).toFixed(2)} placed!`)
      setBidAmount('')
      loadAuction()
    }
    setBidding(false)
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loading}>Loading auction...</div>
      </div>
    )
  }

  if (!auction) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.notFound}>
          <Gavel size={44} />
          <h2>Auction not found</h2>
          <Link href="/auctions" className={styles.backLink}><ArrowLeft size={14} /> Back to auctions</Link>
        </div>
      </div>
    )
  }

  const isLive     = auction.status === 'LIVE'
  const isEnded    = auction.status === 'ENDED'
  const isUpcoming = auction.status === 'APPROVED'
  const minBid     = auction.currentBid ? auction.currentBid + 1 : auction.startPrice

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.inner}>

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/auctions" className={styles.breadLink}>Auctions</Link>
          <ChevronRight size={13} />
          <span className={styles.breadCurrent}>{auction.title}</span>
        </nav>

        <div className={styles.grid}>

          {/* Images */}
          <div className={styles.imageCol}>
            <div className={styles.mainImage}>
              {auction.images[0] ? (
                <Image
                  src={auction.images[selectedImg] ?? auction.images[0]}
                  alt={auction.title}
                  fill
                  className={styles.mainImg}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className={styles.imageFallback}><Gavel size={48} /></div>
              )}
              <div className={`${styles.statusBadge} ${styles[`status${auction.status}`]}`}>
                {isLive && <span className={styles.livePulse} />}
                {isLive ? 'Live' : isEnded ? 'Ended' : 'Starting Soon'}
              </div>
            </div>
            {auction.images.length > 1 && (
              <div className={styles.thumbRow}>
                {auction.images.map((img, i) => (
                  <button key={i} className={`${styles.thumb} ${selectedImg === i ? styles.thumbActive : ''}`} onClick={() => setSelectedImg(i)}>
                    <Image src={img} alt="" fill className={styles.thumbImg} sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + Bidding */}
          <div className={styles.infoCol}>
            <div className={styles.catTag}>{auction.category.name}</div>
            <h1 className={styles.title}>{auction.title}</h1>

            <div className={styles.sellerRow}>
              <div className={styles.sellerAvatar}>{auction.seller.brandName.charAt(0)}</div>
              <div>
                <span className={styles.sellerName}>{auction.seller.brandName}</span>
                {auction.seller.isVerified && (
                  <span className={styles.verified}><BadgeCheck size={11} /> Verified</span>
                )}
                <div className={styles.sellerLocation}><MapPin size={11} />{auction.seller.location.name}</div>
              </div>
            </div>

            <p className={styles.description}>{auction.description}</p>

            {/* See it move — the piece's video, essential for livestock lots */}
            {auction.piece?.videoUrl && (
              <div className={styles.lotVideoWrap}>
                <video src={auction.piece.videoUrl} controls preload="metadata" className={styles.lotVideo} />
              </div>
            )}

            {/* Animal papers — livestock lots carry breed, purpose and records to the hammer */}
            {(() => {
              const papers = auction.livestockDetail ?? auction.piece?.livestockDetail
              if (!papers) return null
              const label = (list: readonly { value: string; label: string }[], v: string | null) =>
                v ? (list.find(x => x.value === v)?.label ?? v) : null
              return (
                <div className={styles.papersCard}>
                  <div className={styles.papersTitle}><PawPrint size={13} /> Animal Details</div>
                  <div className={styles.papersGrid}>
                    <div className={styles.papersRow}><span>Species</span><strong>{label(SPECIES, papers.species)}</strong></div>
                    <div className={styles.papersRow}><span>Breed</span><strong>{papers.breed}</strong></div>
                    <div className={styles.papersRow}><span>Purpose</span><strong>{label(PURPOSES, papers.purpose)}</strong></div>
                    {papers.sex && <div className={styles.papersRow}><span>Sex</span><strong>{label(SEXES, papers.sex)}</strong></div>}
                    {papers.approxAgeMonths != null && (
                      <div className={styles.papersRow}><span>Approx. age</span><strong>{papers.approxAgeMonths} months</strong></div>
                    )}
                    {papers.weightKg != null && (
                      <div className={styles.papersRow}><span>Weight</span><strong>{papers.weightKg} kg</strong></div>
                    )}
                    {papers.colour && <div className={styles.papersRow}><span>Colour</span><strong>{papers.colour}</strong></div>}
                    {papers.brandMark && <div className={styles.papersRow}><span>Brand mark</span><strong>{papers.brandMark}</strong></div>}
                  </div>
                  {papers.vaccinations && (
                    <div className={styles.papersNotes}>
                      <span>Vaccinations & dip records</span>
                      <p>{papers.vaccinations}</p>
                    </div>
                  )}
                  {papers.breedingHistory && (
                    <div className={styles.papersNotes}>
                      <span>Breeding history</span>
                      <p>{papers.breedingHistory}</p>
                    </div>
                  )}
                  <div className={styles.papersFootnote}>
                    Movement documents and collection are arranged directly between winning bidder and seller.
                  </div>
                </div>
              )
            })()}

            {/* Bid status */}
            <div className={styles.bidStatus}>
              <div>
                <div className={styles.bidLabel}>
                  {auction.currentBid ? 'Current bid' : 'Starting price'}
                </div>
                <div className={styles.bidPrice}>
                  R{(auction.currentBid ?? auction.startPrice).toFixed(2)}
                </div>
                <div className={styles.bidCount}>{auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}</div>
              </div>
              <div className={styles.timeWrap}>
                <div className={styles.timeLabel}>
                  {isEnded ? 'Auction ended' : isUpcoming ? 'Starts' : 'Time left'}
                </div>
                <div className={`${styles.timeValue} ${isLive ? styles.timeLive : ''}`}>
                  <Clock size={14} />
                  {isEnded ? 'Closed' : isUpcoming
                    ? new Date(auction.auctionEvent?.biddingStartDate ?? '').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                    : timeLeft}
                </div>
              </div>
            </div>

            {/* Bidding panel */}
            {isLive && (
              <div className={styles.bidPanel}>
                {session?.user?.role === 'BUYER' ? (
                  <>
                    <div className={styles.minBidNote}>Minimum bid: R{minBid.toFixed(2)}</div>
                    <div className={styles.bidInputRow}>
                      <span className={styles.randSymbol}>R</span>
                      <input
                        className={styles.bidInput}
                        type="number"
                        min={minBid}
                        step="1"
                        placeholder={minBid.toFixed(2)}
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                      />
                      <button
                        className={styles.bidBtn}
                        onClick={handleBid}
                        disabled={bidding || !bidAmount}
                      >
                        <Gavel size={15} />
                        {bidding ? 'Placing...' : 'Place Bid'}
                      </button>
                    </div>
                    {bidError   && <div className={styles.bidError}><AlertTriangle size={13} /> {bidError}</div>}
                    {bidSuccess && <div className={styles.bidSuccessMsg}><CheckCircle size={13} /> {bidSuccess}</div>}
                  </>
                ) : (
                  <div className={styles.loginPrompt}>
                    <Lock size={15} />
                    <span>
                      {!session
                        ? <><Link href={`/login?callbackUrl=/auctions/${id}`} className={styles.loginLink}>Sign in</Link> as a verified buyer to bid</>
                        : 'Only verified buyers can bid on auctions'
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {isEnded && auction.winner && (
              <div className={styles.winnerBanner}>
                <CheckCircle size={16} />
                Won by <strong>{auction.winner.name}</strong> for <strong>R{auction.currentBid?.toFixed(2)}</strong>
              </div>
            )}

            {isUpcoming && (
              <div className={styles.upcomingNote}>
                <Clock size={14} />
                Bidding opens {new Date(auction.auctionEvent?.biddingStartDate ?? '').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            )}
          </div>
        </div>

        {/* Bid history */}
        {auction.bids.length > 0 && (
          <div className={styles.bidHistory}>
            <h2 className={styles.historyTitle}>Bid History</h2>
            <div className={styles.bidList}>
              {auction.bids.map((bid, i) => (
                <div key={bid.id} className={`${styles.bidRow} ${i === 0 ? styles.topBid : ''}`}>
                  <span className={styles.bidderName}>{bid.bidder.name}</span>
                  <span className={styles.bidAmount}>R{bid.amount.toFixed(2)}</span>
                  <span className={styles.bidTime}>
                    {new Date(bid.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}
