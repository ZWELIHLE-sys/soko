'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard, Package, Heart, User,
  ShoppingBag, Globe, LogOut, Menu, X, Gavel, Store,
} from 'lucide-react'
import styles from './sidebar.module.css'

interface SidebarUser {
  name?: string | null
  email?: string | null
}

const navItems = [
  { label: 'Dashboard',   href: '/buyer/dashboard', Icon: LayoutDashboard },
  { label: 'My Orders',   href: '/buyer/orders',    Icon: Package },
  { label: 'Wishlist',    href: '/buyer/wishlist',  Icon: Heart },
  { label: 'Auctions',    href: '/buyer/auctions',  Icon: Gavel },
  { label: 'Market',      href: '/buyer/market',    Icon: Store },
  { label: 'My Profile',  href: '/buyer/profile',   Icon: User },
  { label: 'Browse Shop', href: '/shop',             Icon: ShoppingBag },
]

export default function BuyerSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button className={styles.hamburger} onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {open && <div className={styles.overlay} onClick={close} />}

      <aside className={`${styles.aside} ${open ? styles.asideOpen : ''}`}>
        <div className={styles.strip} />

        <div className={styles.asideHeader}>
          <Link href="/" className={styles.logoLink} onClick={close}>
            <div className={styles.logoIcon}>V</div>
            <span className={styles.logoName}>Vuna</span>
          </Link>
          <button className={styles.closeBtn} onClick={close} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className={styles.userBox}>
          <div className={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userName}>{user?.name}</div>
          <div className={styles.userRole}>
            <Globe size={10} />
            Vuna Shopper
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ href, label, Icon }) => {
            const isActive = href === '/shop'
              ? pathname === href
              : pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={styles.navLink} onClick={close}>
                <div className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
                  <Icon size={16} className={isActive ? styles.navIconActive : styles.navIcon} />
                  <span className={isActive ? styles.navLabelActive : styles.navLabel}>
                    {label}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className={styles.signOutWrap}>
          <button
            className={styles.signOutBtn}
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
