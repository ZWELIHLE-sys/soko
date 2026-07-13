import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import LiveBanner from '@/components/live/LiveBanner'
import MCFeed from '@/components/live/MCFeed'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shirt, Palette, Armchair, Wheat, Sparkles, Box,
  Cpu, BookOpen, Lamp, Scissors, Hammer, Leaf, Pencil, Camera,
  Tag, Sprout, ArrowLeft, ShieldCheck, MapPin, PawPrint, Carrot,
} from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import styles from './shop.module.css'
import { ShopFilters } from './_components/ShopFilters'

const categoryIcons: Record<string, React.ReactNode> = {
  fashion:     <Shirt size={32} />,
  art:         <Palette size={32} />,
  furniture:   <Armchair size={32} />,
  food:        <Wheat size={32} />,
  livestock:   <PawPrint size={32} />,
  produce:     <Carrot size={32} />,
  beauty:      <Sparkles size={32} />,
  sculpture:   <Box size={32} />,
  electronics: <Cpu size={32} />,
  books:       <BookOpen size={32} />,
  homeware:    <Lamp size={32} />,
  textiles:    <Scissors size={32} />,
  metalwork:   <Hammer size={32} />,
  wellness:    <Leaf size={32} />,
  drawings:    <Pencil size={32} />,
  photography: <Camera size={32} />,
}

const categoryIconsSmall: Record<string, React.ReactNode> = {
  fashion:     <Shirt size={16} />,
  art:         <Palette size={16} />,
  furniture:   <Armchair size={16} />,
  food:        <Wheat size={16} />,
  livestock:   <PawPrint size={16} />,
  produce:     <Carrot size={16} />,
  beauty:      <Sparkles size={16} />,
  sculpture:   <Box size={16} />,
  electronics: <Cpu size={16} />,
  books:       <BookOpen size={16} />,
  homeware:    <Lamp size={16} />,
  textiles:    <Scissors size={16} />,
  metalwork:   <Hammer size={16} />,
  wellness:    <Leaf size={16} />,
  drawings:    <Pencil size={16} />,
  photography: <Camera size={16} />,
}

const PAGE_SIZE = 24

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; locationId?: string; seller?: string; page?: string }>
}) {
  const { category: categorySlug, q, locationId, seller: sellerId, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null

  const where = {
    status: 'ACTIVE' as const,
    ...(category ? { categoryId: category.id } : {}),
    ...(q ? {
      OR: [
        { name:        { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
    ...(locationId ? { locationId } : {}),
    ...(sellerId ? { sellerId } : {}),
  }

  // Fetch one page + the total count in parallel (count powers the page controls)
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        seller:   { select: { brandName: true, isVerified: true } },
        category: { select: { name: true, icon: true, slug: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ])
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Preserve active filters when moving between pages
  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (categorySlug) params.set('category', categorySlug)
    if (q) params.set('q', q)
    if (locationId) params.set('locationId', locationId)
    if (sellerId) params.set('seller', sellerId)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/shop?${qs}` : '/shop'
  }

  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className={styles.page}>
      <Navbar />
      <LiveBanner />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>/</span>
            <Link href="/shop" className={styles.breadLink}>Shop</Link>
            {category && (
              <>
                <span className={styles.breadSep}>/</span>
                <span className={styles.breadCurrent}>{category.name}</span>
              </>
            )}
          </nav>

          {q ? (
            <h1 className={styles.heroTitle}>Results for &ldquo;{q}&rdquo;</h1>
          ) : category ? (
            <h1 className={styles.heroTitle}>{category.name}</h1>
          ) : (
            <div className={styles.heroEyebrow}>Categories &amp; Products</div>
          )}

          <p className={styles.heroSub}>
            {q
              ? `${totalCount} product${totalCount !== 1 ? 's' : ''} found`
              : category?.description ?? 'Every product. locally made. Vuna verified.'}
          </p>
        </div>
      </div>

      <ShopFilters
        categorySlug={categorySlug ?? ''}
        initialQ={q ?? ''}
        initialLocationId={locationId ?? ''}
      />

      <FadeIn>
      <div className={styles.inner}>
        {/* Shop-room MC moments — "just off the hammer" drops land here */}
        <MCFeed channel="SHOP" />

        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Sprout size={52} />
            </div>
            <h2 className={styles.emptyTitle}>
              {q
                ? `No products found for "${q}"`
                : category
                  ? `${category.name} products are on their way`
                  : 'The harvest is coming'}
            </h2>
            <p className={styles.emptySub}>
              {q
                ? 'Try a different search term, or browse by category.'
                : category
                  ? `Verified local makers who create ${category.name.toLowerCase()} are joining Vuna. Register as a buyer to be ready when the first listings go live.`
                  : 'local makers are being verified and their products are almost here. Register now so you are ready to shop the moment the first listing goes live.'}
            </p>

            <div className={styles.emptyActions}>
              {q ? (
                <Link href="/shop" className={styles.emptyBtn}>Browse all products</Link>
              ) : (
                <Link href="/register/buyer" className={styles.emptyBtn}>
                  Register to Shop →
                </Link>
              )}
              {category && (
                <Link href="/shop" className={styles.emptySecondary}>
                  <ArrowLeft size={14} /> Browse all categories
                </Link>
              )}
            </div>

            {!q && (
              <p className={styles.emptySellerNote}>
                Are you an local maker?{' '}
                <Link href="/register/seller" className={styles.emptySellerLink}>
                  Apply to sell your work on Vuna →
                </Link>
              </p>
            )}

            {!q && (
              <div className={styles.otherCategories}>
                <div className={styles.otherLabel}>
                  {categorySlug ? 'Browse other categories' : 'Browse by category'}
                </div>
                <div className={styles.otherGrid}>
                  {allCategories
                    .filter(c => c.slug !== categorySlug)
                    .map(c => (
                      <Link
                        key={c.id}
                        href={`/shop?category=${c.slug}`}
                        className={styles.otherCard}
                      >
                        <span className={styles.otherCardIcon}>
                          {categoryIconsSmall[c.slug] ?? <Tag size={16} />}
                        </span>
                        {c.name}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className={styles.cardLink}>
                <div className={styles.card}>
                  <div className={styles.cardImageWrap}>
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className={styles.cardImg}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className={styles.cardImageFallback}>
                        {categoryIcons[product.category.slug] ?? <Tag size={32} />}
                      </div>
                    )}
                    {product.seller.isVerified && (
                      <span className={styles.cardVerifiedBadge}>
                        <ShieldCheck size={10} /> Vuna Verified
                      </span>
                    )}
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardCategory}>{product.category.name}</div>
                    <div className={styles.cardName}>{product.name}</div>
                    <div className={styles.cardSeller}>by {product.seller.brandName}</div>
                    <div className={styles.cardPriceRow}>
                      <span className={styles.cardPrice}>R{product.price.toFixed(2)}</span>
                      <span className={styles.cardLocation}>
                        <MapPin size={10} /> {product.location.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Shop pages">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className={styles.pageLink}>← Previous</Link>
            )}
            <span className={styles.pageStatus}>Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={pageHref(page + 1)} className={styles.pageLink}>Next →</Link>
            )}
          </nav>
        )}
      </div>
      </FadeIn>

      <Footer />
    </div>
  )
}
