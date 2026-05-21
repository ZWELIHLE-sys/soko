import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { XCircle } from 'lucide-react'
import styles from './cancel.module.css'

export default function CheckoutCancel() {
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.center}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <XCircle size={72} strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>Payment Cancelled</h1>
          <p className={styles.subtitle}>
            No payment was taken. Your cart is still saved —
            you can try again whenever you are ready.
          </p>
          <div className={styles.actions}>
            <Link href="/checkout" style={{ textDecoration: 'none' }}>
              <button className={styles.primaryBtn}>Try Again</button>
            </Link>
            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <button className={styles.secondaryBtn}>Back to Cart</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
