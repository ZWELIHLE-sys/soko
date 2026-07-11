'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { PAYFAST_URL } from '@/lib/payfast'
import styles from './checkout.module.css'
import type { CartItem, Location, DeliveryFormState } from './_types'
import { DeliveryForm } from './_components/DeliveryForm'
import { OrderSummary } from './_components/OrderSummary'

function makePaymentRef() {
  return `vuna_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const EMPTY_FORM: DeliveryFormState = {
  firstName: '', lastName: '', phone: '',
  address: '', provinceId: '', districtId: '', cityId: '',
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const payformRef = useRef<HTMLFormElement>(null)

  const [cart, setCart]           = useState<CartItem[]>([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [provinces, setProvinces] = useState<Location[]>([])
  const [districts, setDistricts] = useState<Location[]>([])
  const [cities, setCities]       = useState<Location[]>([])
  const [payFastFields, setPayFastFields] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState<DeliveryFormState>(EMPTY_FORM)

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('vuna_cart') || '[]'))
    setCartLoaded(true)
  }, [])

  useEffect(() => {
    if (!cartLoaded) return
    if (!session) { router.push('/login?redirect=/checkout'); return }
    if (cart.length === 0) { router.push('/cart'); return }
    fetch('/api/locations/provinces').then(r => r.json()).then(setProvinces)
  }, [session, router, cart.length, cartLoaded])

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

  useEffect(() => {
    if (payFastFields && payformRef.current) payformRef.current.submit()
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

  const handlePlaceOrder = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    if (!form.cityId) { setError('Please select your city'); return }
    setLoading(true)

    const paymentRef = makePaymentRef()

    const orderRes = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        deliveryAddress: form.address,
        deliveryCityId:  form.cityId,
        deliveryTier:    'SELLER_ARRANGED',
        deliveryFee:     0,
        paymentRef,
      }),
    })

    const orderData = await orderRes.json()
    setLoading(false)
    if (!orderRes.ok) { setError(orderData.error); return }

    // Clear cart and send buyer to the manual EFT payment page for their first order.
    // For multi-seller carts they'll see a different order to pay for each via /buyer/orders.
    localStorage.removeItem('vuna_cart')
    window.dispatchEvent(new Event('vuna_cart_updated'))

    const firstOrderId = orderData.orders?.[0]?.id
    if (firstOrderId) {
      router.push(`/buyer/orders/${firstOrderId}/pay`)
    } else {
      router.push('/buyer/orders')
    }
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
            <div className={styles.left}>
              <DeliveryForm
                form={form}
                provinces={provinces}
                districts={districts}
                cities={cities}
                onProvinceChange={handleProvinceChange}
                onDistrictChange={handleDistrictChange}
                onFieldChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
              />
            </div>
            <OrderSummary cart={cart} subtotal={subtotal} loading={loading} error={error} />
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
