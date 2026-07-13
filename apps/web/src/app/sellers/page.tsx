import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import Link from 'next/link'
import Image from 'next/image'
import {
  BadgeCheck, Banknote, Globe, ShieldCheck, Sprout,
} from 'lucide-react'
import styles from './sellers.module.css'
import { SellersFilter } from './_components/SellersFilter'

const benefits = [
  {
    icon: <Globe size={24} />,
    title: 'Your Brand. Your Story.',
    desc: 'You set the price, you tell your story, you own your shop. Vuna amplifies your voice — it never replaces it.',
  },
  {
    icon: <BadgeCheck size={24} />,
    title: 'The Vuna Verified Badge',
    desc: 'Our team personally reviews every seller. When buyers see the badge, they know your product is real and your story is true.',
  },
  {
    icon: <Banknote size={24} />,
    title: 'Direct Payments To You',
    desc: 'Money goes straight to you. No middlemen eating your margin. No waiting. Your craft earns for you directly.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Apply in 5 Minutes',
    desc: 'Fill in your brand name, your story, your location and what you make. We want to know who you are, not just what you sell.',
  },
  {
    num: '02',
    title: 'Get Verified by Our Team',
    desc: 'We personally review every application within 48 hours. We may ask for a short video or photo of you making your product.',
  },
  {
    num: '03',
    title: 'List, Sell & Earn',
    desc: 'Once verified, upload your products and start reaching buyers across the country.',
  },
]

const rules = [
  {
    num: '01',
    title: 'Locally Owned',
    desc: 'Every seller must be a local resident.',
  },
  {
    num: '02',
    title: 'Maker Made',
    desc: 'Every product must be made, grown or built by the seller themselves.',
  },
  {
    num: '03',
    title: 'Vuna Verified',
    desc: 'Every seller is personally reviewed before going live.',
  },
]

const PAGE_SIZE = 24

