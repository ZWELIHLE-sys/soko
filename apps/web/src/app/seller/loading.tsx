import styles from '../boundary.module.css'

// Shows the spinner in the content area (sidebar stays) while any seller
// dashboard page loads.
export default function Loading() {
  return (
    <div className={styles.screen}>
      <div className={styles.spinner} />
      <div className={styles.loadingText}>Loading…</div>
    </div>
  )
}
