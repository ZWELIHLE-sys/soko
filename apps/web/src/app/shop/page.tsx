import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shirt, Palette, Armchair, Wheat, Sparkles, Box,
  Cpu, BookOpen, Lamp, Scissors, Hammer, Leaf, Pencil, Camera,
  Tag, Sprout, ArrowLeft, ShieldCheck, MapPin,
} from 'lucide-react'
import styles from './shop.module.css'

const categoryIcons: Record<string, React.ReactNode> = {
  fashion:     <Shirt size={40} />,
  art:         <Palette size={40} />,
  furniture:   <Armchair size={40} />,
  food:        <Wheat size={40} />,
  beauty:      <Sparkles size={40} />,
  sculpture:   <Box size={40} />,
  electronics: <Cpu size={40} />,
  books:       <BookOpen size={40} />,
  homeware:    <Lamp size={40} />,
  textiles:    <Scissors size={40} />,
  metalwork:   <Hammer size={40} />,
  wellness:    <Leaf size={40} />,
  drawings:    <Pencil size={40} />,
  photography: <Camera size={40} />,
}

const categoryIconsSmall: Record<string, React.ReactNode> = {
  fashion:     <Shirt size={16} />,
  art:         <Palette size={16} />,
  furniture:   <Armchair size={16} />,
  food:        <Wheat size={16} />,
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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: categorySlug } = await searchParams

  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      ...(category ? { categoryId: category.id } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      seller:   { select: { brandName: true, isVerified: true } },
      category: { select: { name: true, icon: true, slug: true } },
      location: { select: { name: true } },
    },
  })

  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  const heroIcon = category ? (categoryIcons[category.slug] ?? <Tag size={40} />) : null

  return (
    <div className={styles.page}>
      <Navbar />

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

          {heroIcon && <div className={styles.heroIcon}>{heroIcon}</div>}
          <h1 className={styles.heroTitle}>
            {category ? category.name : 'All Products'}
          </h1>
          <p className={styles.heroSub}>
            {category?.description ?? 'Every product. African made. Vuna verified.'}
          </p>
        </div>
      </div>

      <div className={styles.inner}>
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {heroIcon ?? <Sprout size={52} />}
            </div>
            <h2 className={styles.emptyTitle}>
              {category
                ? `${category.name} products are on their way`
                : 'The harvest is coming'}
            </h2>
            <p className={styles.emptySub}>
              {category
                ? `Verified African makers who create ${category.name.toLowerCase()} are joining Vuna. Register as a buyer to be ready when the first listings go live.`
                : 'African makers are being verified and their products are almost here. Register now so you are ready to shop the moment the first listing goes live.'}
            </p>

            <div className={styles.emptyActions}>
              <Link href="/register/buyer" className={styles.emptyBtn}>
                Register to Shop →
              </Link>
              {category && (
                <Link href="/shop" className={styles.emptySecondary}>
                  <ArrowLeft size={14} /> Browse all categories
                </Link>
              )}
            </div>

            <p className={styles.emptySellerNote}>
              Are you an African creator?{' '}
              <Link href="/register/seller" className={styles.emptySellerLink}>
                Apply to sell your work on Vuna →
              </Link>
            </p>

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
      </div>

      <Footer />
    </div>
  )
}
