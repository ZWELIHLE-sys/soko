'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import {
  LayoutDashboard, Users, Package, ShoppingBag,
  UserCheck, Store, Gavel, MessageSquare,
  Activity, LogOut, Star, Sparkles, FileText, Settings, Radio, Sprout, Megaphone,
} from 'lucide-react'
import styles from './sidebar.module.css'

interface AdminUser {
  name?: string | null
  email?: string | null
  role?: string
}

const navItems = [
  { label: 'Dashboard',     href: '/dashboard',    Icon: LayoutDashboard },
  { label: 'Live MC',       href: '/live',         Icon: Radio },
  { label: 'Sellers',       href: '/sellers',      Icon: UserCheck },
  { label: 'Products',      href: '/products',     Icon: Package },
  { label: 'Orders',        href: '/orders',       Icon: ShoppingBag },
  { label: 'Buyers',        href: '/buyers',       Icon: Users },
  { label: 'Agriculture',   href: '/agri',         Icon: Sprout },
  { label: 'Commissions',   href: '/commissions',  Icon: FileText },
  { label: 'Market',        href: '/market',       Icon: Store },
  { label: 'Auctions',      href: '/auctions',     Icon: Gavel },
  { label: 'Pieces',        href: '/pieces',       Icon: Sparkles },
  { label: 'Featured',      href: '/featured',     Icon: Star },
  { label: 'Testimonials',  href: '/testimonials', Icon: MessageSquare },
  { label: 'Ad Banners',    href: '/ads',          Icon: Megaphone },
  { label: 'Monitoring',    href: '/monitoring',   Icon: Activity },
  { label: 'Settings',      href: '/settings',     Icon: Settings },
]

export default function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.strip} />

      <Link href="/" className={styles.brand}>
        <div className={styles.brandMark}>
          <Image src="/images/handlogo-mark.png" alt="Vuna" fill sizes="40px" className={styles.brandLogo} />
        </div>
        <div>
          <div className={styles.brandName}>Vuna Admin</div>
          <div className={styles.brandSub}>CONTROL PANEL</div>
        </div>
      </Link>

      <div className={styles.userCard}>
        <div className={styles.userName}>{user?.name}</div>
        <div className={styles.userRole}>Platform Administrator</div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ label, href, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.signOutWrap}>
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
