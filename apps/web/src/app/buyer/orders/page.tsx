'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Clock, CheckCircle2, Package, Truck,
  PackageCheck, XCircle, RotateCcw,
  MapPin, ArrowRight, Star, CheckCheck, Sprout,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PageLoader from '@/components/ui/PageLoader'
import styles from './orders.module.css'

interface Order {
  id: string
  status: string
  totalAmount: number
  deliveryTier: string
  trackingNumber: string | null
  createdAt: string
  paymentProofUrl: string | null
  paymentVerifiedAt: string | null
  seller: { brandName: string }
  items: {
    quantity: number
    price: number
    product: {
      id: string
      name: string
      images: string[]
      sellerId: string
      category: { icon: string }
    }
  }[]
}

interface StatusConfig {
  label: string
  Icon: LucideIcon
  badgeClass: string
}

const statusConfig: Record<string, StatusConfig> = {
  RESERVED:   { label: 'Reserved — pay at harvest', Icon: Sprout, badgeClass: styles.statusReserved },
  PENDING:    { label: 'Order Placed',  Icon: Clock,         badgeClass: styles.statusPending },
  CONFIRMED:  { label: 'Confirmed',     Icon: CheckCircle2,  badgeClass: styles.statusConfirmed },
  PACKED:     { label: 'Packed',        Icon: Package,       badgeClass: styles.statusPacked },
  IN_TRANSIT: { label: 'On The Way',    Icon: Truck,         badgeClass: styles.statusInTransit },
  DELIVERED:  { label: 'Delivered',     Icon: PackageCheck,  badgeClass: styles.statusDelivered },
  CANCELLED:  { label: 'Cancelled',     Icon: XCircle,       badgeClass: styles.statusCancelled },
  REFUNDED:   { label: 'Refunded',      Icon: RotateCcw,     badgeClass: styles.statusRefunded },
}

interface ReviewedSet { productId: string }

interface ReviewForm {
  orderId: string
  productId: string
  sellerId: string
  productName: string
  rating: number
  comment: string
}

