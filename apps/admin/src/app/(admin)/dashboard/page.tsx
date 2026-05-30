'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Clock, CheckCircle, Package, Users,
  ShoppingBag, DollarSign, Banknote, BarChart2,
} from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './dashboard.module.css'

interface Stats {
  sellers:  { total: number; pending: number; verified: number }
  buyers:   { total: number }
  products: { total: number; active: number }
  orders:   { total: number; pending: number; delivered: number }
  finance:  { totalRevenue: number; vunaCommission: number }
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.sellers) setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Pending Sellers',  value: stats.sellers.pending,   Icon: Clock,       color: '#92400E', bg: '#FEF9C3', link: '/sellers',  urgent: stats.sellers.pending > 0 },
    { label: 'Verified Sellers', value: stats.sellers.verified,  Icon: CheckCircle, color: '#14532D', bg: '#DCFCE7', link: '/sellers',  urgent: false },
    { label: 'Active Products',  value: stats.products.active,   Icon: Package,     color: '#1D4ED8', bg: '#EFF6FF', link: '/products', urgent: false },
    { label: 'Total Buyers',     value: stats.buyers.total,      Icon: Users,       color: '#6D28D9', bg: '#EDE9FE', link: '/buyers',   urgent: false },
    { label: 'Pending Orders',   value: stats.orders.pending,    Icon: ShoppingBag, color: '#92400E', bg: '#FEF9C3', link: '/orders',   urgent: stats.orders.pending > 0 },
    { label: 'Total Revenue',    value: `R${stats.finance.totalRevenue.toFixed(2)}`, Icon: DollarSign, color: '#14532D', bg: '#DCFCE7', link: '/payouts', urgent: false },
    { label: 'Vuna Commission',  value: `R${stats.finance.vunaCommission.toFixed(2)}`, Icon: Banknote, color: '#7C2D12', bg: '#FEF3C7', link: '/payouts', urgent: false },
    { label: 'Total Orders',     value: stats.orders.total,      Icon: BarChart2,   color: '#374151', bg: '#F3F4F6', link: '/orders',   urgent: false },
  ] : []

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Vuna Admin Dashboard</h1>
        <p className={shared.pageSub}>Platform overview — everything happening on Vuna right now.</p>
      </div>

      {stats?.sellers?.pending > 0 && (
        <div className={shared.alertBanner}>
          <div>
            <div className={shared.alertTitle}>
              {stats?.sellers.pending} seller{stats?.sellers.pending !== 1 ? 's' : ''} waiting for verification
            </div>
            <div className={shared.alertSub}>
              Review and verify sellers to keep Vuna&apos;s quality standard high.
            </div>
          </div>
          <Link href="/sellers">
            <button className={shared.btnPrimary}>Review Now</button>
          </Link>
        </div>
      )}

      {loading ? (
        <div className={shared.loading}>Loading dashboard...</div>
      ) : (
        <div className={styles.statsGrid}>
          {cards.map(({ label, value, Icon, color, bg, link, urgent }) => (
            <Link key={label} href={link} className={styles.statLink}>
              <div className={`${styles.statCard} ${urgent ? styles.statCardUrgent : ''}`}>
                <div className={styles.statTop}>
                  <div className={styles.statIcon} style={{ background: bg }}>
                    <Icon size={20} color={color} />
                  </div>
                  {urgent && <span className={styles.urgentTag}>ACTION</span>}
                </div>
                <div className={styles.statValue} style={{ color }}>{value}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className={`${shared.card} ${styles.actionsCard}`}>
        <h2 className={shared.cardTitle}>Quick Actions</h2>
        <div className={styles.actions}>
          <Link href="/sellers"><button className={shared.btnPrimary}>Verify Sellers</button></Link>
          <Link href="/orders"><button className={shared.btnSecondary}>Manage Orders</button></Link>
          <Link href="/payouts"><button className={shared.btnSecondary}>Process Payouts</button></Link>
          <Link href="/market"><button className={shared.btnSecondary}>Manage Market</button></Link>
          <Link href="/auctions"><button className={shared.btnSecondary}>Manage Auctions</button></Link>
          <Link href="/monitoring"><button className={shared.btnSecondary}>System Monitor</button></Link>
        </div>
      </div>
    </div>
  )
}
