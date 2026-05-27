'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag, Store,
  Gavel, User, Globe, LogOut, Menu, X, ShieldCheck, Banknote,
} from 'lucide-react'
import styles from './sidebar.module.css'

interface SidebarUser {
  name?: string | null
  email?: string | null
  brandName?: string
  isVerified?: boolean
}

const navItems = [
  { label: 'Dashboard',   href: '/seller/dashboard',  Icon: LayoutDashboard },
  { label: 'My Products', href: '/seller/products',   Icon: Package },
  { label: 'Orders',      href: '/seller/orders',     Icon: ShoppingBag },
  { label: 'Earnings',    href: '/seller/earnings',   Icon: Banknote },
  { label: 'Market',      href: '/seller/market',     Icon: Store },
  { label: 'Auctions',    href: '/seller/auctions',   Icon: Gavel },
  { label: 'My Profile',  href: '/seller/profile',    Icon: User },
  { label: 'Browse Shop', href: '/shop',              Icon: Globe },
]

export default function SellerSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)

  useEffect(() => {
    fetch('/api/seller/stats')
      .then(r => r.json())
      .then(d => setPendingOrders(d.pendingOrders ?? 0))
      .catch(() => {})
  }, [pathname])

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
            {(user?.brandName ?? user?.name)?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userName}>{user?.brandName ?? user?.name}</div>
          <div className={styles.userRole}>
            {user?.isVerified
              ? <><ShieldCheck size={10} /> Vuna Verified Seller</>
              : <><Globe size={10} /> Vuna Seller</>
            }
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
                  {label === 'Orders' && pendingOrders > 0 && (
                    <span className={styles.navBadge}>{pendingOrders}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className={styles.signOutWrap}>
          <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