export default function BuyerOrdersPage() {
  const [orders,       setOrders]       = useState<Order[]>([])
  const [reviewed,     setReviewed]     = useState<ReviewedSet[]>([])
  const [loading,      setLoading]      = useState(true)
  const [confirming,   setConfirming]   = useState<string | null>(null)
  const [reviewForm,   setReviewForm]   = useState<ReviewForm | null>(null)
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError,  setReviewError]  = useState('')

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/buyer/orders').then(r => r.json()),
      fetch('/api/buyer/reviews').then(r => r.json()),
    ]).then(([ords, revs]) => {
      setOrders(Array.isArray(ords) ? ords : [])
      setReviewed(Array.isArray(revs) ? revs : [])
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const confirmDelivery = async (orderId: string) => {
    setConfirming(orderId)
    await fetch('/api/buyer/orders/confirm', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    setConfirming(null)
    load()
  }

  const submitReview = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!reviewForm) return
    setReviewError('')
    setReviewSaving(true)
    const res = await fetch('/api/buyer/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: reviewForm.productId,
        sellerId:  reviewForm.sellerId,
        rating:    reviewForm.rating,
        comment:   reviewForm.comment,
      }),
    })
    const data = await res.json()
    setReviewSaving(false)
    if (!res.ok) { setReviewError(data.error ?? 'Failed to submit review.'); return }
    setReviewForm(null)
    load()
  }

  const hasReviewed = (productId: string) => reviewed.some(r => r.productId === productId)

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
        <p className={styles.subtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed on Vuna
        </p>
      </div>

      {/* Review modal */}
      {reviewForm && (
        <div className={styles.modalOverlay} onClick={() => setReviewForm(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Review: {reviewForm.productName}</h3>

            <div className={styles.starRow}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.starBtn} ${n <= reviewForm.rating ? styles.starActive : ''}`}
                  onClick={() => setReviewForm(f => f ? { ...f, rating: n } : f)}
                >
                  <Star size={24} fill={n <= reviewForm.rating ? '#D97706' : 'none'} />
                </button>
              ))}
            </div>

            <form onSubmit={submitReview}>
              <textarea
                className={styles.reviewTextarea}
                rows={4}
                placeholder="Share your experience with this product..."
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => f ? { ...f, comment: e.target.value } : f)}
              />
              {reviewError && (
                <div className={styles.reviewError}>{reviewError}</div>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setReviewForm(null)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitReviewBtn} disabled={reviewSaving}>
                  {reviewSaving ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <PageLoader text="Loading your orders..." />
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <Package size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptyText}>
            Discover and support local makers — your first order is waiting.
          </p>
          <Link href="/shop" className={styles.emptyBtn}>
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => {
            const status = statusConfig[order.status] ?? statusConfig.PENDING
            return (
              <div key={order.id} className={styles.orderCard}>

                <div className={styles.orderHead}>
                  <div>
                    <div className={styles.orderSeller}>Order from {order.seller.brandName}</div>
                    <div className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={`${styles.statusBadge} ${status.badgeClass}`}>
                      <status.Icon size={11} />
                      {status.label}
                    </span>
                    <span className={styles.orderAmount}>R{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.items}>
                  {order.items.map((item, i) => (
                    <div key={i} className={`${styles.item} ${i < order.items.length - 1 ? styles.itemBorder : ''}`}>
                      <div className={styles.itemThumb}>
                        {item.product.images.length > 0 ? (
                          <Image src={item.product.images[0]} alt={item.product.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
                        ) : item.product.category.icon}
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.product.name}</div>
                        <div className={styles.itemMeta}>Qty: {item.quantity} · R{item.price.toFixed(2)} each</div>
                      </div>
                      <div className={styles.itemRight}>
                        <div className={styles.itemPrice}>R{(item.price * item.quantity).toFixed(2)}</div>
                        {order.status === 'DELIVERED' && !hasReviewed(item.product.id) && (
                          <button
                            className={styles.reviewBtn}
                            onClick={() => setReviewForm({
                              orderId:     order.id,
                              productId:   item.product.id,
                              sellerId:    item.product.sellerId,
                              productName: item.product.name,
                              rating:      5,
                              comment:     '',
                            })}
                          >
                            <Star size={11} /> Review
                          </button>
                        )}
                        {order.status === 'DELIVERED' && hasReviewed(item.product.id) && (
                          <span className={styles.reviewedTag}><CheckCircle2 size={11} /> Reviewed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className={styles.tracking}>
                    <MapPin size={13} />
                    Tracking: <strong>{order.trackingNumber}</strong>
                  </div>
                )}

                <div className={styles.orderFooter}>
                  <span className={styles.deliveryInfo}>
                    <Truck size={12} />
                    {order.deliveryTier === 'SELLER_ARRANGED'
                      ? 'Arranged by seller'
                      : order.deliveryTier.replace(/_/g, ' ')}
                  </span>
                  {order.status === 'RESERVED' && (
                    <span className={styles.reservedNote}>
                      <Sprout size={12} /> You&apos;ll pay when the farmer marks the harvest ready
                    </span>
                  )}
                  {order.status === 'PENDING' && !order.paymentVerifiedAt && (
                    <Link href={`/buyer/orders/${order.id}/pay`} className={styles.payBtn}>
                      {order.paymentProofUrl
                        ? 'View Payment Status →'
                        : 'Pay Now (EFT) →'}
                    </Link>
                  )}
                  {order.status === 'IN_TRANSIT' && (
                    <button
                      className={styles.confirmBtn}
                      disabled={confirming === order.id}
                      onClick={() => confirmDelivery(order.id)}
                    >
                      <CheckCheck size={13} />
                      {confirming === order.id ? 'Confirming...' : 'Confirm Delivery'}
                    </button>
                  )}
                  {order.status !== 'IN_TRANSIT' && order.status !== 'PENDING' && (
                    <span className={styles.totalNote}>Total: R{order.totalAmount.toFixed(2)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
