'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Clock, CheckCircle2, Package, Truck,
  PackageCheck, XCircle, RotateCcw,
  MapPin, ArrowRight
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './orders.module.css'

interface Order {
  id: string
  status: string
  totalAmount: number
  deliveryTier: string
  trackingNumber: string | null
  createdAt: string
  seller: { brandName: string }
  items: {
    quantity: number
    price: number
    product: {
      name: string
      images: string[]
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
  PENDING:    { label: 'Order Placed',  Icon: Clock,         badgeClass: styles.statusPending },
  CONFIRMED:  { label: 'Confirmed',     Icon: CheckCircle2,  badgeClass: styles.statusConfirmed },
  PACKED:     { label: 'Packed',        Icon: Package,       badgeClass: styles.statusPacked },
  IN_TRANSIT: { label: 'On The Way',    Icon: Truck,         badgeClass: styles.statusInTransit },
  DELIVERED:  { label: 'Delivered',     Icon: PackageCheck,  badgeClass: styles.statusDelivered },
  CANCELLED:  { label: 'Cancelled',     Icon: XCircle,       badgeClass: styles.statusCancelled },
  REFUNDED:   { label: 'Refunded',      Icon: RotateCcw,     badgeClass: styles.statusRefunded },
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/buyer/orders')
      .then(r => r.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
        <p className={styles.subtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed on Vuna
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <Package size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptyText}>
            Discover and support African creators — your first order is waiting.
          </p>
          <Link href="/shop" className={styles.emptyBtn}>
            Start Shopping
            <ArrowRight size={14} />
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
                    <div className={styles.orderSeller}>
                      Order from {order.seller.brandName}
                    </div>
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
                    <span className={styles.orderAmount}>
                      R{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className={styles.items}>
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className={`${styles.item} ${i < order.items.length - 1 ? styles.itemBorder : ''}`}
                    >
                      <div className={styles.itemThumb}>
                        {item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            sizes="52px"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : item.product.category.icon}
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.product.name}</div>
                        <div className={styles.itemMeta}>
                          Qty: {item.quantity} · R{item.price.toFixed(2)} each
                        </div>
                      </div>
                      <div className={styles.itemPrice}>
                        R{(item.price * item.quantity).toFixed(2)}
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
                    {order.deliveryTier.replace(/_/g, ' ')}
                  </span>
                  <span>Total: R{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
