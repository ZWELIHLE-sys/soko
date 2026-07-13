import styles from './boundary.module.css'

export default function Loading() {
  return (
    <div className={styles.screen}>
      <div className={styles.spinner} />
      <div className={styles.loadingText}>Loading…</div>
    </div>
  )
}