export default async function SellersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; locationId?: string; page?: string }>
}) {
  const { q, locationId, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  const where = {
    isVerified: true,
    status: 'VERIFIED' as const,
    ...(q ? {
      OR: [
        { brandName: { contains: q, mode: 'insensitive' as const } },
        { name:      { contains: q, mode: 'insensitive' as const } },
        { bio:       { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
    ...(locationId ? { locationId } : {}),
  }

  const [sellers, totalCount] = await Promise.all([
    prisma.seller.findMany({
      where,
      orderBy: { brandName: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        location: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.seller.count({ where }),
  ])
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (locationId) params.set('locationId', locationId)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/sellers?${qs}` : '/sellers'
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>Sellers</span>
          </nav>
          <div className={styles.heroEyebrow}>Join Vuna Sellers</div>
          <p className={styles.heroSub}>
            Turn your craft, your harvest, your art into income.
            Vuna gives you the platform. Home gives you the story.
          </p>
          <Link href="/register/seller" className={styles.heroBtn}>
            Apply To Sell on Vuna →
          </Link>
          <p className={styles.heroBuyerNote}>
            Here to shop?{' '}
            <Link href="/shop" className={styles.heroBuyerLink}>
              Browse local products →
            </Link>
          </p>
        </div>
      </div>

      <div className={styles.statsStrip}>
        <div className={styles.statsInner}>
          <div className={styles.stat}>
            <div className={styles.statNum}>100%</div>
            <div className={styles.statLabel}>Locally Made</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>Home</div>
            <div className={styles.statLabel}>Locally Grown</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>48h</div>
            <div className={styles.statLabel}>Verification Time</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>Free</div>
            <div className={styles.statLabel}>To Apply &amp; List</div>
          </div>
        </div>
      </div>

      <div className={styles.content}>

        <FadeIn>
          <section className={styles.benefitsSection}>
            <div className={styles.sectionEyebrow}>Why Vuna</div>
            <h2 className={styles.sectionTitle}>Built for Local Makers</h2>
            <div className={styles.benefitsGrid}>
              {benefits.map(b => (
                <div key={b.title} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>{b.icon}</div>
                  <div className={styles.benefitTitle}>{b.title}</div>
                  <p className={styles.benefitDesc}>{b.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={80}>
          <section className={styles.stepsSection}>
            <div className={styles.sectionEyebrow}>How It Works</div>
            <h2 className={styles.sectionTitle}>From Application to First Sale</h2>
            <div className={styles.stepsList}>
              {steps.map(s => (
                <div key={s.num} className={styles.stepItem}>
                  <div className={styles.stepNum}>{s.num}</div>
                  <div>
                    <div className={styles.stepTitle}>{s.title}</div>
                    <p className={styles.stepDesc}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.rulesBanner}>
            <div className={styles.rulesBannerEyebrow}>The 3 Sacred Rules</div>
            <h2 className={styles.rulesBannerTitle}>
              Non-negotiable. No exceptions. No workarounds.
            </h2>
            <p className={styles.rulesBannerBuyerNote}>
              If you are a shopper — these three rules are your guarantee on every purchase you make on Vuna.
            </p>
            <div className={styles.rulesRow}>
              {rules.map(r => (
                <div key={r.num} className={styles.ruleChip}>
                  <div className={styles.ruleChipNum}>{r.num}</div>
                  <div className={styles.ruleChipTitle}>{r.title}</div>
                  <div className={styles.ruleChipDesc}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <section className={styles.showcaseSection}>
            <div className={styles.sectionEyebrow}>Our Creators</div>
            <h2 className={styles.sectionTitle}>Meet the People Behind the Products</h2>

            <SellersFilter
              initialQ={q ?? ''}
              initialLocationId={locationId ?? ''}
            />

            {sellers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Sprout size={48} /></div>
                <h3 className={styles.emptyTitle}>
                  {q || locationId
                    ? 'No sellers match your search'
                    : 'Our creator community is being verified'}
                </h3>
                <p className={styles.emptySub}>
                  {q || locationId
                    ? 'Try a different name or location to find creators near you.'
                    : 'local makers are applying and being reviewed right now. Check back soon to meet the creators whose work you will be able to buy on Vuna.'}
                </p>
                {(q || locationId) && (
                  <Link href="/sellers" className={styles.emptySellerLink}>
                    View all sellers →
                  </Link>
                )}
                {!q && !locationId && (
                  <p className={styles.emptySellerCta}>
                    Are you an local maker?{' '}
                    <Link href="/register/seller" className={styles.emptySellerLink}>
                      Apply to sell your work →
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.sellerGrid}>
                {sellers.map(seller => (
                  <div key={seller.id} className={styles.sellerCard}>
                    <div className={styles.sellerBannerWrap}>
                      {seller.banner ? (
                        <Image
                          src={seller.banner}
                          alt={seller.brandName}
                          fill
                          className={styles.sellerBannerImg}
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className={styles.sellerBannerFallback} />
                      )}
                    </div>
                    <div className={styles.sellerAvatarWrap}>
                      {seller.avatar ? (
                        <Image
                          src={seller.avatar}
                          alt={seller.brandName}
                          fill
                          className={styles.sellerAvatarImg}
                          sizes="64px"
                        />
                      ) : (
                        <span className={styles.sellerAvatarInitial}>
                          {seller.brandName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles.sellerInfo}>
                      <div className={styles.sellerBrand}>{seller.brandName}</div>
                      <div className={styles.sellerLocation}>
                        {seller.location.name} &middot; {seller.category.name}
                      </div>
                      {seller.bio && (
                        <p className={styles.sellerBio}>{seller.bio}</p>
                      )}
                      {seller.isVerified && (
                        <div className={styles.sellerVerified}>
                          <ShieldCheck size={11} /> Vuna Verified
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Seller pages">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className={styles.pageLink}>← Previous</Link>
                )}
                <span className={styles.pageStatus}>Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <Link href={pageHref(page + 1)} className={styles.pageLink}>Next →</Link>
                )}
              </nav>
            )}
          </section>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.ctaBanner}>
            <div className={styles.ctaEyebrow}>Join the Harvest</div>
            <h2 className={styles.ctaTitle}>
              Locally made. Vuna brings it home.
            </h2>
            <p className={styles.ctaSub}>
              Whether you are here to sell your craft or to discover something
              real — Vuna is built for you.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register/seller" className={styles.ctaPrimary}>
                Apply To Sell on Vuna →
              </Link>
              <Link href="/register/buyer" className={styles.ctaSecondary}>
                Register to Shop →
              </Link>
            </div>
          </div>
        </FadeIn>

      </div>

      <Footer />
    </div>
  )
}
