'use client'

import Image from 'next/image'
import { Lock, Globe, BadgeCheck } from 'lucide-react'
import type { CartItem } from '../_types'
import styles from '../checkout.module.css'

const SECURITY_ITEMS = [
  { Icon: Lock,       text: '256-bit SSL secured' },
  { Icon: BadgeCheck, text: 'PayFast certified' },
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
          <span className={styles.totalRowMuted}>Confirmed by seller</span>
        </div>
      </div>

      <div className={styles.grandTotal}>
        <span className={styles.grandTotalLabel}>Total (excl. delivery)</span>
        <span className={styles.grandTotalAmount}>R{subtotal.toFixed(2)}</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" disabled={loading} className={styles.submitBtn}>
        <Lock size={15} />
        {loading ? 'Processing...' : 'Pay with PayFast'}
      </button>

      <p className={styles.payNote}>
        You will be redirected to PayFast to complete payment securely.
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
