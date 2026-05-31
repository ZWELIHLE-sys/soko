'use client'

import { useEffect, useState } from 'react'
import shared from '../../admin.module.css'
import styles from './orders.module.css'
import { AdminLocationFilter } from '@/components/AdminLocationFilter'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  payoutStatus: string
  createdAt: string
  buyer:  { name: string; email: string }
  seller: { brandName: string }
  items: Array<{ id: string; quantity: number; price: number; product: { name: string } }>
}

const statusStyle: Record<string, { color: string; bg: string }> = {
  PENDING:    { color: '#92400E', bg: '#FEF9C3' },
  CONFIRMED:  { color: '#1D4ED8', bg: '#EFF6FF' },
  PACKED:     { color: '#6D28D9', bg: '#EDE9FE' },
  IN_TRANSIT: { color: '#0369A1', bg: '#E0F2FE' },
  DELIVERED:  { color: '#14532D', bg: '#DCFCE7' },
  CANCELLED:  { color: '#374151', bg: '#F3F4F6' },
  REFUNDED:   { color: '#991B1B', bg: '#FEE2E2' },
}

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]         = useState('ALL')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [locationId, setLocationId] = useState('')

  useEffect(() => {
    setLoading(true)
    const url = locationId ? `/api/orders?locationId=${locationId}` : '/api/orders'
    fetch(url)
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [locationId])

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Orders</h1>
        <p className={shared.pageSub}>All orders placed on the platform.</p>
      </div>

      <div className={shared.tabs}>
        {FILTERS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}
          >
            {tab}{tab !== 'ALL' && ` (${orders.filter(o => o.status === tab).length})`}
          </button>
        ))}
      </div>

      <AdminLocationFilter value={locationId} onChange={setLocationId} />

      {loading ? (
        <div className={shared.loading}>Loading orders...</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(order => {
            const sc = statusStyle[order.status] ?? statusStyle.PENDING
            const isOpen = expanded === order.id
            return (
              <div key={order.id} className={styles.orderCard}>
                <div
                  className={styles.orderRow}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  <div className={styles.orderLeft}>
                    <div className={styles.orderNum}>#{order.orderNumber.slice(-8).toUpperCase()}</div>
                    <div className={styles.orderMeta}>
                      {order.buyer.name} → {order.seller.brandName}
                    </div>
                    <div className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                    </div>
                  </div>
                  <div className={styles.orderRight}>
                    <span
                      className={shared.badge}
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {order.status}
                    </span>
                    <span className={styles.orderAmount}>R{order.totalAmount.toFixed(2)}</span>
                    <span className={styles.payoutBadge} style={{
                      color: order.payoutStatus === 'PAID_OUT' ? '#14532D' : '#92400E',
                    }}>
                      {order.payoutStatus === 'PAID_OUT' ? 'Paid out' : 'Pending payout'}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className={styles.orderItems}>
                    {order.items.map(item => (
                      <div key={item.id} className={styles.orderItem}>
                        <span>{item.product.name}</span>
                        <span>×{item.quantity} · R{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && <div className={shared.empty}>No orders in this category.</div>}
        </div>
      )}
    </div>
  )
}
