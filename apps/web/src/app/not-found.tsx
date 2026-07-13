import Link from 'next/link'
import styles from './boundary.module.css'

export default function NotFound() {
  return (
    <div className={styles.screen}>
      <div className={styles.mark}>V</div>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.text}>
        This page has wandered off. The market, the shop and the auctions are all still here — let&apos;s get you back.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.btnPrimary}>Back to home</Link>
        <Link href="/shop" className={styles.btnSecondary}>Browse the shop</Link>
      </div>
    </div>
  )
}
