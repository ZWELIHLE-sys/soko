'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { PAYFAST_URL } from '@/lib/payfast'
import { Globe, Lock, BadgeCheck, Info } from 'lucide-react'
import styles from './checkout.module.css'

interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  sellerName: string
  categoryIcon: string
  quantity: number
  sellerId: string
}

interface Location { id: string; name: string }

const securityItems = [
  { Icon: Lock,       text: '256-bit SSL secured' },
  { Icon: BadgeCheck, text: 'PayFast certified' },
  { Icon: Globe,      text: 'Supporting African creators' },
]

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const payformRef = useRef<HTMLFormElement>(null)

  const [cart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('vuna_cart') || '[]')
  })
  const [provinces, setProvinces] = useState<Location[]>([])
  const [districts, setDistricts] = useState<Location[]>([])
  const [cities, setCities]       = useState<Location[]>([])
  const [payFastFields, setPayFastFields] = useState<Record<string, string> | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const [form, setForm] = useState({
    firstName:  '',
    lastName:   '',
    phone:      '',
    address:    '',
    provinceId: '',
    districtId: '',
    cityId:     '',
  })

  useEffect(() => {
    if (!session) { router.push('/login?redirect=/checkout'); return }
    if (cart.length === 0) { router.push('/cart'); return }
    fetch('/api/locations/provinces').then(r => r.json()).then(setProvinces)
  }, [session, router, cart.length])

  useEffect(() => {
    if (!form.provinceId) return
    fetch(`/api/locations/children?parentId=${form.provinceId}`)
      .then(r => r.json()).then(setDistricts)
  }, [form.provinceId])

  useEffect(() => {
    if (!form.districtId) return
    fetch(`/api/locations/children?parentId=${form.districtId}`)
      .then(r => r.json()).then(setCities)
  }, [form.districtId])

  // Auto-submit PayFast form after fields are set
  useEffect(() => {
    if (payFastFields && payformRef.current) {
      payformRef.current.submit()
    }
  }, [payFastFields])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistricts([])
    setCities([])
    setForm(f => ({ ...f, provinceId: e.target.value, districtId: '', cityId: '' }))
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCities([])
    setForm(f => ({ ...f, districtId: e.target.value, cityId: '' }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.cityId) {
      setError('Please select your city')
      return
    }

    setLoading(true)

    const orderRes = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        deliveryAddress: form.address,
        deliveryCityId:  form.cityId,
        deliveryTier:    'SELLER_ARRANGED',
        deliveryFee:     0,
      })
    })

    const orderData = await orderRes.json()

    if (!orderRes.ok) {
      setError(orderData.error)
      setLoading(false)
      return
    }

    const pfRes = await fetch('/api/payfast/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId:   orderData.orders[0].id,
        amount:    subtotal.toFixed(2),
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     session?.user?.email || '',
        itemName:  `Vuna Order — ${cart.length} item${cart.length !== 1 ? 's' : ''}`,
      })
    })

    const pfData = await pfRes.json()
    setLoading(false)

    if (!pfRes.ok) {
      setError('Payment initiation failed. Please try again.')
      return
    }

    setPayFastFields(pfData.fields)
  }

  return (
    <div className={styles.page}>
      <Navbar />

      {payFastFields && (
        <form ref={payformRef} action={PAYFAST_URL} method="POST" className={styles.payformHidden}>
          {Object.entries(payFastFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Checkout</h1>
          <p className={styles.headerSubtitle}>
            Almost there — complete your delivery details to place your order.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className={styles.grid}>

            {/* Left — delivery details */}
            <div className={styles.left}>

              {/* Personal details */}
              <div className={styles.card}>
                <div className={styles.cardLabel}>Personal Details</div>
                <div className={styles.twoCol}>
                  <div>
                    <label className={styles.label}>First name</label>
                    <input className={styles.input} required placeholder="First name"
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.label}>Last name</label>
                    <input className={styles.input} required placeholder="Last name"
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Phone number</label>
                  <input className={styles.input} required placeholder="e.g. 071 234 5678"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              {/* Delivery address */}
              <div className={styles.card}>
                <div className={styles.cardLabel}>Delivery Address</div>
                <div className={styles.fieldWrap}>
                  <label className={styles.label}>Street address</label>
                  <input className={styles.input} required
                    placeholder="e.g. 12 Mandela Street, Umlazi"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className={styles.twoCol}>
                  <div>
                    <label className={styles.label}>Province</label>
                    <select className={styles.select} required
                      value={form.provinceId} onChange={handleProvinceChange}>
                      <option value="">Select province</option>
                      {provinces.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>District</label>
                    <select className={styles.select} required
                      value={form.districtId} onChange={handleDistrictChange}
                      disabled={districts.length === 0}>
                      <option value="">Select district</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={styles.label}>City / Town</label>
                  <select className={styles.select} required
                    value={form.cityId}
                    onChange={e => setForm({ ...form, cityId: e.target.value })}
                    disabled={cities.length === 0}>
                    <option value="">Select city</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TODO: DHL API integration
                  Replace this notice with a real-time delivery method selector.
                  Flow: buyer location + seller location → DHL rate API → show cost + ETA.
                  Vuna generates waybill on order confirm, buyer gets tracking number.
                  DeliveryTier enum already has DHL — just switch from SELLER_ARRANGED.
                  Reference: packages/db/prisma/schema.prisma DeliveryTier enum */}
              {/* Delivery notice */}
              <div className={styles.deliveryNotice}>
                <Info size={16} className={styles.deliveryNoticeIcon} />
                <div>
                  <div className={styles.deliveryNoticeTitle}>Delivery arranged by the seller</div>
                  <div className={styles.deliveryNoticeText}>
                    Once your order is confirmed, the seller will contact you directly
                    to arrange delivery and confirm any associated cost. Your delivery
                    address above will be shared with them.
                  </div>
                </div>
              </div>
            </div>

            {/* Right — order summary */}
            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.summaryItems}>
                {cart.map(item => (
                  <div key={item.productId} className={styles.summaryItem}>
                    <div className={styles.itemThumb}>
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="44px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <span>{item.categoryIcon}</span>
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemSeller}>by {item.sellerName} × {item.quantity}</div>
                    </div>
                    <div className={styles.itemPrice}>R{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Delivery</span>
                  <span className={styles.totalRowMuted}>Confirmed by seller</span>
                </div>
              </div>

              <div className={styles.grandTotal}>
                <span className={styles.grandTotalLabel}>Total (excl. delivery)</span>
                <span className={styles.grandTotalAmount}>R{subtotal.toFixed(2)}</span>
              </div>

              {error && (
                <div className={styles.error}>{error}</div>
              )}

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                <Lock size={15} />
                {loading ? 'Processing...' : 'Pay with PayFast'}
              </button>

              <p className={styles.payNote}>
                You will be redirected to PayFast to complete payment securely.
              </p>

              <div className={styles.securityBadge}>
                {securityItems.map(({ Icon, text }) => (
                  <div key={text} className={styles.securityItem}>
                    <Icon size={12} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
