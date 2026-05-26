'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import Image from 'next/image'
import { Store, ShoppingBag, CheckCircle, AlertTriangle, CalendarDays, Lock } from 'lucide-react'
import styles from './apply.module.css'

interface MarketProduct {
  id: string
  name: string
  price: number
  images: string[]
}

interface MarketData {
  id: string
  title: string
  theme: string | null
  startDate: string
  endDate: string
  applicationDeadline: string
  description: string | null
}

export default function MarketApplyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [market, setMarket]           = useState<MarketData | null>(null)
  const [products, setProducts]       = useState<MarketProduct[]>([])
  const [selected, setSelected]       = useState<string[]>([])
  const [sellerNote, setSellerNote]   = useState('')
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'SELLER') {
      router.push('/login?callbackUrl=/market/apply')
      return
    }

    // Load current market
    fetch('/api/market/current')
      .then(r => r.json())
      .then(data => {
        setMarket(data.market)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Load seller's products
    fetch('/api/seller/products')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {})
  }, [session, status, router])

  const toggleProduct = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (!market || selected.length === 0) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/market/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marketId: market.id,
        productIds: selected,
        sellerNote,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (loading || status === 'loading') {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingWrap}>Loading market details...</div>
      </div>
    )
  }

  if (!market) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.noMarket}>
          <Store size={44} className={styles.noMarketIcon} />
          <h2 className={styles.noMarketTitle}>No market open for applications</h2>
          <p className={styles.noMarketSub}>
            Check back soon — market dates are announced ahead of time.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  const deadlinePassed = new Date() > new Date(market.applicationDeadline)

  if (deadlinePassed) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.noMarket}>
          <Lock size={44} className={styles.noMarketIcon} />
          <h2 className={styles.noMarketTitle}>Applications are closed</h2>
          <p className={styles.noMarketSub}>
            The application deadline for <strong>{market.title}</strong> has passed.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className={styles.page}>
        <Navbar />
        <FadeIn>
          <div className={styles.successWrap}>
            <CheckCircle size={52} className={styles.successIcon} />
            <h2 className={styles.successTitle}>Application submitted!</h2>
            <p className={styles.successSub}>
              Your application for <strong>{market.title}</strong> is under review.
              We&apos;ll contact you once it&apos;s approved.
            </p>
            <button className={styles.backBtn} onClick={() => router.push('/market')}>
              View the market page
            </button>
          </div>
        </FadeIn>
        <Footer />
      </div>
    )
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-ZA', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.eyebrow}>Seller Application</div>
        <h1 className={styles.heroTitle}>Apply to {market.title}</h1>
        {market.theme && <div className={styles.theme}>{market.theme}</div>}
        <div className={styles.dates}>
          <CalendarDays size={13} />
          {formatDate(market.startDate)} — {formatDate(market.endDate)}
        </div>
      </div>

      <div className={styles.inner}>
        <FadeIn>
          <div className={styles.deadlineBanner}>
            <AlertTriangle size={14} />
            Application deadline: <strong>{formatDate(market.applicationDeadline)}</strong>
          </div>
        </FadeIn>

        <FadeIn>
          <div className={styles.section}>
            <h2 className={styles.sectionLabel}>
              <ShoppingBag size={16} />
              Select products to feature
            </h2>
            <p className={styles.sectionSub}>
              Choose the products you want to showcase at this market. Only active products are shown.
            </p>

            {products.length === 0 ? (
              <div className={styles.noProducts}>
                You have no active products yet.{' '}
                <a href="/seller/products" className={styles.noProductsLink}>
                  Add products first →
                </a>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {products.map(p => (
                  <button
                    key={p.id}
                    className={`${styles.productCard} ${selected.includes(p.id) ? styles.productSelected : ''}`}
                    onClick={() => toggleProduct(p.id)}
                    type="button"
                  >
                    <div className={styles.productImg}>
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className={styles.productImgEl} sizes="120px" />
                      ) : (
                        <div className={styles.productImgFallback}>
                          <ShoppingBag size={20} />
                        </div>
                      )}
                      {selected.includes(p.id) && (
                        <div className={styles.checkOverlay}>
                          <CheckCircle size={22} />
                        </div>
                      )}
                    </div>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.productPrice}>R{p.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionLabel}>
              <Store size={16} />
              Tell us about your stall (optional)
            </h2>
            <textarea
              className={styles.textarea}
              placeholder="Tell us what makes your work special, any setup requirements, or why you want to join this market..."
              value={sellerNote}
              onChange={e => setSellerNote(e.target.value)}
              rows={4}
            />
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          {error && (
            <div className={styles.errorBanner}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || selected.length === 0}
          >
            {submitting ? 'Submitting...' : `Submit Application (${selected.length} product${selected.length !== 1 ? 's' : ''} selected)`}
          </button>
          {selected.length === 0 && (
            <p className={styles.submitHint}>Select at least one product to apply</p>
          )}
        </FadeIn>
      </div>

      <Footer />
    </div>
  )
}
