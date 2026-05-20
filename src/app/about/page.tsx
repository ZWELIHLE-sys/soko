import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import styles from './about.module.css'

const leftColors  = ['kenteA', 'kenteB', 'kenteC', 'kenteD'] as const
const rightColors = ['kenteC', 'kenteD', 'kenteB', 'kenteA'] as const

const zuluWords = [
  { zulu: 'isivuno',    english: 'The harvest — the reward of hard work' },
  { zulu: 'ngiyavuna',  english: 'I am harvesting — I am reaping what I made' },
  { zulu: 'sivunile',   english: 'We have harvested — together we succeeded' },
  { zulu: 'uvunile',    english: "You have reaped — from Africa's hands to yours" },
]

const sacredRules = [
  {
    num: '01',
    title: 'African Owned',
    desc: 'Every seller on Vuna is African or South African. No exceptions. No workarounds. Vuna is for African people, built by African people.',
  },
  {
    num: '02',
    title: 'Hand Produced',
    desc: 'Every product is made, grown, built or crafted by the seller themselves. No dropshipping. No reselling. No factories. If your hands did not make it, it does not belong on Vuna.',
  },
  {
    num: '03',
    title: 'Vuna Verified',
    desc: 'Every seller is personally reviewed and verified by our team before they can list. When you see the Vuna Verified badge, you know the product is genuine, the creator is real and your money goes directly to them.',
  },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.kenteLeft}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={styles[leftColors[i % 4]]} />
          ))}
        </div>
        <div className={styles.kenteRight}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={styles[rightColors[i % 4]]} />
          ))}
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>Our Story</div>
          <h1 className={styles.heroTitle}>
            Reap What<br />
            <span className={styles.heroAccent}>Africa Makes</span>
          </h1>
          <p className={styles.heroSub}>A word. A harvest. A movement.</p>
        </div>
      </div>

      <div className={styles.content}>

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

        <div className={styles.storySection}>
          <h2 className={styles.sectionTitle}>Why Vuna Exists</h2>
          <div className={styles.storyText}>
            <p>
              Vuna was born from a simple but powerful truth — Africa is full of
              creators, craftspeople, farmers, designers and builders whose work
              deserves the world. But the world was never given a proper door to find them.
            </p>
            <p>We built that door.</p>
            <p>
              The grandmother in rural KwaZulu-Natal who makes pottery that
              could sit in a gallery in London. The young designer in Umlazi
              stitching streetwear that could sell in Paris. The farmer in Limpopo
              pressing moringa powder that could reach shelves in New York.
              They existed before Vuna. They just had no platform that was
              built for them.
            </p>
            <p>
              Vuna is not just a marketplace. Vuna is the harvest of everything
              Africa has always been capable of — finally reaching the world.
            </p>
          </div>
        </div>

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

        <div className={styles.behindCard}>
          <div className={styles.behindEyebrow}>Behind Vuna</div>
          <h2 className={styles.behindTitle}>An Umzila-AfriRoute Platform</h2>
          <p className={styles.behindText}>
            Vuna is built by Umzila-AfriRoute — a technology company
            from KwaZulu-Natal building digital infrastructure for
            communities that have traditionally been excluded from
            the formal economy. From taxi rank management to scholar
            transport to e-commerce, every product we build starts
            from lived experience and ground level understanding.
          </p>
          <div className={styles.behindLink}>umzilaafroute.co.za →</div>
        </div>

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
              Browse African Products
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
