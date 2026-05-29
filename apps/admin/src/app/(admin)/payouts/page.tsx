'use client'

import { useEffect, useState } from 'react'
import { Banknote, CheckCircle } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './payouts.module.css'

interface PayoutOrder {
  id: string
  orderNumber: string
  totalAmount: number
  commission: number | null
  payoutStatus: string
  createdAt: string
  buyer:  { name: string }
  seller: {
    brandName: string
    bankName: string | null
    accountHolder: string | null
    accountNumber: string | null
    branchCode: string | null
  }
}

export default function AdminPayoutsPage() {
  const [orders, setOrders]     = useState<PayoutOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter]     = useState<'PENDING_PAYOUT' | 'PAID_OUT'>('PENDING_PAYOUT')

  useEffect(() => {
    fetch('/api/payouts')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtered = orders.filter(o => o.payoutStatus === filter)

  const sellerAmount = (o: PayoutOrder) => {
    const comm = o.commission ?? o.totalAmount * 0.10
    return (o.totalAmount - comm).toFixed(2)
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(filtered.filter(o => o.payoutStatus === 'PENDING_PAYOUT').map(o => o.id)))
  }

  const markPaidOut = async () => {
    if (selected.size === 0) return
    setProcessing(true)
    const res = await fetch('/api/payouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: Array.from(selected) }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o =>
        selected.has(o.id) ? { ...o, payoutStatus: 'PAID_OUT' } : o
      ))
      setSelected(new Set())
    }
    setProcessing(false)
  }

  const pendingTotal = orders
    .filter(o => o.payoutStatus === 'PENDING_PAYOUT')
    .reduce((sum, o) => sum + (o.totalAmount - (o.commission ?? o.totalAmount * 0.10)), 0)

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Payouts</h1>
        <p className={shared.pageSub}>Mark seller earnings as paid after EFT transfer.</p>
      </div>

      <div className={styles.summary}>
        <div className={shared.card}>
          <div className={styles.summaryLabel}>Pending Payout (sellers owed)</div>
          <div className={styles.summaryAmount}>R{pendingTotal.toFixed(2)}</div>
          <div className={styles.summaryNote}>After Vuna 10% commission</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={shared.tabs} style={{ marginBottom: 0 }}>
          {(['PENDING_PAYOUT', 'PAID_OUT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}
            >
              {tab === 'PENDING_PAYOUT' ? 'Pending' : 'Paid Out'}
              {` (${orders.filter(o => o.payoutStatus === tab).length})`}
            </button>
          ))}
        </div>

        {filter === 'PENDING_PAYOUT' && (
          <div className={styles.toolbarActions}>
            <button className={shared.btnSecondary} onClick={selectAll}>Select All</button>
            <button
              className={shared.btnPrimary}
              onClick={markPaidOut}
              disabled={selected.size === 0 || processing}
            >
              <Banknote size={14} />
              {processing ? 'Processing...' : `Mark ${selected.size || ''} Paid Out`}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className={shared.loading}>Loading payouts...</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(order => {
            const isPending = order.payoutStatus === 'PENDING_PAYOUT'
            const isSelected = selected.has(order.id)
            return (
              <div
                key={order.id}
                className={`${styles.payoutCard} ${isSelected ? styles.payoutCardSelected : ''}`}
                onClick={() => isPending && toggleSelect(order.id)}
              >
                <div className={styles.payoutRow}>
                  {isPending && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className={styles.checkbox}
                    />
                  )}
                  {!isPending && (
                    <CheckCircle size={18} color="#14532D" className={styles.paidIcon} />
                  )}

                  <div className={styles.payoutInfo}>
                    <div className={styles.payoutSeller}>{order.seller.brandName}</div>
                    <div className={styles.payoutMeta}>
                      Order #{order.orderNumber.slice(-8).toUpperCase()} ·
                      {order.buyer.name} ·
                      {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                    </div>
                    {order.seller.bankName && (
                      <div className={styles.bankInfo}>
                        {order.seller.bankName} ·
                        {order.seller.accountHolder} ·
                        {order.seller.accountNumber} ·
                        Branch: {order.seller.branchCode}
                      </div>
                    )}
                  </div>

                  <div className={styles.payoutAmounts}>
                    <div className={styles.payoutGross}>R{order.totalAmount.toFixed(2)}</div>
                    <div className={styles.payoutComm}>
                      Commission: R{(order.commission ?? order.totalAmount * 0.10).toFixed(2)}
                    </div>
                    <div className={styles.payoutNet}>
                      Seller receives: <strong>R{sellerAmount(order)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className={shared.empty}>
              {filter === 'PAID_OUT' ? 'No paid-out orders yet.' : 'No pending payouts.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
