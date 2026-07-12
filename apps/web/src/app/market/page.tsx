import { prisma, tickEventLifecycle } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import LiveBanner from '@/components/live/LiveBanner'
import MCFeed from '@/components/live/MCFeed'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import MarketCountdown from '@/components/market/MarketCountdown'
import WhatsAppShare from '@/components/ui/WhatsAppShare'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, CalendarDays, ShoppingBag, Store, Clock, Sparkles, PawPrint } from 'lucide-react'
import styles from './market.module.css'

export const revalidate = 60

async function getMarket() {
  await tickEventLifecycle()
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
          // Track B: the special piece on viewing day (livestock papers ride along)
          piece: {
            select: {
              id: true,
              title: true,
              images: true,
              currentStage: true,
              livestockDetail: {
                select: { species: true, breed: true, purpose: true, sex: true, approxAgeMonths: true, weightKg: true },
              },
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
        <LiveBanner />
        <div className={styles.comingSoonHero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>One of a Kind</div>
            <h1 className={styles.heroTitle}>Vuna Market</h1>
            <p className={styles.heroSub}>
              A curated pop-up of verified local makers. Limited stalls, handpicked sellers.
              Next date being announced — check back here first.
            </p>
            <Link href="/shop" className={styles.shopBadge}>
              <ShoppingBag size={12} />
              Browse Shop
            </Link>
          </div>
        </div>

        <div className={styles.inner}>
          <FadeIn>
            <div className={styles.emptyState}>
              <Store size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No market events yet</h2>
              <p className={styles.emptySub}>
                When the Vuna team announces the next market, confirmed sellers and their
                products will appear right here. Come back on announcement day.
              </p>
            </div>
          </FadeIn>
          <div className={styles.historyFooter}>
            <Link href="/market/history" className={styles.historyLink}>
              View market history →
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
      <LiveBanner />

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {isLive ? <><span className={styles.eyebrowLiveDot} />Live Now</> : 'Vuna Market'}
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

          <div className={styles.shareRow}>
            <WhatsAppShare
              text={isLive
                ? `I'm at ${market.title} on Vuna right now — it closes soon. Come see!`
                : `${market.title} is coming to Vuna on ${formatDate(market.startDate)} — come with me!`}
            />
          </div>
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

        {/* The MC's stage — live moments inside the venue */}
        <MCFeed channel="MARKET" />

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

                    {/* Viewing day — the special piece this stall brought to the market */}
                    {listing.piece && listing.piece.currentStage === 'MARKET' && (
                      <div className={styles.viewingCard}>
                        <div className={styles.viewingThumb}>
                          {listing.piece.images[0] ? (
                            <Image
                              src={listing.piece.images[0]}
                              alt={listing.piece.title}
                              fill
                              className={styles.thumbImg}
                              sizes="88px"
                            />
                          ) : (
                            <div className={styles.thumbFallback}><Sparkles size={18} /></div>
                          )}
                        </div>
                        <div className={styles.viewingBody}>
                          <div className={styles.viewingEyebrow}>
                            <Sparkles size={10} /> On viewing today
                          </div>
                          <div className={styles.viewingTitle}>{listing.piece.title}</div>
                          {listing.piece.livestockDetail && (
                            <div className={styles.viewingPapers}>
                              <PawPrint size={10} />
                              {listing.piece.livestockDetail.breed}
                              {' · '}{listing.piece.livestockDetail.purpose.replace('_', ' ').toLowerCase()}
                              {listing.piece.livestockDetail.sex && <> · {listing.piece.livestockDetail.sex.toLowerCase()}</>}
                              {listing.piece.livestockDetail.approxAgeMonths != null && <> · {listing.piece.livestockDetail.approxAgeMonths} months</>}
                              {listing.piece.livestockDetail.weightKg != null && <> · {listing.piece.livestockDetail.weightKg} kg</>}
                            </div>
                          )}
                          <div className={styles.viewingNote}>
                            Inspect it here — bidding opens at the next auction
                          </div>
                        </div>
                      </div>
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

        <div className={styles.historyFooter}>
          <Link href="/market/history" className={styles.historyLink}>
            View market history →
          </Link>
        </div>

      </div>
      <Footer />
    </div>
  )
}
