import styles from './PageLoader.module.css'

// Consistent in-page loading spinner for client-fetch dashboard pages.
export default function PageLoader({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
      <div className={styles.text}>{text}</div>
    </div>
  )
}
