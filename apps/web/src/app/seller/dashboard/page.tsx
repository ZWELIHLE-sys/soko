'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, ShoppingBag, Banknote, Clock,
  Plus, Store, Gavel, ShieldCheck, AlertTriangle, XCircle,
} from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import styles from './dashboard.module.css'

interface Stats {
  status: string
  totalProducts: number
  pendingOrders: number
  totalOrders: number
  totalEarnings: number
  auctions: number
  marketListings: number
}

export default function SellerDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState(false)

  useEffect(() => {
    fetch('/api/seller/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStats)
      .catch(() => setStatsError(true))
  }, [])

  const firstName = session?.user?.brandName ?? session?.user?.name?.split(' ')[0]

  return (
    <div>
      <FadeIn>
        <div className={styles.header}>
          <h1 className={styles.title}>{firstName}</h1>
          <p className={styles.subtitle}>
            {session?.user?.isVerified
              ? 'Your store is live. Keep crafting, keep earning.'
              : 'Set up your profile while we review your application.'}
          </p>
        </div>
      </FadeIn>

      {stats?.status === 'PENDING' && (
        <div className={styles.alertBanner}>
          <AlertTriangle size={16} className={styles.alertIcon} />
          <div>
            <strong>Verification pending</strong> — Our team reviews every application within 48 hours.
            You can set up your profile now. Product listings go live once verified.
          </div>
        </div>
      )}

      {stats?.status === 'REJECTED' && (
        <div className={`${styles.alertBanner} ${styles.alertBannerRed}`}>
          <XCircle size={16} className={styles.alertIcon} />
          <div>
            <strong>Application not approved</strong> — Your application did not meet our requirements.
            Please contact us to discuss your options.
          </div>
        </div>
      )}

      {session?.user?.isVerified && (
        <div className={styles.verifiedBadge}>
          <ShieldCheck size={13} />
          Vuna Verified Seller
        </div>
      )}

      {statsError && (
        <div className={styles.errorBanner}>
          Could not load your stats. Refresh the page to try again.
        </div>
      )}

      <div className={styles.statsGrid}>
        <FadeIn stagger step={70}>
          <Link href="/seller/products" className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconProducts}`}>
              <Package size={20} />
            </div>
            <div className={`${styles.statValue} ${styles.statValueProducts}`}>
              {stats?.totalProducts ?? '—'}
            </div>
            <div className={styles.statLabel}>Products Listed</div>
          </Link>

          <Link href="/seller/orders" className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconPending}`}>
              <Clock size={20} />
            </div>
            <div className={`${styles.statValue} ${styles.statValuePending}`}>
              {stats?.pendingOrders ?? '—'}
            </div>
            <div className={styles.statLabel}>Pending Orders</div>
          </Link>

          <Link href="/seller/orders" className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconOrders}`}>
              <ShoppingBag size={20} />
            </div>
            <div className={`${styles.statValue} ${styles.statValueOrders}`}>
              {stats?.totalOrders ?? '—'}
            </div>
            <div className={styles.statLabel}>Total Orders</div>
          </Link>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconEarnings}`}>
              <Banknote size={20} />
            </div>
            <div className={`${styles.statValue} ${styles.statValueEarnings}`}>
              R{stats ? stats.totalEarnings.toFixed(2) : '—'}
            </div>
            <div className={styles.statLabel}>Total Earnings</div>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={80}>
        <div className={styles.actionsSection}>
          <h2 className={styles.actionsTitle}>Quick Actions</h2>
          <div className={styles.actions}>
            <Link href="/seller/products" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
              <Plus size={14} /> Add Product
            </Link>
            <Link href="/seller/orders" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
              <ShoppingBag size={14} /> View Orders
            </Link>
            <Link href="/seller/market" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
              <Store size={14} /> Apply for Market
            </Link>
            <Link href="/seller/auctions" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
              <Gavel size={14} /> Submit to Auction
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={120}>
        <div className={styles.harvest}>
        <div className={styles.harvestLabel}>Sivunile — We Have Harvested Together</div>
        <h2 className={styles.harvestTitle}>Your work is your income. Vuna is your stage.</h2>
        <p className={styles.harvestText}>
          Every sale you make on Vuna is a direct payment from a buyer who chose
          your work over everything else. No middlemen. No exploitation.
          Just your work and your story reaching the world.
        </p>
        <div className={styles.harvestStats}>
          <div className={styles.harvestStat}>
            <span className={styles.harvestStatNum}>{stats?.auctions ?? 0}</span>
            <span className={styles.harvestStatLabel}>Auction Submissions</span>
          </div>
          <div className={styles.harvestStat}>
            <span className={styles.harvestStatNum}>{stats?.marketListings ?? 0}</span>
            <span className={styles.harvestStatLabel}>Market Applications</span>
          </div>
        </div>
        </div>
      </FadeIn>
    </div>
  )
}
