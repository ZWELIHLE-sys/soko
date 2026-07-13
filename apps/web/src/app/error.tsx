'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './boundary.module.css'

// Catches unhandled errors in any page and offers a way back — instead of a
// blank screen or Next's raw error overlay.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className={styles.screen}>
      <div className={styles.mark}>V</div>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.text}>
        We hit a snag loading this page. It&apos;s not you — please try again, or head back to the market.
      </p>
      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={reset}>Try again</button>
        <Link href="/" className={styles.btnSecondary}>Back to home</Link>
      </div>
    </div>
  )
}
