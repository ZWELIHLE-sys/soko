'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ShieldCheck, Clock, LogOut } from 'lucide-react'
import styles from './SellerSidebar.module.css'

const navItems = [
  { label: 'Dashboard',   href: '/seller/dashboard' },
  { label: 'My Products', href: '/seller/products' },
  { label: 'Add Product', href: '/seller/products/new' },
  { label: 'Orders',      href: '/seller/orders' },
  { label: 'My Shop',     href: '/seller/shop' },
  { label: 'Settings',    href: '/seller/settings' },
]

type SellerInfo = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  brandName?: string
  isVerified?: boolean
  role?: string
}

export default function SellerSidebar({ seller }: { seller: SellerInfo }) {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.patternStrip} />

      <div className={styles.logoArea}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>S</div>
          <span className={styles.logoName}>Soko</span>
        </Link>
      </div>

      <div className={styles.sellerCard}>
        <div className={styles.avatar}>
          {seller?.name?.charAt(0).toUpperCase()}
        </div>
        <div className={styles.sellerName}>
          {seller?.brandName || seller?.name}
        </div>
        <div className={`${styles.badge} ${seller?.isVerified ? styles.badgeVerified : styles.badgePending}`}>
          {seller?.isVerified
            ? <><ShieldCheck size={10} /> Soko Verified</>
            : <><Clock size={10} /> Pending Review</>
          }
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              <div className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
                <span className={`${styles.navLabel} ${isActive ? styles.navLabelActive : ''}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className={styles.signOutArea}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={styles.signOutBtn}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
