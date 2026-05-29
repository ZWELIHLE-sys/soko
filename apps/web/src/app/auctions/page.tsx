import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import MarketCountdown from '@/components/market/MarketCountdown'
import Link from 'next/link'
import Image from 'next/image'
import { Gavel, Clock, MapPin, BadgeCheck, Lock, CalendarDays, BookOpen } from 'lucide-react'
import styles from './auctions.module.css'

export const revalidate = 30

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtShort(d: Date) {
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

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

  // Pick the most relevant active event: LIVE > CATALOGUE_OPEN > ANNOUNCED (soonest first within each)
  const activeEvents = await prisma.auctionEvent.findMany({
    where: { isActive: true, status: { in: ['LIVE', 'CATALOGUE_OPEN', 'ANNOUNCED'] } },
    orderBy: { biddingStartDate: 'asc' },
  })
  const featured =
    activeEvents.find(e => e.status === 'LIVE') ??
    activeEvents.find(e => e.status === 'CATALOGUE_OPEN') ??
    activeEvents[0] ?? null

  // Items for the featured event
  const featuredItems = featured
    ? await prisma.auction.findMany({
        where: {
          auctionEventId: featured.id,
          status: { in: ['APPROVED', 'LIVE', 'ENDED'] },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
        include: {
          seller:   { select: { brandName: true, isVerified: true, location: { select: { name: true } } } },
          category: { select: { name: true, slug: true } },
          auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true } },
          _count:   { select: { bids: true } },
        },
      })
    : []

  // Recently ended items from other events (last 6, not in featured event)
  const recentlyEnded = await prisma.auction.findMany({
    where: {
      status: 'ENDED',
      ...(featured ? { auctionEventId: { not: featured.id } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    include: {
      seller:   { select: { brandName: true, isVerified: true, location: { select: { name: true } } } },
      category: { select: { name: true, slug: true } },
      auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true } },
      _count:   { select: { bids: true } },
    },
  })

  const isLive        = featured?.status === 'LIVE'
  const isCatOpen     = featured?.status === 'CATALOGUE_OPEN'
  const isAnnounced   = featured?.status === 'ANNOUNCED'
  const submissionsOpen = isAnnounced && featured && now <= featured.submissionDeadline

  const liveItems     = featuredItems.filter(a => a.status === 'LIVE')
  const approvedItems = featuredItems.filter(a => a.status === 'APPROVED')
  const endedItems    = featuredItems.filter(a => a.status === 'ENDED')

  // ── No active event ──────────────────────────────────────────────────────────
  if (!featured) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.comingSoonHero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>One of a Kind</div>
            <h1 className={styles.heroTitle}>Vuna Auctions</h1>
            <p className={styles.heroSub}>
              Curated auction events featuring rare, one-of-a-kind pieces from verified African makers.
              Next event being announced — check back here first.
            </p>
            <div className={styles.heroBadge}>
              <Lock size={12} /> Verified buyers only
            </div>
          </div>
        </div>
        <div className={styles.inner}>
          {recentlyEnded.length > 0 ? (
            <FadeIn>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Recently Ended</h2>
                </div>
                <div className={styles.grid}>
                  {recentlyEnded.map(a => <AuctionCard key={a.id} auction={a} />)}
                </div>
              </section>
            </FadeIn>
          ) : (
            <FadeIn>
              <div className={styles.emptyState}>
                <Gavel size={48} className={styles.emptyIcon} />
                <h2 className={styles.emptyTitle}>No auctions yet</h2>
                <p className={styles.emptySub}>
                  The first Vuna auction event is being prepared. Check back soon.
                </p>
              </div>
            </FadeIn>
          )}
        </div>
        <Footer />
      </div>
    )
  }

  // ── Active event ─────────────────────────────────────────────────────────────
  const countdownTarget = isLive
    ? featured.biddingEndDate.toISOString()
    : isCatOpen
    ? featured.biddingStartDate.toISOString()
    : featured.catalogueOpenDate.toISOString()

  const countdownLabel = isLive
    ? 'Bidding closes in'
    : isCatOpen
    ? 'Bidding opens in'
    : 'Catalogue opens in'

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {isLive ? '🟢 Live Now' : 'Vuna Auctions'}
          </div>
          <h1 className={styles.heroTitle}>{featured.title}</h1>
          {featured.theme && (
            <div className={styles.theme}>{featured.theme}</div>
          )}
          <div className={styles.dates}>
            <CalendarDays size={14} />
            {fmtDate(featured.biddingStartDate)} — {fmtShort(featured.biddingEndDate)}
          </div>

          <MarketCountdown targetDate={countdownTarget} label={countdownLabel} />

          {isAnnounced && (
            <div className={styles.heroBadge}>
              <Lock size={12} /> Verified buyers only — catalogue opens {fmtShort(featured.catalogueOpenDate)}
            </div>
          )}
          {(isCatOpen || isLive) && (
            <div className={styles.heroBadge}>
              <Lock size={12} /> Verified buyers only
            </div>
          )}
        </div>
      </div>

      {/* ── Submission deadline strip ── */}
      {submissionsOpen && (
        <div className={styles.deadlineStrip}>
          <BookOpen size={14} />
          Seller submissions close on{' '}
          <strong>{fmtDate(featured.submissionDeadline)}</strong>
          {' — '}
          <Link href="/seller/auctions" className={styles.deadlineLink}>
            Submit your work →
          </Link>
        </div>
      )}

      <div className={styles.inner}>

        {/* Description */}
        {featured.description && (
          <FadeIn>
            <p className={styles.eventDesc}>{featured.description}</p>
          </FadeIn>
        )}

        {/* LIVE: items in bidding */}
        {isLive && liveItems.length > 0 && (
          <FadeIn>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.liveDot} />
                <h2 className={styles.sectionTitle}>Bidding Now</h2>
                <span className={styles.sectionCount}>{liveItems.length}</span>
              </div>
              <div className={styles.grid}>
                {liveItems.map(a => <AuctionCard key={a.id} auction={a} />)}
              </div>
            </section>
          </FadeIn>
        )}

        {/* CATALOGUE_OPEN or LIVE: approved items coming up */}
        {(isCatOpen || isLive) && approvedItems.length > 0 && (
          <FadeIn delay={60}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {isCatOpen ? 'Catalogue Preview' : 'Coming Up'}
                </h2>
                <span className={styles.sectionCount}>{approvedItems.length}</span>
              </div>
              {isCatOpen && (
                <p className={styles.catalogueNote}>
                  Bidding opens {fmtDate(featured.biddingStartDate)}. Browse the catalogue and decide what you want to bid on.
                </p>
              )}
              <div className={styles.grid}>
                {approvedItems.map(a => <AuctionCard key={a.id} auction={a} />)}
              </div>
            </section>
          </FadeIn>
        )}

        {/* ANNOUNCED: no items visible yet */}
        {isAnnounced && (
          <FadeIn>
            <div className={styles.emptyState}>
              <Gavel size={48} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Catalogue being prepared</h3>
              <p className={styles.emptySub}>
                Sellers are submitting their best work. The catalogue will be revealed
                on {fmtDate(featured.catalogueOpenDate)} — come back then to browse before bidding opens.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Ended items from this event */}
        {endedItems.length > 0 && (
          <FadeIn delay={80}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recently Ended</h2>
              </div>
              <div className={styles.grid}>
                {endedItems.map(a => <AuctionCard key={a.id} auction={a} />)}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Ended items from other events */}
        {recentlyEnded.length > 0 && (
          <FadeIn delay={100}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Past Auctions</h2>
              </div>
              <div className={styles.grid}>
                {recentlyEnded.map(a => <AuctionCard key={a.id} auction={a} />)}
              </div>
            </section>
          </FadeIn>
        )}

        {/* History link */}
        <FadeIn delay={120}>
          <div className={styles.historyFooter}>
            <Link href="/auctions/history" className={styles.historyLink}>
              View auction history →
            </Link>
          </div>
        </FadeIn>

      </div>
      <Footer />
    </div>
  )
}

function AuctionCard({ auction }: { auction: any }) {
  const isLive  = auction.status === 'LIVE'
  const isEnded = auction.status === 'ENDED'
  const endDate = auction.auctionEvent?.biddingEndDate ? new Date(auction.auctionEvent.biddingEndDate) : null
  const label   = timeLabel(endDate, auction.status)
  const price   = auction.currentBid ?? auction.startPrice

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
