'use client'

import { useEffect, useState, useCallback } from 'react'
import { Store, CheckCircle2 } from 'lucide-react'
import styles from './market.module.css'
import { MarketAnnouncement } from './_components/MarketAnnouncement'
import { VirtualStall } from './_components/VirtualStall'
import type { Market, MarketListing, SellerProduct } from './_types'

export default function SellerMarketPage() {
  const [markets, setMarkets]               = useState<Market[]>([])
  const [listings, setListings]             = useState<MarketListing[]>([])
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading]               = useState(true)
  const [success, setSuccess]               = useState('')

  const load = useCallback(() => {
    fetch('/api/seller/market-listings')
      .then(r => r.json())
      .then(data => {
        setMarkets(data.markets ?? [])
        setListings(data.listings ?? [])
        setSellerProducts(data.sellerProducts ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleApplied = () => {
    setSuccess('Application submitted! Our team will review it within 48 hours.')
    load()
    setTimeout(() => setSuccess(''), 5000)
  }

  const appliedIds = new Set(listings.map(l => l.market.id))

  if (loading) return <div className={styles.loading}>Loading market info...</div>

  return (
    <div>
      <div className={styles.heroBanner}>
        <div className={styles.heroBannerEyebrow}>Vuna Pop-Up Market</div>
        <h1 className={styles.heroBannerTitle}>Bring your craft to the market floor</h1>
        <p className={styles.heroBannerSub}>
          Vuna curates pop-up market events with a limited number of stalls.
          When a market is announced, apply with your best work — our team selects sellers
          based on craft quality and theme fit. Being selected is a badge of honour.
        </p>
      </div>

      {success && (
        <div className={styles.successBanner}><CheckCircle2 size={15} /> {success}</div>
      )}

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Open Market Events</div>
        {markets.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyCardEyebrow}>Watch This Space</div>
            <Store size={28} className={styles.emptyCardIcon} />
            <div className={styles.emptyCardTitle}>Next market date coming soon</div>
            <div className={styles.emptyCardSub}>
              Vuna markets are curated pop-up events with limited stalls.
              When the next date is announced, your application form will appear right here.
            </div>
          </div>
        ) : (
          <div className={styles.announcementList}>
            {markets.map(m => (
              <MarketAnnouncement
                key={m.id}
                market={m}
                sellerProducts={sellerProducts}
                onApplied={handleApplied}
                alreadyApplied={appliedIds.has(m.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>My Applications & Stalls</div>
        {listings.length === 0 ? (
          <div className={styles.emptySmall}>No applications yet. Apply for an open market above.</div>
        ) : (
          <div className={styles.listingCards}>
            {listings.map(l => <VirtualStall key={l.id} listing={l} />)}
          </div>
        )}
      </section>
    </div>
  )
}
