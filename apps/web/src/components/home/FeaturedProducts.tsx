import Link from 'next/link'
import { prisma } from '@vuna/db'
import { Sprout, MapPin, ShieldCheck } from 'lucide-react'
import styles from './FeaturedProducts.module.css'

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { brandName: true, isVerified: true } },
      category: { select: { name: true, icon: true } },
      location: { select: { name: true } }
    }
  })
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section className={styles.section}>
      <div className={styles.divider} />

      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>
            Featured <span className={styles.headingAccent}>Products</span>
          </h2>
          <p className={styles.subtitle}>Handpicked from verified African sellers</p>
        </div>
        <Link href="/shop" className={styles.viewAll}>View all →</Link>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><Sprout size={48} /></div>
          <div className={styles.emptyTitle}>The first products are coming</div>
          <p className={styles.emptyText}>
            Soko is just getting started. Be the first African creator
            to list your work and reach the world.
          </p>
          <Link href="/register/seller" className={styles.emptyBtn}>
            Be The First Seller →
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map(product => (
            <Link key={product.id} href={`/product/${product.id}`} className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.imageArea}>
                  {product.category.icon}
                  {product.seller.isVerified && (
                    <span className={styles.verifiedBadge}>
                      <ShieldCheck size={10} /> Soko
                    </span>
                  )}
                </div>
                <div className={styles.info}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.sellerName}>by {product.seller.brandName}</div>
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
        </div>
      )}
    </section>
  )
}
