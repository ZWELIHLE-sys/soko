import Link from 'next/link'
import Image from 'next/image'
import { prisma, tickEventLifecycle } from '@vuna/db'
import { unstable_cache } from 'next/cache'
import { Sprout, MapPin, ShieldCheck, Gavel } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import styles from './FeaturedProducts.module.css'

// The read is cached 60s; the lifecycle tick (writes) runs uncached before it
const getFeaturedListings = unstable_cache(
  async () => {
    const listings = await prisma.featuredListing.findMany({
      where: { expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        product: {
          include: {
            seller:   { select: { brandName: true, isVerified: true } },
            category: { select: { name: true, icon: true } },
            location: { select: { name: true } },
          },
        },
      },
    })
    return listings.map(l => l.product)
  },
  ['home-featured-products'],
  { revalidate: 60, tags: ['featured-products'] },
)

async function getFeaturedProducts() {
  // Settle expired victory laps (FEATURED → SHOP) — must run live, not cached
  await tickEventLifecycle()
  return getFeaturedListings()
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section className={styles.section}>
      <FadeIn>
        <div className={styles.header}>
          <div>
            <h2 className={styles.heading}>
              <span className={styles.headingAccent}>Featured Products</span>
            </h2>
          </div>
          <Link href="/shop" className={styles.viewAll}>View all →</Link>
        </div>
      </FadeIn>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><Sprout size={48} /></div>
          <div className={styles.emptyTitle}>The first products are coming</div>
          <p className={styles.emptyText}>
            Vuna is just getting started. Be the first local maker
            to list your work and reach local buyers.
          </p>
          <Link href="/register/seller" className={styles.emptyBtn}>
            Be The First Seller →
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          <FadeIn stagger>
            {products.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className={styles.cardLink}>
                <div className={styles.card}>
                  <div className={styles.imageArea}>
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className={styles.cardImg}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <span className={styles.fallbackIcon}>{product.category.icon}</span>
                    )}
                    {product.seller.isVerified && (
                      <span className={styles.verifiedBadge}>
                        <ShieldCheck size={10} /> Vuna
                      </span>
                    )}
                    {product.pieceId && (
                      <span className={styles.hammerBadge}>
                        <Gavel size={10} /> Off the Hammer
                      </span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.sellerName}>
                      by {product.seller.brandName} · {product.category.name}
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>R{product.price.toFixed(2)}</span>
                      <span className={styles.location}>
                        <MapPin size={10} /> {product.location.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </FadeIn>
        </div>
      )}
    </section>
  )
}
