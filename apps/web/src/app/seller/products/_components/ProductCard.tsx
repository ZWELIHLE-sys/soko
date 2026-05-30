'use client'

import Image from 'next/image'
import { Edit2, Trash2 } from 'lucide-react'
import type { Product, ProductStat } from '../_types'
import styles from '../products.module.css'

interface Props {
  product: Product
  stat: ProductStat | undefined
  deleting: boolean
  onEdit: () => void
  onDelete: () => void
}

export function ProductCard({ product, stat, deleting, onEdit, onDelete }: Props) {
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
