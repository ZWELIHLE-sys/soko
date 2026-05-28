'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Gavel, Trophy, Clock, ArrowRight } from 'lucide-react'
import styles from './auctions.module.css'

interface AuctionSummary {
  id: string
  title: string
  currentBid: number | null
  startPrice: number
  status: string
  images: string[]
  category: { name: string }
  seller: { brandName: string }
  auctionEvent: { title: string; biddingEndDate: string; status: string } | null
}

interface BidEntry {
  id: string
  amount: number
  createdAt: string
  auction: AuctionSummary
}

export default function BuyerAuctionsPage() {
  const [bids,        setBids]        = useState<BidEntry[]>([])
  const [wonAuctions, setWonAuctions] = useState<AuctionSummary[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/buyer/auctions')
      .then(r => r.json())
      .then(data => {
        setBids(data.bids ?? [])
        setWonAuctions(data.wonAuctions ?? [])
        setLoading(false)
      })
  }, [])

  // Deduplicate bids — show highest bid per auction
  const uniqueAuctions = new Map<string, BidEntry>()
  for (const bid of bids) {
    const existing = uniqueAuctions.get(bid.auction.id)
    if (!existing || bid.amount > existing.amount) {
      uniqueAuctions.set(bid.auction.id, bid)
    }
  }
  const activeBids = Array.from(uniqueAuctions.values())

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) return <div className={styles.loading}>Loading your auctions...</div>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Auctions</h1>
        <p className={styles.subtitle}>Your bids and auction wins</p>
      </div>

      {/* Won auctions */}
      {wonAuctions.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Trophy size={16} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Won Auctions</h2>
          </div>
          <div className={styles.list}>
            {wonAuctions.map(auction => (
              <div key={auction.id} className={`${styles.card} ${styles.cardWon}`}>
                <div className={styles.cardLeft}>
                  <div className={styles.cardTitle}>{auction.title}</div>
                  <div className={styles.cardMeta}>
                    {auction.category.name} · by {auction.seller.brandName}
                  </div>
                  {auction.auctionEvent && (
                    <div className={styles.cardEvent}>{auction.auctionEvent.title}</div>
                  )}
                </div>
                <div className={styles.cardRight}>
                  <div className={styles.wonBadge}>
                    <Trophy size={11} /> Won
                  </div>
                  <div className={styles.bidAmount}>R{(auction.currentBid ?? auction.startPrice).toFixed(2)}</div>
                  <Link href={`/auctions/${auction.id}`} className={styles.viewLink}>
                    View <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active bids */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <Gavel size={16} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>My Bids</h2>
        </div>

        {activeBids.length === 0 ? (
          <div className={styles.empty}>
            <Gavel size={44} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No bids yet</h3>
            <p className={styles.emptyText}>
              Browse live auctions and place a bid to see your activity here.
            </p>
            <Link href="/auctions" className={styles.emptyBtn}>
              <Gavel size={14} /> Browse Auctions <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {activeBids.map(({ id, amount, createdAt, auction }) => {
              const isLeading = auction.currentBid === amount
              const eventEnded = auction.auctionEvent?.status === 'ENDED'
              return (
                <div key={id} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardTitle}>{auction.title}</div>
                    <div className={styles.cardMeta}>
                      {auction.category.name} · by {auction.seller.brandName}
                    </div>
                    {auction.auctionEvent && (
                      <div className={styles.cardEvent}>
                        <Clock size={11} />
                        {eventEnded
                          ? `Ended · ${formatDate(auction.auctionEvent.biddingEndDate)}`
                          : `Closes ${formatDate(auction.auctionEvent.biddingEndDate)}`
                        }
                      </div>
                    )}
                  </div>
                  <div className={styles.cardRight}>
                    <div className={`${styles.bidStatusBadge} ${isLeading ? styles.badgeLeading : styles.badgeOutbid}`}>
                      {isLeading ? 'Leading' : 'Outbid'}
                    </div>
                    <div className={styles.bidAmount}>R{amount.toFixed(2)}</div>
                    <div className={styles.bidDate}>
                      Bid placed {new Date(createdAt).toLocaleDateString('en-ZA')}
                    </div>
                    <Link href={`/auctions/${auction.id}`} className={styles.viewLink}>
                      View <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
