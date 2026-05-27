'use client'

import { useEffect, useState } from 'react'
import { Banknote, Clock, CheckCircle2, TrendingUp, Info } from 'lucide-react'
import styles from './earnings.module.css'

interface OrderItem {
  quantity: number
  price: number
  product: { name: string }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

interface EarningsData {
  totalEarned: number
  totalPending: number
  byMonth: Record<string, number>
  delivered: Order[]
  pending: Order[]
}

export default function SellerEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seller/earnings').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  if (loading) return <div className={styles.loading}>Loading earnings...</div>
  if (!data)   return null

  const months = Object.entries(data.byMonth)

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Earnings</h1>
        <p className={styles.subtitle}>Track your income from every sale on Vuna.</p>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}><Banknote size={22} /></div>
          <div className={styles.summaryAmount}>R{data.totalEarned.toFixed(2)}</div>
          <div className={styles.summaryLabel}>Total Earned</div>
          <div className={styles.summaryNote}>From all delivered orders</div>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardPending}`}>
          <div className={styles.summaryIconPending}><Clock size={22} /></div>
          <div className={styles.summaryAmountPending}>R{data.totalPending.toFixed(2)}</div>
          <div className={styles.summaryLabel}>Pending</div>
          <div className={styles.summaryNote}>Orders in progress — not yet delivered</div>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardTotal}`}>
          <div className={styles.summaryIconTotal}><TrendingUp size={22} /></div>
          <div className={styles.summaryAmountTotal}>
            R{(data.totalEarned + data.totalPending).toFixed(2)}
          </div>
          <div className={styles.summaryLabel}>Lifetime Value</div>
          <div className={styles.summaryNote}>Earned + pending combined</div>
        </div>
      </div>

      {/* PayFast guidance banner */}
      <div className={styles.payfastBanner}>
        <div className={styles.payfastEyebrow}>How You Receive Payment</div>
        <h2 className={styles.payfastTitle}>Your money goes directly to you via PayFast</h2>
        <p className={styles.payfastText}>
          When a buyer pays for your product, the payment is processed through PayFast —
          South Africa&apos;s leading payment gateway. Vuna takes a small platform commission
          on each completed sale, and the remainder is transferred directly to your registered
          bank account. No middlemen. No delays beyond PayFast&apos;s standard settlement period.
        </p>
        <div className={styles.payfastSteps}>
          <div className={styles.payfastStep}>
            <div className={styles.stepNum}>01</div>
            <div>
              <div className={styles.stepTitle}>Buyer pays at checkout</div>
              <div className={styles.stepDesc}>Card, EFT, Instant EFT or SnapScan via PayFast</div>
            </div>
          </div>
          <div className={styles.payfastStep}>
            <div className={styles.stepNum}>02</div>
            <div>
              <div className={styles.stepTitle}>You confirm and deliver</div>
              <div className={styles.stepDesc}>Update the order status as you pack and arrange delivery</div>
            </div>
          </div>
          <div className={styles.payfastStep}>
            <div className={styles.stepNum}>03</div>
            <div>
              <div className={styles.stepTitle}>Payment settled to your account</div>
              <div className={styles.stepDesc}>Once delivery is confirmed, funds settle to your bank within PayFast&apos;s schedule</div>
            </div>
          </div>
        </div>
        <div className={styles.payfastNote}>
          <Info size={13} />
          Your banking details for direct EFT payouts are managed in your{' '}
          <a href="/seller/profile" style={{ color: '#D97706', textDecoration: 'underline' }}>
            Profile Settings
          </a>.
        </div>
      </div>

      {/* Monthly breakdown */}
      {months.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Monthly Breakdown</div>
          <div className={styles.monthTable}>
            {months.map(([month, amount]) => (
              <div key={month} className={styles.monthRow}>
                <span className={styles.monthLabel}>{month}</span>
                <div className={styles.monthBarWrap}>
                  <div
                    className={styles.monthBar}
                    style={{ width: `${Math.min((amount / data.totalEarned) * 100, 100)}%` }}
                  />
                </div>
                <span className={styles.monthAmount}>R{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending orders */}
      {data.pending.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Pending — Awaiting Delivery ({data.pending.length})</div>
          <div className={styles.orderList}>
            {data.pending.map(o => (
              <div key={o.id} className={styles.orderRow}>
                <div className={styles.orderInfo}>
                  <div className={styles.orderNum}>#{o.orderNumber.slice(-8).toUpperCase()}</div>
                  <div className={styles.orderItems}>
                    {o.items.map((item, i) => (
                      <span key={i}>{item.product.name} ×{item.quantity}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.pendingBadge}><Clock size={10} /> {o.status.replace(/_/g, ' ')}</span>
                  <span className={styles.orderAmt}>R{o.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Paid orders */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Paid — Delivered Orders ({data.delivered.length})</div>
        {data.delivered.length === 0 ? (
          <div className={styles.emptySmall}>No delivered orders yet. Keep fulfilling!</div>
        ) : (
          <div className={styles.orderList}>
            {data.delivered.map(o => (
              <div key={o.id} className={styles.orderRow}>
                <div className={styles.orderInfo}>
                  <div className={styles.orderNum}>#{o.orderNumber.slice(-8).toUpperCase()}</div>
                  <div className={styles.orderDate}>{fmt(o.createdAt)}</div>
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.paidBadge}><CheckCircle2 size={10} /> Paid</span>
                  <span className={styles.orderAmt}>R{o.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
