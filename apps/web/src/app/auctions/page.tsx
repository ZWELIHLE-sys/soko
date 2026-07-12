import { prisma, tickEventLifecycle } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import LiveBanner from '@/components/live/LiveBanner'
import MCFeed from '@/components/live/MCFeed'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import MarketCountdown from '@/components/market/MarketCountdown'
import Link from 'next/link'
import { Gavel, Lock, CalendarDays, BookOpen } from 'lucide-react'
import styles from './auctions.module.css'
import { AuctionCard } from './_components/AuctionCard'

export const revalidate = 30

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtShort(d: Date) {
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AuctionsPage() {
  await tickEventLifecycle()
  const now = new Date()

  const activeEvents = await prisma.auctionEvent.findMany({
    where: { isActive: true, status: { in: ['LIVE', 'CATALOGUE_OPEN', 'ANNOUNCED'] } },
    orderBy: { biddingStartDate: 'asc' },
  })
  const featured =
    activeEvents.find(e => e.status === 'LIVE') ??
    activeEvents.find(e => e.status === 'CATALOGUE_OPEN') ??
    activeEvents[0] ?? null

  const itemInclude = {
    seller:   { select: { brandName: true, isVerified: true, location: { select: { name: true } } } },
    category: { select: { name: true, slug: true } },
    auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true } },
    _count:   { select: { bids: true } },
  }

  const featuredItems = featured
    ? await prisma.auction.findMany({
        where: { auctionEventId: featured.id, status: { in: ['APPROVED', 'LIVE', 'ENDED'] } },
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
        include: itemInclude,
      })
    : []

  const recentlyEnded = await prisma.auction.findMany({
    where: { status: 'ENDED', ...(featured ? { auctionEventId: { not: featured.id } } : {}) },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    include: itemInclude,
  })

  const isLive      = featured?.status === 'LIVE'
  const isCatOpen   = featured?.status === 'CATALOGUE_OPEN'
  const isAnnounced = featured?.status === 'ANNOUNCED'
  const submissionsOpen = isAnnounced && featured && now <= featured.submissionDeadline

  const liveItems     = featuredItems.filter(a => a.status === 'LIVE')
  const approvedItems = featuredItems.filter(a => a.status === 'APPROVED')
  const endedItems    = featuredItems.filter(a => a.status === 'ENDED')

  if (!featured) {
    return (
      <div className={styles.page}>
        <Navbar />
        <LiveBanner />
        <div className={styles.comingSoonHero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>One of a Kind</div>
            <h1 className={styles.heroTitle}>Vuna Auctions</h1>
            <p className={styles.heroSub}>
              Curated auction events featuring rare, one-of-a-kind pieces from verified local makers.
              Next event being announced — check back here first.
            </p>
            <div className={styles.heroBadge}><Lock size={12} /> Verified buyers only</div>
          </div>
        </div>
        <div className={styles.inner}>
          <FadeIn>
            <div className={styles.emptyState}>
              <Gavel size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No auctions yet</h2>
              <p className={styles.emptySub}>The first Vuna auction event is being prepared. Check back soon.</p>
            </div>
          </FadeIn>
          {recentlyEnded.length > 0 && (
            <FadeIn delay={120}>
              <div className={styles.historyFooter}>
                <Link href="/auctions/history" className={styles.historyLink}>View auction history →</Link>
              </div>
            </FadeIn>
          )}
        </div>
        <Footer />
      </div>
    )
  }

  const countdownTarget = isLive
    ? featured.biddingEndDate.toISOString()
    : isCatOpen
    ? featured.biddingStartDate.toISOString()
    : featured.catalogueOpenDate.toISOString()

  const countdownLabel = isLive ? 'Bidding closes in' : isCatOpen ? 'Bidding opens in' : 'Catalogue opens in'

  return (
    <div className={styles.page}>
      <Navbar />
      <LiveBanner />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {isLive ? <><span className={styles.eyebrowLiveDot} />Live Now</> : 'Vuna Auctions'}
          </div>
          <h1 className={styles.heroTitle}>{featured.title}</h1>
          {featured.theme && <div className={styles.theme}>{featured.theme}</div>}
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
            <div className={styles.heroBadge}><Lock size={12} /> Verified buyers only</div>
          )}
        </div>
      </div>

      {submissionsOpen && (
        <div className={styles.deadlineStrip}>
          <BookOpen size={14} />
          Seller submissions close on <strong>{fmtDate(featured.submissionDeadline)}</strong>
          {' — '}
          <Link href="/seller/auctions" className={styles.deadlineLink}>Submit your work →</Link>
        </div>
      )}

      <div className={styles.inner}>
        {/* The MC's stage — live moments inside the venue */}
        <MCFeed channel="AUCTION" />

        {featured.description && (
          <FadeIn><p className={styles.eventDesc}>{featured.description}</p></FadeIn>
        )}

        {isLive && liveItems.length > 0 && (
          <section className={styles.section}>
            <FadeIn>
              <div className={styles.sectionHeader}>
                <span className={styles.liveDot} />
                <h2 className={styles.sectionTitle}>Bidding Now</h2>
                <span className={styles.sectionCount}>{liveItems.length}</span>
              </div>
            </FadeIn>
            <div className={styles.grid}>
              <FadeIn stagger>
                {liveItems.map(a => <AuctionCard key={a.id} auction={a} />)}
              </FadeIn>
            </div>
          </section>
        )}

        {(isCatOpen || isLive) && approvedItems.length > 0 && (
          <section className={styles.section}>
            <FadeIn delay={60}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{isCatOpen ? 'Catalogue Preview' : 'Coming Up'}</h2>
                <span className={styles.sectionCount}>{approvedItems.length}</span>
              </div>
              {isCatOpen && (
                <p className={styles.catalogueNote}>
                  Bidding opens {fmtDate(featured.biddingStartDate)}. Browse the catalogue and decide what you want to bid on.
                </p>
              )}
            </FadeIn>
            <div className={styles.grid}>
              <FadeIn stagger>
                {approvedItems.map(a => <AuctionCard key={a.id} auction={a} />)}
              </FadeIn>
            </div>
          </section>
        )}

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

        <FadeIn delay={120}>
          <div className={styles.historyFooter}>
            <Link href="/auctions/history" className={styles.historyLink}>View auction history →</Link>
          </div>
        </FadeIn>
      </div>

      <Footer />
    </div>
  )
}
