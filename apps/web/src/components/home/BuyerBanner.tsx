import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import styles from './BuyerBanner.module.css'

const perks = [
  'Free account, no commitment',
  'Every seller Vuna verified',
  'Delivery arranged with seller',
]

export default function BuyerBanner() {
  return (
    <section className={styles.section}>
      <FadeIn>
      <div className={styles.content}>
        <div className={styles.eyebrow}>For Shoppers</div>
        <h2 className={styles.heading}>
          Ready to buy something<br />real from Africa?
        </h2>
        <p className={styles.description}>
          Create a free account and start buying directly from
          verified African creators. Handmade, authentic products —
          delivery arranged directly with the seller.
        </p>
      </div>
      </FadeIn>

      <FadeIn delay={100}>
      <div className={styles.actions}>
        <div className={styles.btnGroup}>
          <Link href="/register/buyer" className={styles.btnPrimary}>
            Create Free Account →
          </Link>
          <Link href="/login" className={styles.btnOutline}>
            Sign In
          </Link>
        </div>
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
