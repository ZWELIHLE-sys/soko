import Link from 'next/link'
import { Globe } from 'lucide-react'
import styles from './Hero.module.css'

const stats = [
  { num: '9', label: 'SA Provinces' },
  { num: '14', label: 'Categories' },
  { num: '3', label: 'Sacred Rules' },
  { num: null, label: 'Global Reach' },
]

export default function Hero() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.tag}>
          <Globe size={12} />
          Africa&apos;s Own Marketplace
        </div>

        <div className={styles.slogan}>VUNA — REAP WHAT AFRICA MAKES</div>

        <p className={styles.description}>
          Every product on Vuna is African made, African owned and
          Vuna verified. From the grandmother in Limpopo making pottery,
          to the designer in Durban stitching streetwear — if African
          hands built it, it belongs here.
        </p>

        <div className={styles.buttons}>
          <Link href="/register/buyer" className={styles.btnPrimary}>Shop African Made</Link>
          <Link href="/register/seller" className={styles.btnOutline}>Sell Your Work</Link>
        </div>

        <div className={styles.stats}>
          {stats.map(stat => (
            <div key={stat.label}>
              <div className={styles.statNum}>
                {stat.num ?? <Globe size={28} />}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
