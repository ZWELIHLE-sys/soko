import Link from 'next/link'
import { ShoppingBag, ShieldCheck, Truck } from 'lucide-react'
import styles from './BuyerBanner.module.css'

const perks = [
  { Icon: ShoppingBag, text: 'Free to create an account' },
  { Icon: ShieldCheck, text: 'Every seller Vuna verified' },
  // TODO: DHL API integration — update to 'DHL tracked delivery' once live
  { Icon: Truck,       text: 'Seller arranges delivery with you' },
]

export default function BuyerBanner() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.eyebrow}>For Shoppers</div>
        <h2 className={styles.heading}>
          Ready to buy something<br />real from Africa?
        </h2>
        <p className={styles.description}>
          Create a free account and start buying directly from
          verified African creators. Every product is handmade,
          authentic — and delivery is arranged directly between you and the seller.
        </p>
        <div className={styles.perks}>
          {perks.map(({ Icon, text }) => (
            <div key={text} className={styles.perk}>
              <Icon size={14} />
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/register/buyer" className={styles.btnPrimary}>
          Create Free Account →
        </Link>
        <Link href="/login" className={styles.btnOutline}>
          Sign In
        </Link>
      </div>
    </section>
  )
}
