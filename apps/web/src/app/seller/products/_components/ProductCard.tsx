'use client'

import Image from 'next/image'
import { Edit2, Trash2, Sprout, CheckCircle2, XCircle } from 'lucide-react'
import type { Product, ProductStat } from '../_types'
import styles from '../products.module.css'

interface Props {
  product: Product
  stat: ProductStat | undefined
  deleting: boolean
  harvesting: boolean
  onEdit: () => void
  onDelete: () => void
  onHarvest: (action: 'ready' | 'failed') => void
}

const HARVEST_CHIP: Record<string, { label: string; className: string }> = {
  GROWING:       { label: 'Growing',       className: 'chipGrowing' },
  HARVEST_READY: { label: 'Harvest Ready', className: 'chipReady' },
  FULFILLED:     { label: 'Fulfilled',     className: 'chipReady' },
  FAILED:        { label: 'Crop Failed',   className: 'chipFailed' },
}

export function ProductCard({ product, stat, deleting, harvesting, onEdit, onDelete, onHarvest }: Props) {
  const reservedQty = (product.orderItems ?? []).reduce((sum, i) => sum + i.quantity, 0)
  const harvestChip = product.isHarvestPreOrder && product.harvestStatus
    ? HARVEST_CHIP[product.harvestStatus]
    : null

  return (
    <div className={styles.productCard}>
      <div className={styles.productImg}>
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill sizes="240px" style={{ objectFit: 'cover' }} />
        ) : (
          <div className={styles.productImgFallback} />
        )}
      </div>
      <div className={styles.productBody}>
        <div className={styles.productName}>{product.name}</div>
        <div className={styles.productMeta}>{product.category.name} · Stock: {product.stock}</div>
        <div className={styles.productPrice}>R{product.price.toFixed(2)}</div>
        {stat ? (
          <div className={styles.productStats}>
            <span className={styles.productStatOrders}>
              {stat.orderCount} order{stat.orderCount !== 1 ? 's' : ''}
            </span>
            {stat.revenue > 0 && (
              <span className={styles.productStatRevenue}>R{stat.revenue.toFixed(0)} earned</span>
            )}
          </div>
        ) : (
          <div className={styles.productStatsEmpty}>No orders yet</div>
        )}

        {/* Harvest pre-order state + the farmer's moment of truth */}
        {product.isHarvestPreOrder && (
          <div className={styles.harvestBlock}>
            <div className={styles.harvestChipRow}>
              {harvestChip && (
                <span className={`${styles.harvestChip} ${styles[harvestChip.className]}`}>
                  <Sprout size={11} /> {harvestChip.label}
                </span>
              )}
              {product.harvestStatus === 'GROWING' && (
                <span className={styles.harvestReservedNote}>
                  {reservedQty > 0
                    ? `${reservedQty} of ${product.estimatedYield ?? '?'} ${product.yieldUnit ?? ''} reserved`
                    : 'No reservations yet'}
                </span>
              )}
            </div>
            {product.harvestStatus === 'GROWING' && (
              <div className={styles.harvestActions}>
                <button
                  type="button"
                  className={styles.harvestReadyBtn}
                  disabled={harvesting}
                  onClick={() => onHarvest('ready')}
                >
                  <CheckCircle2 size={12} /> Harvest Ready
                </button>
                <button
                  type="button"
                  className={styles.harvestFailBtn}
                  disabled={harvesting}
                  onClick={() => onHarvest('failed')}
                >
                  <XCircle size={12} /> Crop Failed
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.productActions}>
          <span className={`${styles.statusChip} ${product.status === 'ACTIVE' ? styles.chipActive : styles.chipDraft}`}>
            {product.status}
          </span>
          <button className={styles.editBtn} type="button" onClick={onEdit}>
            <Edit2 size={13} />
          </button>
          <button className={styles.deleteBtn} disabled={deleting} onClick={onDelete}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
