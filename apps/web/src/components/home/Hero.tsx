import Link from 'next/link'
import styles from './Hero.module.css'

const stats = [
  { num: 'SA', label: 'Locally Made' },
  { num: '100%', label: 'Verified Makers' },
  { num: '3', label: 'Sacred Rules' },
  { num: 'Free', label: 'To Join & List' },
]

export default function Hero() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.slogan}>VUNA — WHERE LOCAL IS CELEBRATED AND CHERISHED</div>
        <div className={styles.tagline}>No place like home.</div>

        <p className={styles.description}>
          Home made. Home grown. Home built.
          Every product on Vuna is locally crafted and Vuna verified —
          because there really is no place like home.
        </p>

        <div className={styles.buttons}>
          <Link href="/register/buyer" className={styles.btnPrimary}>Shop Home Made</Link>
          <Link href="/register/seller" className={styles.btnOutline}>Sell Your Work</Link>
        </div>

        <div className={styles.stats}>
          {stats.map(stat => (
            <div key={stat.label}>
              <div className={styles.statNum}>
                {stat.num}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
