'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import styles from './wishlist.module.css'

interface WishlistItem {
  id: string
  productId: string
  createdAt: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    status: string
    seller: { brandName: string }
    category: { name: string }
  }
}

export default function BuyerWishlistPage() {
  const [items,   setItems]   = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = () => {
    fetch('/api/buyer/wishlist')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const remove = async (productId: string) => {
    setRemoving(productId)
    await fetch('/api/buyer/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    setRemoving(null)
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Wishlist</h1>
        <p className={styles.subtitle}>
          {items.length} saved item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading your wishlist...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <Heart size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
          <p className={styles.emptyText}>
            Save products you love while you browse — find them here when you&apos;re ready to buy.
          </p>
          <Link href="/shop" className={styles.emptyBtn}>
            <ShoppingBag size={14} />
            Browse Shop
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map(({ id, productId, product }) => (
            <div key={id} className={styles.card}>
              <div className={styles.cardImg}>
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="260px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.imgFallback} />
                )}
                {product.status !== 'ACTIVE' && (
                  <div className={styles.soldOverlay}>Unavailable</div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardCategory}>{product.category.name}</div>
                <div className={styles.cardName}>{product.name}</div>
                <div className={styles.cardSeller}>by {product.seller.brandName}</div>
                <div className={styles.cardPrice}>R{product.price.toFixed(2)}</div>

                <div className={styles.cardActions}>
                  <Link
                    href={`/shop/product/${productId}`}
                    className={`${styles.viewBtn} ${product.status !== 'ACTIVE' ? styles.viewBtnDisabled : ''}`}
                  >
                    View Product
                  </Link>
                  <button
                    className={styles.removeBtn}
                    disabled={removing === productId}
                    onClick={() => remove(productId)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
