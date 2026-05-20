import styles from './footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>S</div>
          <div>
            <div className={styles.brandText}>Vuna</div>
            <div className={styles.tagline}>Reap What Africa Makes</div>
          </div>
        </div>
        <div className={styles.copy}>
          &copy; {new Date().getFullYear()} Vuna. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
