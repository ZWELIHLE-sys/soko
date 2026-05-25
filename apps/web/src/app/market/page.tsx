import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import MarketCountdown from '@/components/market/MarketCountdown'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, CalendarDays, ShoppingBag, Store, Clock } from 'lucide-react'
import styles from './market.module.css'

export const revalidate = 60

async function getMarket() {
  const now = new Date()
  return prisma.market.findFirst({
    where: { isActive: true, endDate: { gte: now } },
    orderBy: { startDate: 'asc' },
    include: {
      listings: {
        where: { status: 'APPROVED' },
        include: {
          seller: {
            select: {
              id: true,
              brandName: true,
              bio: true,
              avatar: true,
              isVerified: true,
              location: { select: { name: true } },
              category: { select: { name: true, icon: true, slug: true } },
            },
          },
        },
      },
    },
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function MarketPage() {
  const market = await getMarket()
  const now = new Date()

  if (!market) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.comingSoonHero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Vuna Market</div>
            <h1 className={styles.heroTitle}>Something Special Is Coming</h1>
            <p className={styles.heroSub}>
              The Vuna Market is a monthly pop-up where verified African creators bring their best
              work together in one place. Dates are announced ahead of time — follow us to be first to know.
            </p>
            <Link href="/shop" className={styles.shopBtn}>
              <ShoppingBag size={16} />
              Browse the shop while you wait
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const isLive       = now >= market.startDate && now <= market.endDate
  const isUpcoming   = now < market.startDate
  const appOpen      = now <= market.applicationDeadline
  const approvedCount = market.listings.length

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {isLive ? '🟢 Live Now' : 'Vuna Market'}
          </div>
          <h1 className={styles.heroTitle}>{market.title}</h1>
          {market.theme && (
            <div className={styles.theme}>{market.theme}</div>
          )}
          <div className={styles.dates}>
            <CalendarDays size={14} />
            {formatDate(market.startDate)} — {formatDate(market.endDate)}
          </div>

          {isUpcoming && (
            <MarketCountdown
              targetDate={market.startDate.toISOString()}
              label="Market opens in"
            />
          )}

          {isLive && (
            <MarketCountdown
              targetDate={market.endDate.toISOString()}
              label="Market closes in"
            />
          )}

          {appOpen && isUpcoming && (
            <Link href="/market/apply" className={styles.applyBtn}>
              <Store size={15} />
              Apply to sell at this market
            </Link>
          )}
        </div>
      </div>

      {/* Application deadline strip */}
      {appOpen && isUpcoming && (
        <div className={styles.deadlineStrip}>
          <Clock size={14} />
          Seller applications close on{' '}
          <strong>{formatDate(market.applicationDeadline)}</strong>
          {' — '}
          <Link href="/market/apply" className={styles.deadlineLink}>
            Apply now →
          </Link>
        </div>
      )}

      <div className={styles.inner}>

        {/* Description */}
        {market.description && (
          <FadeIn>
            <p className={styles.marketDesc}>{market.description}</p>
          </FadeIn>
        )}

        {/* Sellers section */}
        <FadeIn>
          <h2 className={styles.sectionTitle}>
            {isLive ? 'Sellers At This Market' : 'Confirmed Sellers'}
            {approvedCount > 0 && (
              <span className={styles.count}>{approvedCount}</span>
            )}
          </h2>
        </FadeIn>

        {approvedCount === 0 ? (
          <FadeIn>
            <div className={styles.emptyState}>
              <Store size={44} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Sellers are being confirmed</h3>
              <p className={styles.emptySub}>
                Applications are being reviewed. Approved sellers will appear here shortly.
              </p>
              {appOpen && (
                <Link href="/market/apply" className={styles.emptyApplyBtn}>
                  Apply to sell at this market →
                </Link>
              )}
            </div>
          </FadeIn>
        ) : (
          <div className={styles.sellersGrid}>
            {market.listings.map(async (listing) => {
              const products = listing.productIds.length > 0
                ? await prisma.product.findMany({
                    where: { id: { in: listing.productIds }, status: 'ACTIVE' },
                    select: { id: true, name: true, price: true, images: true },
                  })
                : []

              return (
                <FadeIn key={listing.id}>
                  <div className={styles.sellerCard}>
                    <div className={styles.sellerHeader}>
                      <div className={styles.avatar}>
                        {listing.seller.brandName.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.sellerNameRow}>
                          <span className={styles.sellerName}>{listing.seller.brandName}</span>
                          {listing.seller.isVerified && (
                            <span className={styles.verifiedBadge}>
                              <BadgeCheck size={11} /> Verified
                            </span>
                          )}
                        </div>
                        <div className={styles.sellerMeta}>
                          <MapPin size={11} />
                          {listing.seller.location.name}
                          {' · '}
                          {listing.seller.category.name}
                        </div>
                      </div>
                    </div>

                    {listing.seller.bio && (
                      <p className={styles.sellerBio}>{listing.seller.bio}</p>
                    )}

                    {products.length > 0 && (
                      <div className={styles.productRow}>
                        {products.slice(0, 3).map(product => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className={styles.productThumb}
                          >
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className={styles.thumbImg}
                                sizes="120px"
                              />
                            ) : (
                              <div className={styles.thumbFallback}>
                                {listing.seller.category.icon}
                              </div>
                            )}
                          </Link>
                        ))}
                        {products.length > 3 && (
                          <div className={styles.moreProducts}>
                            +{products.length - 3} more
                          </div>
                        )}
                      </div>
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
