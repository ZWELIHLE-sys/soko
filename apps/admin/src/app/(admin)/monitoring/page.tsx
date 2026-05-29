'use client'

import { useEffect, useState } from 'react'
import { Database, CreditCard, Zap, Image, AlertTriangle, CheckCircle } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './monitoring.module.css'

interface MonitoringData {
  last24h: { sellers: number; buyers: number; orders: number }
  last7d:  { sellers: number; buyers: number; orders: number }
  alerts:  {
    pendingProducts: number
    outOfStock: number
    databaseStatus: string
    paymentsStatus: string
  }
  recentOrders: Array<{
    id: string
    totalAmount: number
    createdAt: string
    buyer: { name: string }
    seller: { brandName: string }
  }>
}

const systemServices = [
  { label: 'Database',           key: 'databaseStatus', Icon: Database },
  { label: 'Payments (PayFast)', key: 'paymentsStatus', Icon: CreditCard },
  { label: 'API Server',         key: 'apiStatus',      Icon: Zap },
  { label: 'Image Storage',      key: 'imageStatus',    Icon: Image },
]

export default function AdminMonitoringPage() {
  const [data, setData]       = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      fetch('/api/monitoring')
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false) })
    }
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatus = (key: string) => {
    if (!data?.alerts) return 'operational'
    const val = (data.alerts as unknown as Record<string, unknown>)[key]
    return typeof val === 'string' ? val : 'operational'
  }

  const isOk = (status: string) => status === 'healthy' || status === 'operational'

  return (
    <div>
      <div className={shared.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={shared.pageTitle}>System Monitoring</h1>
            <p className={shared.pageSub}>Platform health — auto-refreshes every 60 seconds.</p>
          </div>
          <div className={styles.liveTag}>
            <div className={styles.liveDot} />
            All systems operational
          </div>
        </div>
      </div>

      {loading ? (
        <div className={shared.loading}>Loading monitoring data...</div>
      ) : data && (
        <>
          <div className={styles.servicesGrid}>
            {systemServices.map(({ label, key, Icon }) => {
              const status = getStatus(key)
              const ok = isOk(status)
              return (
                <div key={label} className={`${shared.card} ${styles.serviceCard}`}>
                  <Icon size={22} color={ok ? '#14532D' : '#DC2626'} />
                  <div>
                    <div className={styles.serviceLabel}>{label}</div>
                    <div className={styles.serviceStatus} style={{ color: ok ? '#14532D' : '#DC2626' }}>
                      {ok ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                      {ok ? 'Operational' : status}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={`${shared.card} ${styles.alertsCard}`}>
            <h2 className={shared.cardTitle}>Active Alerts</h2>
            <div className={styles.alertsList}>
              {data.alerts.pendingProducts > 0 && (
                <div className={`${styles.alertItem} ${styles.alertWarn}`}>
                  <AlertTriangle size={14} />
                  {data.alerts.pendingProducts} product{data.alerts.pendingProducts !== 1 ? 's' : ''} in DRAFT — not visible to buyers
                </div>
              )}
              {data.alerts.outOfStock > 0 && (
                <div className={`${styles.alertItem} ${styles.alertError}`}>
                  <AlertTriangle size={14} />
                  {data.alerts.outOfStock} product{data.alerts.outOfStock !== 1 ? 's' : ''} out of stock
                </div>
              )}
              {data.alerts.pendingProducts === 0 && data.alerts.outOfStock === 0 && (
                <div className={`${styles.alertItem} ${styles.alertOk}`}>
                  <CheckCircle size={14} />
                  No active alerts — platform is running cleanly
                </div>
              )}
            </div>
          </div>

          <div className={styles.metricsGrid}>
            {[
              { title: 'Last 24 Hours', d: data.last24h },
              { title: 'Last 7 Days',   d: data.last7d  },
            ].map(({ title, d }) => (
              <div key={title} className={shared.card}>
                <h2 className={shared.cardTitle}>{title}</h2>
                <div className={styles.metricRows}>
                  {[
                    { label: 'New sellers applied',   value: d.sellers },
                    { label: 'New buyers registered', value: d.buyers  },
                    { label: 'Orders placed',         value: d.orders  },
                  ].map(row => (
                    <div key={row.label} className={styles.metricRow}>
                      <span className={styles.metricLabel}>{row.label}</span>
                      <span className={styles.metricValue}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={shared.card}>
            <h2 className={shared.cardTitle}>Recent Orders</h2>
            <div className={styles.orderRows}>
              {data.recentOrders.length === 0 ? (
                <div className={shared.empty}>No orders yet.</div>
              ) : data.recentOrders.map(order => (
                <div key={order.id} className={styles.orderRow}>
                  <div>
                    <span className={styles.orderBuyer}>{order.buyer.name}</span>
                    <span className={styles.orderArrow}> → </span>
                    <span className={styles.orderSeller}>{order.seller.brandName}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderAmount}>R{order.totalAmount.toFixed(2)}</span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
