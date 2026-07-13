'use client'

import { useEffect } from 'react'
import styles from './boundary.module.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin page error:', error)
  }, [error])

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.text}>
        This admin page failed to load. Try again — if it keeps happening, check the server logs.
      </p>
      <button className={styles.btn} onClick={reset}>Try again</button>
    </div>
  )
}
