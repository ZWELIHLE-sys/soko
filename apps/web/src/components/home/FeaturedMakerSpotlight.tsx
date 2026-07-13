import Link from 'next/link'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import { prisma } from '@vuna/db'
import { MapPin, BadgeCheck, Star, Tag, Package } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import styles from './FeaturedMakerSpotlight.module.css'

// Cached 2 min — the featured maker changes weekly, its products rarely
const getSpotlight = unstable_cache(async () => {
  const featured = await prisma.featuredMaker.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true, brandName: true, avatar: true, bio: true, isVerified: true,
          location: { select: { name: true } },
          category: { select: { name: true } },
        },
      },
    },
  })
  if (!featured) return null

  const [products, liveStall] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: featured.seller.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, name: true, price: true, images: true },
    }),
    // Does this maker have an approved stall at the current/upcoming market?
    // If so, "their stall" means the market — otherwise it means their shop.
    prisma.marketListing.findFirst({
      where: {
        sellerId: featured.seller.id,
        status: 'APPROVED',
        market: { isActive: true, endDate: { gte: new Date() } },
      },
      select: { market: { select: { title: true } } },
    }),
  ])

  return { ...featured, products, liveStall }
}, ['home-featured-maker'], { revalidate: 120, tags: ['featured-maker'] })

export default async function FeaturedMakerSpotlight() {
  const spotlight = await getSpotlight()
  if (!spotlight) return null

  const { seller, note, products, liveStall } = spotlight

  return (
    <section className={styles.section}>
      <FadeIn>
        <div className={styles.card}>
          <div className={styles.makerSide}>
            <div className={styles.eyebrow}>
              <Star size={12} /> Featured Maker of the Week
            </div>

            <div className={styles.makerRow}>
              <div className={styles.avatarWrap}>
                {seller.avatar ? (
                  <Image src={seller.avatar} alt={seller.brandName} fill sizes="72px" className={styles.avatarImg} />
                ) : (
                  <span className={styles.avatarLetter}>{seller.brandName.charAt(0)}</span>
                )}
              </div>
              <div>
                <h2 className={styles.makerName}>
                  {seller.brandName}
                  {seller.isVerified && <BadgeCheck size={18} className={styles.verified} />}
                </h2>
                <div className={styles.makerMeta}>
                  <span className={styles.metaLoc}><Tag size={11} /> {seller.category.name}</span>
                  {seller.location && (
                    <span className={styles.metaLoc}><MapPin size={11} /> {seller.location.name}</span>
                  )}
                </div>
              </div>
            </div>

            {note ? (
              <p className={styles.note}>&ldquo;{note}&rdquo;</p>
            ) : seller.bio ? (
              <p className={styles.note}>{seller.bio}</p>
            ) : null}

            {liveStall ? (
              <Link href="/market" className={styles.cta}>
                Visit their stall at {liveStall.market.title} →
              </Link>
            ) : (
              <Link href={`/shop?seller=${seller.id}`} className={styles.cta}>
                Visit their shop →
              </Link>
            )}
          </div>

          {products.length > 0 && (
            <div className={styles.productStrip}>
              {products.map(p => (
                <Link key={p.id} href={`/product/${p.id}`} className={styles.productCard}>
                  <div className={styles.productImg}>
                    {p.images[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill sizes="160px" className={styles.productImage} />
                    ) : (
                      <span className={styles.productFallback}><Package size={30} /></span>
                    )}
                  </div>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productPrice}>R{p.price.toFixed(2)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
