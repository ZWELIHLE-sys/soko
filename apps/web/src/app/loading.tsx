import styles from './boundary.module.css'

// Shown during navigation to any page that doesn't define its own loading state
export default function Loading() {
  return (
    <div className={styles.screen}>
      <div className={styles.spinner} />
      <div className={styles.loadingText}>Loading Vuna…</div>
    </div>
  )
}
