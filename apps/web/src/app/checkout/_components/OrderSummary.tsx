'use client'

import Image from 'next/image'
import { Lock, Globe, BadgeCheck, Banknote } from 'lucide-react'
import type { CartItem } from '../_types'
import styles from '../checkout.module.css'

const SECURITY_ITEMS = [
  { Icon: Banknote,   text: 'Direct EFT to the seller' },
  { Icon: BadgeCheck, text: 'Every seller Vuna Verified' },
  { Icon: Globe,      text: 'Supporting local makers' },
]

interface Props {
  cart: CartItem[]
  subtotal: number
  loading: boolean
  error: string
}

export function OrderSummary({ cart, subtotal, loading, error }: Props) {
  return (
    <div className={styles.summary}>
      <h2 className={styles.summaryTitle}>Order Summary</h2>

      <div className={styles.summaryItems}>
        {cart.map(item => (
          <div key={item.productId} className={styles.summaryItem}>
            <div className={styles.itemThumb}>
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
              ) : (
                <span>{item.categoryIcon}</span>
              )}
            </div>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemSeller}>by {item.sellerName} × {item.quantity}</div>
            </div>
            <div className={styles.itemPrice}>R{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>R{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Delivery</span>
          <span className={styles.totalRowMuted}>Arranged with seller</span>
        </div>
      </div>

      <div className={styles.grandTotal}>
        <span className={styles.grandTotalLabel}>Total (excl. delivery)</span>
        <span className={styles.grandTotalAmount}>R{subtotal.toFixed(2)}</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" disabled={loading} className={styles.submitBtn}>
        <Lock size={15} />
        {loading ? 'Placing order...' : 'Place Order'}
      </button>

      <p className={styles.payNote}>
        Next step: you&apos;ll see the seller&apos;s banking details to pay them
        directly via EFT, then upload your proof of payment.
      </p>

      <div className={styles.securityBadge}>
        {SECURITY_ITEMS.map(({ Icon, text }) => (
          <div key={text} className={styles.securityItem}>
            <Icon size={12} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
