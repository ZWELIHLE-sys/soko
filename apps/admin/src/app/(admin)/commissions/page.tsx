'use client'

import { useEffect, useState } from 'react'
import { FileText, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './commissions.module.css'

interface SellerCommission {
  id:                string
  brandName:         string
  email:             string
  bankName:          string | null
  accountNumber:     string | null
  location:          { name: string } | null
  pendingAmount:     number
  pendingOrders:     number
  outstandingAmount: number
  paidAmount:        number
}

function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

export default function AdminCommissionsPage() {
  const [rows, setRows]         = useState<SellerCommission[]>([])
  const [loading, setLoading]   = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [periodStart, setPeriodStart] = useState(currentMonthRange().start)
  const [periodEnd, setPeriodEnd]     = useState(currentMonthRange().end)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/commissions')
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const generate = async (sellerId: string) => {
    setGenerating(sellerId)
    setError('')
    setSuccess('')
    const res = await fetch('/api/commissions/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sellerId, periodStart, periodEnd }),
    })
    setGenerating(null)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Could not generate invoice.')
      return
    }
    const inv = await res.json()
    setSuccess(`Invoice generated for R${inv.amount.toFixed(2)}.`)
    setTimeout(() => setSuccess(''), 4000)
    load()
  }

  const total = {
    pending:     rows.reduce((s, r) => s + r.pendingAmount, 0),
    outstanding: rows.reduce((s, r) => s + r.outstandingAmount, 0),
    paid:        rows.reduce((s, r) => s + r.paidAmount, 0),
  }

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>
          <FileText size={20} className={styles.titleIcon} /> Commissions
        </h1>
        <p className={shared.pageSub}>
          Vuna&apos;s 5% per completed sale. Generate monthly invoices per seller, then mark them paid once the seller settles via EFT.
        </p>
      </div>

      <div className={styles.totalsGrid}>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Accruing across platform</div>
          <div className={styles.totalAmount}>R{total.pending.toFixed(2)}</div>
        </div>
        <div className={`${styles.totalCard} ${styles.totalOutstanding}`}>
          <div className={styles.totalLabel}>Outstanding (invoiced, not yet paid)</div>
          <div className={styles.totalAmount}>R{total.outstanding.toFixed(2)}</div>
        </div>
        <div className={`${styles.totalCard} ${styles.totalPaid}`}>
          <div className={styles.totalLabel}>Paid to Vuna lifetime</div>
          <div className={styles.totalAmount}>R{total.paid.toFixed(2)}</div>
        </div>
      </div>

      <div className={shared.card}>
        <div className={styles.periodRow}>
          <div className={styles.periodGroup}>
            <label className={styles.periodLabel}>Invoice period</label>
            <div className={styles.periodInputs}>
              <input type="date" className={shared.formInput} value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
              <span className={styles.periodSep}>to</span>
              <input type="date" className={shared.formInput} value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <div className={styles.periodNote}>
            The "Generate invoice" button below bundles a seller&apos;s pending commissions for orders created in this period.
          </div>
        </div>

        {error && <div className={styles.errorBanner}><AlertTriangle size={14} /> {error}</div>}
        {success && <div className={styles.successBanner}><CheckCircle2 size={14} /> {success}</div>}

        {loading ? (
          <div className={shared.loading}>Loading commission data...</div>
        ) : rows.length === 0 ? (
          <div className={shared.empty}>No verified sellers yet.</div>
        ) : (
          <div className={styles.sellerList}>
            {rows.map(r => {
              const hasPending = r.pendingAmount > 0
              return (
                <div key={r.id} className={styles.sellerRow}>
                  <div className={styles.sellerInfo}>
                    <div className={styles.sellerName}>{r.brandName}</div>
                    <div className={styles.sellerMeta}>
                      {r.email}
                      {r.location && <> · <MapPin size={10} /> {r.location.name}</>}
                    </div>
                    {(!r.bankName || !r.accountNumber) && (
                      <div className={styles.bankWarn}>
                        <AlertTriangle size={11} /> Seller hasn&apos;t added banking details yet
                      </div>
                    )}
                  </div>

                  <div className={styles.sellerStats}>
                    <div className={styles.sellerStat}>
                      <div className={styles.sellerStatNum}>R{r.pendingAmount.toFixed(2)}</div>
                      <div className={styles.sellerStatLabel}>Pending · {r.pendingOrders} order{r.pendingOrders !== 1 ? 's' : ''}</div>
                    </div>
                    <div className={styles.sellerStat}>
                      <div className={`${styles.sellerStatNum} ${r.outstandingAmount > 0 ? styles.statOutstanding : ''}`}>
                        R{r.outstandingAmount.toFixed(2)}
                      </div>
                      <div className={styles.sellerStatLabel}>Outstanding</div>
                    </div>
                    <div className={styles.sellerStat}>
                      <div className={styles.sellerStatNum}>R{r.paidAmount.toFixed(2)}</div>
                      <div className={styles.sellerStatLabel}>Paid lifetime</div>
                    </div>
                  </div>

                  <div className={styles.sellerActions}>
                    <button
                      className={shared.btnSuccess}
                      disabled={!hasPending || generating === r.id}
                      onClick={() => generate(r.id)}
                      title={!hasPending ? 'No pending commissions to invoice' : 'Generate an invoice for the period above'}
                    >
                      {generating === r.id ? 'Generating...' : 'Generate Invoice'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
