'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import styles from './live-bar.module.css'

interface Stats {
  sellers:  { pending: number }
  orders:   { pending: number }
}

export default function AdminLiveBar() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [time, setTime]   = useState<string>('')

  useEffect(() => {
    const updateClock = () => {
      const d = new Date()
      const hh = d.getHours().toString().padStart(2, '0')
      const mm = d.getMinutes().toString().padStart(2, '0')
      setTime(`${hh}:${mm}`)
    }
    updateClock()
    const clockInt = setInterval(updateClock, 30000)

    const loadStats = () => fetch('/api/stats').then(r => r.ok ? r.json() : null).then(setStats).catch(() => {})
    loadStats()
    const statsInt = setInterval(loadStats, 60000)

    return () => { clearInterval(clockInt); clearInterval(statsInt) }
  }, [])

  const pendingApps   = stats?.sellers.pending ?? 0
  const pendingOrders = stats?.orders.pending  ?? 0
  const totalPending  = pendingApps + pendingOrders

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.dot} />
        <span className={styles.label}>Platform Live</span>
        {time && <span className={styles.time}>{time}</span>}
      </div>
      {totalPending > 0 && (
        <div className={styles.alert}>
          <AlertCircle size={11} />
          {pendingApps > 0 && <span>{pendingApps} seller {pendingApps === 1 ? 'application' : 'applications'}</span>}
          {pendingApps > 0 && pendingOrders > 0 && <span className={styles.divider}>·</span>}
          {pendingOrders > 0 && <span>{pendingOrders} order {pendingOrders === 1 ? 'awaiting' : 'awaiting'} action</span>}
        </div>
      )}
      {totalPending === 0 && stats && (
        <div className={styles.allClear}>All caught up</div>
      )}
    </div>
  )
}
