'use client'

import { useEffect, useState } from 'react'
import { Sprout, PawPrint, AlertTriangle, Mail, Phone, CheckCircle2 } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './agri.module.css'

interface Harvest {
  id: string
  name: string
  harvestStatus: string
  plantedAt: string | null
  expectedHarvestDate: string | null
  estimatedYield: number | null
  yieldUnit: string | null
  seller: { brandName: string; email: string; phone: string | null }
  orderItems: { quantity: number }[]
}

interface UnmarkedAnimal {
  id: string
  species: string
  breed: string
  purpose: string
  createdAt: string
  product: { id: string; name: string; status: string; seller: { brandName: string } } | null
  piece:   { id: string; title: string; currentStage: string; seller: { brandName: string } } | null
  auction: { id: string; title: string; status: string; seller: { brandName: string } } | null
}

export default function AdminAgriPage() {
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [unmarked, setUnmarked] = useState<UnmarkedAnimal[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/agri')
      .then(r => r.json())
      .then(d => {
        setHarvests(Array.isArray(d?.harvests) ? d.harvests : [])
        setUnmarked(Array.isArray(d?.unmarkedLivestock) ? d.unmarkedLivestock : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

  const now = Date.now()

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>
          <Sprout size={20} className={styles.titleIcon} /> Agriculture
        </h1>
        <p className={shared.pageSub}>
          The oversight lens: harvests carrying reservations, and livestock records missing
          their Animal Identification Act brand marks. Farmers resolve their own harvests —
          this page tells you who may need a nudge.
        </p>
      </div>

      {loading ? (
        <div className={shared.loading}>Loading agriculture overview...</div>
      ) : (
        <>
          {/* ── Harvests in progress ── */}
          <div className={shared.card} style={{ marginBottom: 20 }}>
            <div className={styles.cardHeader}>
              <Sprout size={16} className={styles.cardIcon} />
              <h2 className={shared.cardTitle}>Harvests In Progress ({harvests.length})</h2>
            </div>

            {harvests.length === 0 ? (
              <div className={shared.empty}>No open harvest pre-orders right now.</div>
            ) : (
              <div className={styles.list}>
                {harvests.map(h => {
                  const reserved = h.orderItems.reduce((s, i) => s + i.quantity, 0)
                  const overdue = h.harvestStatus === 'GROWING'
                    && h.expectedHarvestDate
                    && new Date(h.expectedHarvestDate).getTime() < now
                  return (
                    <div key={h.id} className={styles.row}>
                      <div className={styles.rowMain}>
                        <div className={styles.rowTitle}>
                          {h.name}
                          <span className={`${styles.chip} ${h.harvestStatus === 'GROWING' ? styles.chipGrowing : styles.chipReady}`}>
                            {h.harvestStatus === 'GROWING' ? 'Growing' : 'Harvest Ready'}
                          </span>
                          {overdue && (
                            <span className={`${styles.chip} ${styles.chipOverdue}`}>
                              <AlertTriangle size={10} /> Past expected date
                            </span>
                          )}
                        </div>
                        <div className={styles.rowMeta}>
                          {h.seller.brandName}
                          {h.expectedHarvestDate && <> · expected {fmtDate(h.expectedHarvestDate)}</>}
                          {' · '}{reserved} of {h.estimatedYield ?? '?'} {h.yieldUnit ?? 'units'} reserved
                        </div>
                      </div>
                      <div className={styles.rowActions}>
                        <a href={`mailto:${h.seller.email}`} className={styles.contactBtn}><Mail size={11} /> Email</a>
                        {h.seller.phone && (
                          <a href={`tel:${h.seller.phone}`} className={styles.contactBtn}><Phone size={11} /> Call</a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Livestock compliance ── */}
          <div className={shared.card}>
            <div className={styles.cardHeader}>
              <PawPrint size={16} className={styles.cardIcon} />
              <h2 className={shared.cardTitle}>Livestock Without Brand Marks ({unmarked.length})</h2>
            </div>
            <p className={styles.complianceNote}>
              Brand marks are optional at listing, but the Animal Identification Act requires them
              where applicable. Follow up with these sellers before their animals sell.
            </p>

            {unmarked.length === 0 ? (
              <div className={styles.allClear}>
                <CheckCircle2 size={14} /> Every livestock record carries a brand mark. Clean.
              </div>
            ) : (
              <div className={styles.list}>
                {unmarked.map(a => {
                  const home = a.piece
                    ? { label: `Journey piece — ${a.piece.currentStage.toLowerCase()}`, name: a.piece.title, seller: a.piece.seller.brandName }
                    : a.product
                    ? { label: 'Shop listing', name: a.product.name, seller: a.product.seller.brandName }
                    : a.auction
                    ? { label: 'Auction lot', name: a.auction.title, seller: a.auction.seller.brandName }
                    : { label: 'Unlinked record', name: a.breed, seller: '—' }
                  return (
                    <div key={a.id} className={styles.row}>
                      <div className={styles.rowMain}>
                        <div className={styles.rowTitle}>
                          {home.name}
                          <span className={`${styles.chip} ${styles.chipUnmarked}`}>No brand mark</span>
                        </div>
                        <div className={styles.rowMeta}>
                          {home.seller} · {a.breed} · {a.species.toLowerCase()} · {a.purpose.replace('_', ' ').toLowerCase()} · {home.label}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
