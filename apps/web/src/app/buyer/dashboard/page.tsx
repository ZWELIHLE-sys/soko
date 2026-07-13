'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, CheckCircle2, Truck, CreditCard,
  ShoppingBag, User, Globe, Handshake, Sprout
} from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import styles from './dashboard.module.css'

interface Stats {
  totalOrders: number
  delivered: number
  pending: number
  totalSpent: number
}

const statCards = [
  { label: 'Total Orders', key: 'totalOrders' as const, Icon: Package,      variant: 'Orders',    link: '/buyer/orders' },
  { label: 'Delivered',    key: 'delivered'   as const, Icon: CheckCircle2, variant: 'Delivered', link: '/buyer/orders' },
  { label: 'In Progress',  key: 'pending'     as const, Icon: Truck,        variant: 'Progress',  link: '/buyer/orders' },
  { label: 'Total Spent',  key: null,                   Icon: CreditCard,   variant: 'Spent',     link: '/buyer/orders' },
]

const quickActions = [
  { label: 'Browse Shop',   href: '/shop',           Icon: ShoppingBag, primary: true },
  { label: 'Track Orders',  href: '/buyer/orders',   Icon: Package,     primary: false },
  { label: 'My Profile',    href: '/buyer/profile',  Icon: User,        primary: false },
]

const impactItems = [
  { Icon: Globe,     text: 'Supporting local livelihoods' },
  { Icon: Handshake, text: 'Buying authentic local goods' },
  { Icon: Sprout,    text: 'Growing the local economy' },
]

export default function BuyerDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState(false)

  useEffect(() => {
    fetch('/api/buyer/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStats)
      .catch(() => setStatsError(true))
  }, [])

  const getStatValue = (card: typeof statCards[number]) => {
    if (statsError) return '—'
    if (!stats) return '…'
    if (card.key === null) return `R${stats.totalSpent.toFixed(2)}`
    return String(stats[card.key])
  }

  return (
    <div>
      <FadeIn>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Welcome back, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className={styles.subtitle}>
            Thank you for supporting local makers. Every purchase makes a difference.
          </p>
        </div>
      </FadeIn>

      {statsError && (
        <div className={styles.errorBanner}>
          Could not load your stats. Refresh the page to try again.
        </div>
      )}

      <div className={styles.statsGrid}>
        <FadeIn stagger step={70}>
          {statCards.map(card => (
            <Link
              key={card.label}
              href={card.link}
              className={styles.statCard}
            >
              <div className={`${styles.statIcon} ${styles[`statIcon${card.variant}` as keyof typeof styles]}`}>
                <card.Icon size={20} />
              </div>
              <div className={`${styles.statValue} ${styles[`statValue${card.variant}` as keyof typeof styles]}`}>
                {!stats && !statsError
                  ? <span className={styles.statSkeleton} />
                  : getStatValue(card)}
              </div>
              <div className={styles.statLabel}>{card.label}</div>
            </Link>
          ))}
        </FadeIn>
      </div>

      <FadeIn delay={80}>
        <div className={styles.actionsSection}>
          <h2 className={styles.actionsTitle}>Quick Actions</h2>
          <div className={styles.actions}>
            {quickActions.map(({ label, href, Icon, primary }) => (
              <Link
                key={label}
                href={href}
                className={`${styles.actionBtn} ${primary ? styles.actionBtnPrimary : styles.actionBtnSecondary}`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120}>
        <div className={styles.impact}>
          <div className={styles.impactLabel}>Uvunile — You Have Reaped From Home</div>
          <h2 className={styles.impactTitle}>Every purchase empowers an local maker</h2>
          <p className={styles.impactText}>
            When you buy on Vuna your money goes directly to the person
            who made, grew or built the product. No middlemen. No exploitation.
            Just local work, fairly paid.
          </p>
          <div className={styles.impactItems}>
            {impactItems.map(({ Icon, text }) => (
              <div key={text} className={styles.impactItem}>
                <Icon size={14} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
