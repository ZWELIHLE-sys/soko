'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import styles from './navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>S</div>
          <span className={styles.brandName}>Soko</span>
        </Link>
        <div className={styles.links}>
          <Link href="/shop" className={styles.link}>
            <ShoppingBag size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            Shop
          </Link>
          <Link href="/login" className={styles.link}>Sign in</Link>
          <Link href="/register" className={`${styles.link} ${styles.linkPrimary}`}>Join Soko</Link>
        </div>
      </div>
    </nav>
  )
}
