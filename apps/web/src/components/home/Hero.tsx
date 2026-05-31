import Link from 'next/link'
import styles from './Hero.module.css'

const stats = [
  { num: '∞', label: 'Cape to Cairo' },
  { num: '100%', label: 'African Made' },
  { num: '3', label: 'Sacred Rules' },
  { num: 'Free', label: 'To Join & List' },
]

export default function Hero() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.slogan}>VUNA — REAP WHAT AFRICA MAKES</div>

        <p className={styles.description}>
          Every product on Vuna is African made and Vuna verified.
          From Cape to Cairo — a grandmother in Limpopo making pottery,
          to the designer in Lagos stitching streetwear —
          if African hands built it, it belongs here.
        </p>

        <div className={styles.buttons}>
          <Link href="/register/buyer" className={styles.btnPrimary}>Shop African Made</Link>
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
