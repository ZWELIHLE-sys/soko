'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { CircleCheck, Handshake, Truck, Globe } from 'lucide-react'
import styles from './success.module.css'

const promiseItems = [
  { Icon: Handshake, text: 'Made by a real African creator' },
  { Icon: Truck,     text: 'Delivery tracking on the way' },
  { Icon: Globe,     text: 'Your purchase supports livelihoods' },
]

export default function CheckoutSuccess() {
  useEffect(() => {
    localStorage.removeItem('vuna_cart')
    window.dispatchEvent(new Event('vuna_cart_updated'))
  }, [])

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.center}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <CircleCheck size={72} strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>Order Placed!</h1>
          <p className={styles.subtitle}>
            Thank you for supporting African creators. Your order has been placed
            and the seller has been notified. You will receive a confirmation shortly.
          </p>

          <div className={styles.promise}>
            <div className={styles.promiseLabel}>The Vuna Promise</div>
            {promiseItems.map(({ Icon, text }) => (
              <div key={text} className={styles.promiseItem}>
                <Icon size={13} />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Link href="/buyer/orders" style={{ textDecoration: 'none' }}>
              <button className={styles.primaryBtn}>Track My Order</button>
            </Link>
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <button className={styles.secondaryBtn}>Keep Shopping</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
