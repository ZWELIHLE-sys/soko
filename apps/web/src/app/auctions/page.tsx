import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import Link from 'next/link'
import Image from 'next/image'
import { Gavel, Clock, MapPin, BadgeCheck, Lock } from 'lucide-react'
import styles from './auctions.module.css'

export const revalidate = 30

function timeLabel(endDate: Date | null | undefined, status: string) {
  if (status === 'ENDED') return 'Ended'
  if (status === 'APPROVED') return 'Starting soon'
  if (!endDate) return 'In progress'
  const diff = endDate.getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`
  if (h > 0)   return `${h}h ${m}m left`
  return `${m}m left`
}

export default async function AuctionsPage() {
  const now = new Date()

  // Auto-close auctions whose event bidding window has expired
  const expiredEvents = await prisma.auctionEvent.findMany({
    where: { status: 'LIVE', biddingEndDate: { lte: now } },
    select: { id: true },
  })
  if (expiredEvents.length > 0) {
    const ids = expiredEvents.map(e => e.id)
    await Promise.all([
      prisma.auction.updateMany({ where: { status: 'LIVE', auctionEventId: { in: ids } }, data: { status: 'ENDED' } }),
      prisma.auctionEvent.updateMany({ where: { id: { in: ids } }, data: { status: 'ENDED' } }),
    ])
  }

  const auctions = await prisma.auction.findMany({
    where: { status: { in: ['APPROVED', 'LIVE', 'ENDED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      seller:       { select: { brandName: true, isVerified: true, location: { select: { name: true } } } },
      category:     { select: { name: true, slug: true } },
      auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true } },
      _count:       { select: { bids: true } },
    },
  })

  const live    = auctions.filter(a => a.status === 'LIVE')
  const upcoming = auctions.filter(a => a.status === 'APPROVED')
  const ended   = auctions.filter(a => a.status === 'ENDED')

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Members Only</div>
          <h1 className={styles.heroTitle}>Vuna Auctions</h1>
          <p className={styles.heroSub}>
            Bid on rare, one-of-a-kind pieces from verified African creators.
            Every auction is reviewed and approved by the Vuna team.
          </p>
          <div className={styles.heroBadge}>
            <Lock size={12} /> Verified buyers only
          </div>
        </div>
      </div>

      <div className={styles.inner}>

        {auctions.length === 0 && (
          <FadeIn>
            <div className={styles.emptyState}>
              <Gavel size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No auctions yet</h2>
              <p className={styles.emptySub}>
                The first Vuna auctions are being prepared. Check back soon.
              </p>
            </div>
          </FadeIn>
        )}

        {live.length > 0 && (
          <FadeIn>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.liveDot} />
                <h2 className={styles.sectionTitle}>Live Now</h2>
                <span className={styles.sectionCount}>{live.length}</span>
              </div>
              <div className={styles.grid}>
                {live.map(a => (
                  <AuctionCard key={a.id} auction={a} />
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {upcoming.length > 0 && (
          <FadeIn delay={60}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Coming Up</h2>
                <span className={styles.sectionCount}>{upcoming.length}</span>
              </div>
              <div className={styles.grid}>
                {upcoming.map(a => (
                  <AuctionCard key={a.id} auction={a} />
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {ended.length > 0 && (
          <FadeIn delay={80}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recently Ended</h2>
              </div>
              <div className={styles.grid}>
                {ended.slice(0, 6).map(a => (
                  <AuctionCard key={a.id} auction={a} />
                ))}
              </div>
            </section>
          </FadeIn>
        )}

      </div>
      <Footer />
    </div>
  )
}

function AuctionCard({ auction }: { auction: any }) {
  const isLive   = auction.status === 'LIVE'
  const isEnded  = auction.status === 'ENDED'
  const endDate  = auction.auctionEvent?.biddingEndDate ? new Date(auction.auctionEvent.biddingEndDate) : null
  const label    = timeLabel(endDate, auction.status)
  const price    = auction.currentBid ?? auction.startPrice

  return (
    <Link href={`/auctions/${auction.id}`} className={styles.card}>
      <div className={styles.cardImageWrap}>
        {auction.images[0] ? (
          <Image
            src={auction.images[0]}
            alt={auction.title}
            fill
            className={styles.cardImg}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.cardImageFallback}>
            <Gavel size={32} />
          </div>
        )}
        <div className={`${styles.statusBadge} ${styles[`status${auction.status}`]}`}>
          {isLive && <span className={styles.livePulse} />}
          {isLive ? 'Live' : isEnded ? 'Ended' : 'Soon'}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardCategory}>{auction.category.name}</div>
        <div className={styles.cardTitle}>{auction.title}</div>

        <div className={styles.cardMeta}>
          <span className={styles.cardSeller}>
            {auction.seller.brandName}
            {auction.seller.isVerified && <BadgeCheck size={11} className={styles.verified} />}
          </span>
          <span className={styles.cardLocation}>
            <MapPin size={10} /> {auction.seller.location.name}
          </span>
        </div>

        <div className={styles.cardFooter}>
          <div>
            <div className={styles.priceLabel}>
              {auction.currentBid ? 'Current bid' : 'Starting at'}
            </div>
            <div className={styles.price}>R{price.toFixed(2)}</div>
          </div>
          <div className={styles.cardRight}>
            <div className={styles.bids}>{auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}</div>
            <div className={`${styles.timeLabel} ${isLive ? styles.timeLive : ''}`}>
              <Clock size={11} /> {label}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
