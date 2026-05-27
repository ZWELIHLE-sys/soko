'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Clock, CheckCircle2, Package, Truck,
  PackageCheck, XCircle, RotateCcw, Phone, Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './orders.module.css'

interface OrderItem {
  quantity: number
  price: number
  product: { name: string; images: string[] }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  deliveryTier: string
  deliveryAddress: string
  trackingNumber: string | null
  createdAt: string
  buyer: { name: string; email: string; phone: string | null }
  items: OrderItem[]
}

interface StatusConfig {
  label: string
  Icon: LucideIcon
  badgeClass: string
  next: { label: string; status: string } | null
}

const statusConfig: Record<string, StatusConfig> = {
  PENDING:    { label: 'New Order',     Icon: Clock,        badgeClass: styles.statusPending,    next: { label: 'Confirm Order',  status: 'CONFIRMED'  } },
  CONFIRMED:  { label: 'Confirmed',     Icon: CheckCircle2, badgeClass: styles.statusConfirmed,  next: { label: 'Mark as Packed', status: 'PACKED'     } },
  PACKED:     { label: 'Packed',        Icon: Package,      badgeClass: styles.statusPacked,     next: { label: 'Handed to Rider', status: 'IN_TRANSIT' } },
  IN_TRANSIT: { label: 'In Transit',    Icon: Truck,        badgeClass: styles.statusInTransit,  next: { label: 'Mark Delivered', status: 'DELIVERED'  } },
  DELIVERED:  { label: 'Delivered',     Icon: PackageCheck, badgeClass: styles.statusDelivered,  next: null },
  CANCELLED:  { label: 'Cancelled',     Icon: XCircle,      badgeClass: styles.statusCancelled,  next: null },
  REFUNDED:   { label: 'Refunded',      Icon: RotateCcw,    badgeClass: styles.statusRefunded,   next: null },
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const loadOrders = useCallback(() => {
    fetch('/api/seller/orders')
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false) })
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    await fetch(`/api/seller/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdating(null)
    loadOrders()
  }

  const pending  = orders.filter(o => o.status === 'PENDING')
  const active   = orders.filter(o => ['CONFIRMED', 'PACKED', 'IN_TRANSIT'].includes(o.status))
  const done     = orders.filter(o => ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status))

  const OrderCard = ({ order }: { order: Order }) => {
    const cfg = statusConfig[order.status] ?? statusConfig.PENDING
    const isOpen = expanded === order.id

    return (
      <div className={styles.orderCard}>
        <div className={styles.orderHead} onClick={() => setExpanded(isOpen ? null : order.id)}>
          <div className={styles.orderLeft}>
            <div className={styles.orderNum}>#{order.orderNumber.slice(-8).toUpperCase()}</div>
            <div className={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </div>
          </div>
          <div className={styles.orderRight}>
            <span className={`${styles.statusBadge} ${cfg.badgeClass}`}>
              <cfg.Icon size={11} /> {cfg.label}
            </span>
            <span className={styles.orderAmount}>R{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {isOpen && (
          <div className={styles.orderBody}>
            <div className={styles.buyerRow}>
              <div className={styles.buyerName}>{order.buyer.name}</div>
              <div className={styles.buyerContact}>
                {order.buyer.phone && (
                  <a href={`tel:${order.buyer.phone}`} className={styles.contactLink}>
                    <Phone size={12} /> {order.buyer.phone}
                  </a>
                )}
                <a href={`mailto:${order.buyer.email}`} className={styles.contactLink}>
                  <Mail size={12} /> {order.buyer.email}
                </a>
              </div>
            </div>

            <div className={styles.deliveryInfo}>
              <Truck size={13} />
              <span>{order.deliveryTier.replace(/_/g, ' ')} · {order.deliveryAddress}</span>
            </div>

            <div className={styles.items}>
              {order.items.map((item, i) => (
                <div key={i} className={styles.item}>
                  <div className={styles.itemThumb}>
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="44px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.itemThumbFallback} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.product.name}</div>
                    <div className={styles.itemMeta}>Qty: {item.quantity} · R{item.price.toFixed(2)} each</div>
                  </div>
                  <div className={styles.itemTotal}>R{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {cfg.next && (
              <div className={styles.actionRow}>
                <button
                  className={styles.nextBtn}
                  disabled={updating === order.id}
                  onClick={() => updateStatus(order.id, cfg.next!.status)}
                >
                  {updating === order.id ? 'Updating...' : cfg.next.label}
                </button>
                {['PENDING', 'CONFIRMED'].includes(order.status) && (
                  <button
                    className={styles.cancelBtn}
                    disabled={updating === order.id}
                    onClick={() => updateStatus(order.id, 'CANCELLED')}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) return <div className={styles.loading}>Loading orders...</div>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders</h1>
        <p className={styles.subtitle}>{orders.length} total · {pending.length} need attention</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <Package size={44} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptyText}>
            When buyers purchase your products, their orders will appear here.
            Make sure your products are listed and verified.
          </p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>Needs Attention ({pending.length})</div>
              {pending.map(o => <OrderCard key={o.id} order={o} />)}
            </section>
          )}
          {active.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>In Progress ({active.length})</div>
              {active.map(o => <OrderCard key={o.id} order={o} />)}
            </section>
          )}
          {done.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>Completed ({done.length})</div>
              {done.map(o => <OrderCard key={o.id} order={o} />)}
            </section>
          )}
        </>
      )}
    </div>
  )
}
