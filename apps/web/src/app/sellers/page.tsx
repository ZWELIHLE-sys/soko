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
    desc: 'Once verified, upload your products and start reaching buyers across South Africa and the world.',
  },
]

const rules = [
  {
    num: '01',
    title: 'African Owned',
    desc: 'Every seller must be African or South African.',
  },
  {
    num: '02',
    title: 'Hand Produced',
    desc: 'Every product must be made by the seller themselves.',
  },
  {
    num: '03',
    title: 'Vuna Verified',
    desc: 'Every seller is personally reviewed before going live.',
  },
]

async function getVerifiedSellers() {
  return prisma.seller.findMany({
    where: { isVerified: true, status: 'VERIFIED' },
    take: 8,
    orderBy: { brandName: 'asc' },
    include: {
      location: { select: { name: true } },
      category: { select: { name: true } },
    },
  })
}

export default async function SellersPage() {
  const sellers = await getVerifiedSellers()

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
            Vuna gives you the platform. Africa gives you the story.
          </p>
          <Link href="/register/seller" className={styles.heroBtn}>
            Apply To Sell on Vuna →
          </Link>
          <p className={styles.heroBuyerNote}>
            Here to shop?{' '}
            <Link href="/shop" className={styles.heroBuyerLink}>
              Browse African products →
            </Link>
          </p>
        </div>
      </div>

      <div className={styles.statsStrip}>
        <div className={styles.statsInner}>
          <div className={styles.stat}>
            <div className={styles.statNum}>100%</div>
            <div className={styles.statLabel}>African Made</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>∞</div>
            <div className={styles.statLabel}>Cape to Cairo</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>48h</div>
            <div className={styles.statLabel}>Verification Time</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>Free</div>
            <div className={styles.statLabel}>To Apply & List</div>
          </div>
        </div>
      </div>

      <div className={styles.content}>

        <FadeIn>
          <section className={styles.benefitsSection}>
            <div className={styles.sectionEyebrow}>Why Vuna</div>
            <h2 className={styles.sectionTitle}>Built for African Creators</h2>
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

            {sellers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Sprout size={48} /></div>
                <h3 className={styles.emptyTitle}>Our creator community is being verified</h3>
                <p className={styles.emptySub}>
                  African makers are applying and being reviewed right now.
                  Check back soon to meet the creators whose work you will be able to buy on Vuna.
                </p>
                <p className={styles.emptySellerCta}>
                  Are you an African creator?{' '}
                  <Link href="/register/seller" className={styles.emptySellerLink}>
                    Apply to sell your work →
                  </Link>
                </p>
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
          </section>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.ctaBanner}>
            <div className={styles.ctaEyebrow}>Join the Harvest</div>
            <h2 className={styles.ctaTitle}>
              Africa makes it. Vuna brings it to the world.
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
