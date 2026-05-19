'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package, Clock, Banknote, AlertCircle, Check } from 'lucide-react'
import styles from './dashboard.module.css'

interface Stats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  revenue: number
}

export default function SellerDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/seller/stats')
      .then(r => r.json())
      .then(setStats)
  }, [])

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? '—',
      icon: <ShoppingBag size={20} />,
      color: '#7C2D12',
      bg: '#FEF3C7',
      link: '/seller/products',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? '—',
      icon: <Package size={20} />,
      color: '#14532D',
      bg: '#DCFCE7',
      link: '/seller/orders',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? '—',
      icon: <Clock size={20} />,
      color: '#92400E',
      bg: '#FEF9C3',
      link: '/seller/orders',
    },
    {
      label: 'Total Revenue',
      value: stats ? `R${stats.revenue.toFixed(2)}` : '—',
      icon: <Banknote size={20} />,
      color: '#1D4ED8',
      bg: '#EFF6FF',
      link: '/seller/orders',
    },
  ]

  const quickActions = [
    { label: 'Add New Product', href: '/seller/products/new', primary: true },
    { label: 'View Orders',     href: '/seller/orders',       primary: false },
    { label: 'View My Shop',    href: '/seller/shop',         primary: false },
  ]

  const guideSteps = [
    {
      step: '1',
      title: 'Get Soko Verified',
      desc: 'Our team reviews your application within 24 hours.',
      done: session?.user?.isVerified,
    },
    {
      step: '2',
      title: 'Upload your first product',
      desc: 'Add photos, description and price for your first listing.',
      done: false,
    },
    {
      step: '3',
      title: 'Share your shop',
      desc: 'Tell your community — your first sale starts with your own network.',
      done: false,
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className={styles.subheading}>
          Here is what is happening with your Soko shop today.
        </p>
      </div>

      {!session?.user?.isVerified && (
        <div className={styles.banner}>
          <div>
            <div className={styles.bannerTitle}>
              <AlertCircle size={14} />
              Your seller application is under review
            </div>
            <div className={styles.bannerSub}>
              We verify every seller within 24 hours. You will receive an email once approved.
            </div>
          </div>
        </div>
      )}

      <div className={styles.statsGrid}>
        {statCards.map(card => (
          <Link key={card.label} href={card.link} className={styles.cardLink}>
            <div className={styles.card}>
              <div className={styles.cardIcon} style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div className={styles.cardValue} style={{ color: card.color }}>
                {card.value}
              </div>
              <div className={styles.cardLabel}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.actionsSection}>
        <h2 className={styles.actionsHeading}>Quick Actions</h2>
        <div className={styles.actionsRow}>
          {quickActions.map(action => (
            <Link
              key={action.label}
              href={action.href}
              className={`${styles.actionBtn} ${action.primary ? styles.actionBtnPrimary : styles.actionBtnSecondary}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {stats?.totalProducts === 0 && (
        <div className={styles.guide}>
          <h2 className={styles.guideHeading}>Getting Started on Soko</h2>
          <div className={styles.steps}>
            {guideSteps.map(item => (
              <div key={item.step} className={`${styles.step} ${item.done ? styles.stepDone : styles.stepPending}`}>
                <div className={`${styles.stepBubble} ${item.done ? styles.stepBubbleDone : styles.stepBubblePending}`}>
                  {item.done ? <Check size={14} /> : item.step}
                </div>
                <div>
                  <div className={styles.stepTitle}>{item.title}</div>
                  <div className={styles.stepDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
