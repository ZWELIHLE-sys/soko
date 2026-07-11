'use client'

import { useEffect, useState } from 'react'
import { Banknote, Clock, CheckCircle2, TrendingUp, Info, FileText, AlertTriangle } from 'lucide-react'
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

interface CommissionSummary {
  pendingAmount:       number
  pendingOrders:       number
  outstandingAmount:   number
  outstandingInvoices: number
  paidAmount:          number
  paidInvoices:        number
}

interface CommissionInvoice {
  id:           string
  amount:       number
  status:       string
  periodStart:  string
  periodEnd:    string
  generatedAt:  string
  paidAt:       string | null
  adminNote:    string | null
  _count:       { orders: number }
}

export default function SellerEarningsPage() {
  const [data, setData]             = useState<EarningsData | null>(null)
  const [comm, setComm]             = useState<{ summary: CommissionSummary; invoices: CommissionInvoice[] } | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/seller/earnings').then(r => r.json()),
      fetch('/api/seller/commissions').then(r => r.json()),
    ]).then(([earnings, commissions]) => {
      setData(earnings)
      setComm(commissions)
      setLoading(false)
    })
  }, [])

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  if (loading) return <div className={styles.loading}>Loading earnings...</div>
  if (!data)   return null

  const months = Object.entries(data.byMonth)
  const totalCommissionDue = (comm?.summary.pendingAmount ?? 0) + (comm?.summary.outstandingAmount ?? 0)

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Earnings</h1>
        <p className={styles.subtitle}>Track your income, Vuna&apos;s commission, and your invoice history.</p>
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

      {/* How payment works — manual EFT model */}
      <div className={styles.eftBanner}>
        <div className={styles.eftEyebrow}>How You Receive Payment</div>
        <h2 className={styles.eftTitle}>Buyers pay you directly via EFT</h2>
        <p className={styles.eftText}>
          On Vuna, buyers see your bank account when they place an order and make the payment
          directly to you. The full amount lands in your bank within their EFT clearing time —
          no payment gateway, no settlement delay, no third party holding your money.
        </p>
        <div className={styles.eftSteps}>
          <div className={styles.eftStep}>
            <div className={styles.stepNum}>01</div>
            <div>
              <div className={styles.stepTitle}>Buyer places order</div>
              <div className={styles.stepDesc}>They see your banking details + the order reference to use</div>
            </div>
          </div>
          <div className={styles.eftStep}>
            <div className={styles.stepNum}>02</div>
            <div>
              <div className={styles.stepTitle}>Buyer pays you via EFT</div>
              <div className={styles.stepDesc}>They upload proof of payment; you verify it in your dashboard</div>
            </div>
          </div>
          <div className={styles.eftStep}>
            <div className={styles.stepNum}>03</div>
            <div>
              <div className={styles.stepTitle}>You fulfil and deliver</div>
              <div className={styles.stepDesc}>You keep 95% of the sale — Vuna invoices the 5% commission monthly</div>
            </div>
          </div>
        </div>
        <div className={styles.eftNote}>
          <Info size={13} />
          Make sure your banking details are up to date in your{' '}
          <a href="/seller/profile" className={styles.eftLink}>Profile</a> so buyers can pay you.
        </div>
      </div>

      {/* Vuna Commission section */}
      <div className={styles.commissionCard}>
        <div className={styles.commissionHeader}>
          <FileText size={18} className={styles.commissionIcon} />
          <div>
            <div className={styles.commissionTitle}>Vuna Commission</div>
            <div className={styles.commissionSub}>5% of each completed sale — invoiced to you monthly</div>
          </div>
        </div>

        <div className={styles.commissionGrid}>
          <div className={styles.commissionStat}>
            <div className={styles.commissionStatNum}>R{comm?.summary.pendingAmount.toFixed(2) ?? '0.00'}</div>
            <div className={styles.commissionStatLabel}>Accruing (not yet invoiced)</div>
            <div className={styles.commissionStatNote}>{comm?.summary.pendingOrders ?? 0} order{(comm?.summary.pendingOrders ?? 0) !== 1 ? 's' : ''}</div>
          </div>
          <div className={`${styles.commissionStat} ${styles.commissionStatOutstanding}`}>
            <div className={styles.commissionStatNum}>R{comm?.summary.outstandingAmount.toFixed(2) ?? '0.00'}</div>
            <div className={styles.commissionStatLabel}>Owed to Vuna</div>
            <div className={styles.commissionStatNote}>{comm?.summary.outstandingInvoices ?? 0} outstanding invoice{(comm?.summary.outstandingInvoices ?? 0) !== 1 ? 's' : ''}</div>
          </div>
          <div className={`${styles.commissionStat} ${styles.commissionStatPaid}`}>
            <div className={styles.commissionStatNum}>R{comm?.summary.paidAmount.toFixed(2) ?? '0.00'}</div>
            <div className={styles.commissionStatLabel}>Paid to Vuna</div>
            <div className={styles.commissionStatNote}>{comm?.summary.paidInvoices ?? 0} invoice{(comm?.summary.paidInvoices ?? 0) !== 1 ? 's' : ''} settled</div>
          </div>
        </div>

        {(comm?.summary.outstandingAmount ?? 0) > 0 && (
          <div className={styles.commissionAlert}>
            <AlertTriangle size={14} />
            You have <strong>R{comm?.summary.outstandingAmount.toFixed(2)}</strong> outstanding to Vuna.
            Please settle this within 30 days of the invoice date to keep your seller status active.
          </div>
        )}

        {totalCommissionDue === 0 && (
          <div className={styles.commissionAllClear}>
            <CheckCircle2 size={14} /> You owe Vuna nothing right now. Sivunile.
          </div>
        )}

        {/* Invoice list */}
        {(comm?.invoices?.length ?? 0) > 0 && (
          <div className={styles.invoiceList}>
            <div className={styles.invoiceListTitle}>Invoice History</div>
            {comm!.invoices.map(inv => (
              <div key={inv.id} className={styles.invoiceRow}>
                <div>
                  <div className={styles.invoicePeriod}>
                    {fmt(inv.periodStart)} – {fmt(inv.periodEnd)}
                  </div>
                  <div className={styles.invoiceMeta}>
                    {inv._count.orders} order{inv._count.orders !== 1 ? 's' : ''} ·
                    {inv.status === 'PAID'
                      ? ` Paid ${inv.paidAt ? fmt(inv.paidAt) : ''}`
                      : ` Generated ${fmt(inv.generatedAt)}`}
                  </div>
                </div>
                <div className={styles.invoiceRight}>
                  <span className={inv.status === 'PAID' ? styles.invoiceBadgePaid : styles.invoiceBadgeDue}>
                    {inv.status === 'PAID' ? 'Paid' : 'Outstanding'}
                  </span>
                  <span className={styles.invoiceAmount}>R{inv.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
