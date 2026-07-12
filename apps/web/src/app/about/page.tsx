import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import FadeIn from '@/components/ui/FadeIn'
import { Sparkles, Megaphone, ShieldCheck, Calendar } from 'lucide-react'
import styles from './about.module.css'

const zuluWords = [
  { zulu: 'isivuno',    english: 'The harvest — the reward of hard work' },
  { zulu: 'ngiyavuna',  english: 'I am harvesting — I am reaping what I made' },
  { zulu: 'sivunile',   english: 'We have harvested — together we succeeded' },
  { zulu: 'uvunile',    english: "You have reaped — from local hands to yours" },
]

const sacredRules = [
  {
    num: '01',
    title: 'Locally Owned',
    desc: 'Every seller on Vuna is a local resident. No exceptions. No workarounds. Vuna is for local people, built by local people.',
  },
  {
    num: '02',
    title: 'Maker Made',
    desc: 'Every product is made, grown, built or crafted by the seller themselves. No dropshipping. No reselling. No factories. If you did not make it, it does not belong on Vuna.',
  },
  {
    num: '03',
    title: 'Vuna Verified',
    desc: 'Every seller is personally reviewed and verified by our team before they can list. When you see the Vuna Verified badge, you know the product is genuine, the creator is real and your money goes directly to them.',
  },
]

const vunaRoles = [
  {
    Icon: ShieldCheck,
    title: 'The Curator',
    desc: 'Only verified local makers get in. Our Sacred Rules + personal review keep the platform clean. When you shop on Vuna, you know exactly who you are buying from.',
  },
  {
    Icon: Megaphone,
    title: 'The Brand Amplifier',
    desc: 'We tell your story. Every product gets the storytelling, the verification badge, and the audience. Sellers focus on making. We focus on getting eyes on the work.',
  },
  {
    Icon: Calendar,
    title: 'The Stage Host',
    desc: 'Market days. Auction days. Night markets. We create the events that pull buyers in and give sellers their moment. The market is not always open — that is the magic.',
  },
  {
    Icon: Sparkles,
    title: 'The Trust Broker',
    desc: 'Verified sellers. Proof of payment gating. Direct seller-to-buyer transactions held to platform standards. Vuna stands between buyer and seller as the guarantor of fairness.',
  },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>About</span>
          </nav>
          <h1 className={styles.heroTitle}>Where Local Is Celebrated And Cherished</h1>
          <p className={styles.heroSub}>No place like home — a word, a harvest, a movement.</p>
        </div>
      </div>

      <div className={styles.content}>

        <FadeIn>
          <div className={styles.meaningCard}>
            <div className={styles.cardEyebrow}>The Meaning Behind Vuna</div>
            <div className={styles.zuluGrid}>
              {zuluWords.map(item => (
                <div key={item.zulu} className={styles.zuluItem}>
                  <div className={styles.zuluWord}>{item.zulu}</div>
                  <div className={styles.zuluMeaning}>{item.english}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.storySection}>
            <div>
              <h2 className={styles.sectionTitle}>Why Vuna Exists</h2>
              <div className={styles.storyText}>
                <p>
                  Vuna was born from a simple but powerful truth — our home is full of
                  creators, craftspeople, farmers, designers and builders whose work
                  deserves the world. But they were never given a proper door to be found.
                </p>
                <p>We built that door.</p>
                <p>
                  Grassroots is where Vuna begins.
                  The grandmother making pottery on her stoep.
                  The young designer stitching streetwear at her kitchen table.
                  The farmer pressing moringa powder in his back yard.
                  Every maker, grower and creator working from the ground up —
                  starting on our streets and reaching out from there, one neighbourhood,
                  one district at a time. They existed long before Vuna.
                  They just had no platform truly built for them.
                </p>
                <p>
                  Vuna is not just a marketplace. We are talking about the future factory owners —
                  makers, growers, manufacturers, designers, builders — everyone whose work
                  drives the local economy. Vuna is the harvest of everything home has
                  always been capable of — finally reaching the people who want to buy it.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.rolesCard}>
            <div className={styles.cardEyebrow}>How Vuna Works</div>
            <h2 className={styles.sectionTitle}>Vuna is not a payment processor. Vuna is the middle.</h2>
            <p className={styles.rolesIntro}>
              Sellers sell. Buyers buy. Vuna stands between them and makes the
              exchange trustworthy, visible and worth telling a story about. Four roles, one job.
            </p>
            <div className={styles.rolesGrid}>
              {vunaRoles.map(role => (
                <div key={role.title} className={styles.roleItem}>
                  <div className={styles.roleIcon}><role.Icon size={20} /></div>
                  <div className={styles.roleTitle}>{role.title}</div>
                  <p className={styles.roleDesc}>{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.rolesCard}>
            <div className={styles.cardEyebrow}>How Vuna Earns</div>
            <h2 className={styles.sectionTitle}>We only earn when you earn.</h2>
            <p className={styles.rolesIntro}>
              Vuna does not charge sellers to join, to list, or to stay listed.
              We invest in promoting, marketing and telling the story of every verified
              seller and their products. In return, when a sale happens through Vuna,
              we take a <strong>5% platform commission</strong> — invoiced to the seller monthly.
            </p>
            <p className={styles.rolesIntro}>
              <strong>If you don&apos;t sell, we don&apos;t earn.</strong> No hidden fees.
              No monthly charges. No listing costs. Vuna only makes money when you make money —
              which means every day we work to bring buyers to your work.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.rulesCard}>
            <h2 className={styles.sectionTitle}>The 3 Sacred Rules of Vuna</h2>
            <div className={styles.rulesList}>
              {sacredRules.map(rule => (
                <div key={rule.num} className={styles.ruleItem}>
                  <div className={styles.ruleNum}>{rule.num}</div>
                  <div className={styles.ruleBody}>
                    <div className={styles.ruleTitle}>{rule.title}</div>
                    <p className={styles.ruleDesc}>{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.behindCard}>
            <div className={styles.behindEyebrow}>Behind Vuna</div>
            <h2 className={styles.behindTitle}>An Umzila-AfriRoute Platform</h2>
            <p className={styles.behindText}>
              Vuna is built by Umzila-AfriRoute — a technology and
              communications company from Jolivet, Highflats, KwaZulu-Natal. Our work sits
              at the intersection of digital development and strategic
              communication, building platforms that create real economic
              opportunity for local communities. Every product we build
              starts from lived experience and a genuine belief that
              local people deserve better digital infrastructure.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Join the harvest</h2>
            <p className={styles.ctaSub}>
              Whether you are selling your craft or buying something real —
              Vuna is your home.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register/seller" className={styles.ctaPrimary}>
                Start Selling on Vuna →
              </Link>
              <Link href="/shop" className={styles.ctaSecondary}>
                Browse Local Products
              </Link>
            </div>
          </div>
        </FadeIn>

      </div>

      <Footer />
    </div>
  )
}
