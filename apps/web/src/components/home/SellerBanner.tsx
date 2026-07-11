import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import styles from './SellerBanner.module.css'

const perks = [
  'Free to apply',
  'Verified in 48 hours',
  'Sell to your neighbours',
]

export default function SellerBanner() {
  return (
    <section className={styles.section}>
      <FadeIn>
      <div className={styles.content}>
        <div className={styles.eyebrow}>For Local Makers</div>
        <h2 className={styles.heading}>
          Your craft deserves<br />its stage
        </h2>
        <p className={styles.description}>
          Join Vuna and sell your clothing, art, food, furniture or any
          locally made product to buyers across the country.
          Apply for your Vuna Verified badge today — no experience needed,
          just your craft and your story.
        </p>
      </div>
      </FadeIn>

      <FadeIn delay={100}>
      <div className={styles.actions}>
        <Link href="/register/seller" className={styles.btn}>
          Start Selling Today →
        </Link>
        <div className={styles.perks}>
          {perks.map(perk => (
            <div key={perk} className={styles.perk}>
              <ShieldCheck size={14} />
              {perk}
            </div>
          ))}
        </div>
      </div>
      </FadeIn>
    </section>
  )
}
