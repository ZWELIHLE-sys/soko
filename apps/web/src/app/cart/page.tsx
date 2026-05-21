'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart, MapPin, X, Lock,
  Handshake, BadgeCheck, Truck, ArrowLeft, ArrowRight
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import styles from './cart.module.css'

interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  sellerName: string
  locationName: string
  categoryIcon: string | null
  quantity: number
  sellerId: string
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cart, setCart]       = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('soko_cart') || '[]')
  })
  const [loading, setLoading] = useState(false)

  const updateCart = (updated: CartItem[]) => {
    setCart(updated)
    localStorage.setItem('soko_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('soko_cart_updated'))
  }

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) return
    updateCart(cart.map(item =>
      item.productId === productId ? { ...item, quantity: qty } : item
    ))
  }

  const removeItem = (productId: string) => {
    updateCart(cart.filter(item => item.productId !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const delivery = subtotal > 0 ? 89 : 0
  const total    = subtotal + delivery

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)

  const handleCheckout = () => {
    if (!session) { router.push('/login?redirect=/cart'); return }
    setLoading(true)
    router.push('/checkout')
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.inner}>
        <h1 className={styles.heading}>
          <ShoppingCart size={24} />
          My Cart
        </h1>
        <p className={styles.subheading}>
          {cart.length === 0
            ? 'Your cart is empty'
            : `${totalItems} item${totalItems !== 1 ? 's' : ''} from African creators`}
        </p>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingCart size={64} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyText}>
              Discover handmade African products and support local creators.
            </p>
            <Link href="/shop" className={styles.browseBtn}>
              Browse African Products
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>

            {/* Items */}
            <div>
              <div className={styles.clearRow}>
                <button className={styles.clearBtn} onClick={() => updateCart([])}>
                  <X size={13} /> Clear cart
                </button>
              </div>

              <div className={styles.itemList}>
                {cart.map(item => (
                  <div key={item.productId} className={styles.item}>
                    <div className={styles.itemThumb}>
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className={styles.itemThumbImg}
                          sizes="88px"
                        />
                      ) : item.categoryIcon}
                    </div>

                    <div className={styles.itemInfo}>
                      <Link href={`/product/${item.productId}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      <div className={styles.itemMeta}>
                        by {item.sellerName}
                        <span>·</span>
                        <MapPin size={10} />
                        {item.locationName}
                      </div>
                      <div className={styles.qtyRow}>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                        <button className={styles.removeBtn} onClick={() => removeItem(item.productId)}>
                          <X size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className={styles.itemPrice}>
                      R{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/shop" className={styles.continueLink}>
                <ArrowLeft size={13} /> Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.summaryLines}>
                {cart.map(item => (
                  <div key={item.productId} className={styles.summaryLine}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.summaryDivider}>
                <div className={styles.summarySubLine}>
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summarySubLine}>
                  <span>Estimated delivery</span>
                  <span>R{delivery.toFixed(2)}</span>
                </div>
                <p className={styles.summaryNote}>
                  Final delivery cost calculated at checkout based on your location.
                </p>
              </div>

              <div className={styles.summaryTotal}>
                <span className={styles.summaryTotalLabel}>Total</span>
                <span className={styles.summaryTotalAmount}>R{total.toFixed(2)}</span>
              </div>

              <button className={styles.checkoutBtn} onClick={handleCheckout} disabled={loading}>
                {session ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                <ArrowRight size={16} />
              </button>

              <div className={styles.secureNote}>
                <Lock size={12} /> Secure checkout via PayFast
              </div>

              <div className={styles.promise}>
                <div className={styles.promiseItem}><Handshake size={12} /> Every item handmade by Africans</div>
                <div className={styles.promiseItem}><BadgeCheck size={12} /> All sellers Soko verified</div>
                <div className={styles.promiseItem}><Truck size={12} /> Delivered across South Africa</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
