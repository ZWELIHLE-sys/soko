import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import Link from 'next/link'
import { Store, ArrowLeft, BadgeCheck, MapPin, CalendarDays } from 'lucide-react'
import styles from './history.module.css'

export const revalidate = 300

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtShort(d: Date) {
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

const MARKET_TYPE_LABEL: Record<string, string> = {
  SUNDAY_MARKET:      'Day Market',
  FRIDAY_NIGHT_MARKET: 'Night Market',
}

export default async function MarketHistoryPage() {
  const now = new Date()

  const pastMarkets = await prisma.market.findMany({
    where: { endDate: { lt: now } },
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { listings: true } },
      listings: {
        where: { status: 'APPROVED' },
        include: {
          seller: {
            select: {
              brandName: true,
              isVerified: true,
              location:  { select: { name: true } },
              category:  { select: { name: true, icon: true } },
            },
          },
        },
      },
    },
  })

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Vuna Market</div>
          <h1 className={styles.heroTitle}>Market History</h1>
          <p className={styles.heroSub}>
            Every Vuna Market that has come and gone. The makers, the stalls,
            and the community that showed up.
          </p>
        </div>
      </div>

      <div className={styles.inner}>

        <Link href="/market" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Market
        </Link>

        {pastMarkets.length === 0 ? (
          <FadeIn>
            <div className={styles.emptyState}>
              <Store size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No past markets yet</h2>
              <p className={styles.emptySub}>
                History is being written. Check back after the first Vuna Market concludes.
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className={styles.marketList}>
            {pastMarkets.map((market, i) => {
              const approvedSellers = market.listings
              const typeLabel = MARKET_TYPE_LABEL[market.marketType] ?? market.marketType

              return (
                <FadeIn key={market.id} delay={i * 40}>
                  <div className={styles.marketCard}>

                    <div className={styles.marketHeader}>
                      <div className={styles.marketLeft}>
                        <div className={styles.marketTypeBadge}>{typeLabel}</div>
                        <h2 className={styles.marketTitle}>{market.title}</h2>
                        {market.theme && (
                          <div className={styles.marketTheme}>{market.theme}</div>
                        )}
                        <div className={styles.marketDate}>
                          <CalendarDays size={12} />
                          {fmtDate(market.startDate)}
                          {market.startDate.toDateString() !== market.endDate.toDateString() && (
                            <> — {fmtShort(market.endDate)}</>
                          )}
                        </div>
                      </div>
                      <div className={styles.marketStat}>
                        <span className={styles.statValue}>{approvedSellers.length}</span>
                        <span className={styles.statLabel}>Sellers</span>
                      </div>
                    </div>

                    {approvedSellers.length > 0 && (
                      <div className={styles.sellerList}>
                        {approvedSellers.map(listing => (
                          <div key={listing.id} className={styles.sellerRow}>
                            <div className={styles.sellerAvatar}>
                              {listing.seller.brandName.charAt(0)}
                            </div>
                            <div className={styles.sellerInfo}>
                              <div className={styles.sellerName}>
                                {listing.seller.brandName}
                                {listing.seller.isVerified && (
                                  <BadgeCheck size={11} className={styles.verified} />
                                )}
                              </div>
                              <div className={styles.sellerMeta}>
                                <MapPin size={10} />
                                {listing.seller.location.name}
                                {' · '}
                                {listing.seller.category.icon} {listing.seller.category.name}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {approvedSellers.length === 0 && (
                      <div className={styles.noSellers}>No confirmed sellers on record for this market.</div>
                    )}

                  </div>
                </FadeIn>
              )
            })}
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}
