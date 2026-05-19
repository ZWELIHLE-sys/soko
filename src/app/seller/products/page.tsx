'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Plus, MapPin } from 'lucide-react'
import styles from './products.module.css'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  status: 'ACTIVE' | 'DRAFT' | 'SOLD_OUT' | 'SUSPENDED'
  images: string[]
  category: { name: string; icon: string | null }
  location: { name: string }
  createdAt: string
}

const statusClass: Record<Product['status'], string> = {
  ACTIVE: styles.badgeActive,
  DRAFT: styles.badgeDraft,
  SOLD_OUT: styles.badgeSoldOut,
  SUSPENDED: styles.badgeDraft,
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seller/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>My Products</h1>
          <p className={styles.subheading}>
            {products.length} product{products.length !== 1 ? 's' : ''} listed
          </p>
        </div>
        <Link href="/seller/products/new" className={styles.addBtn}>
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading your products...</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <Package size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No products yet</h2>
          <p className={styles.emptyText}>
            List your first African made product and start selling to the world.
          </p>
          <Link href="/seller/products/new" className={styles.emptyBtn}>
            <Plus size={15} />
            List Your First Product
          </Link>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div>Photo</div>
            <div>Product</div>
            <div>Category</div>
            <div>Price</div>
            <div>Status</div>
            <div>Stock</div>
          </div>

          {products.map(product => (
            <div key={product.id} className={styles.tableRow}>
              <div className={styles.thumb}>
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={52}
                    height={52}
                    className={styles.thumbImg}
                  />
                ) : (
                  <Package size={22} />
                )}
              </div>

              <div>
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productLocation}>
                  <MapPin size={10} />
                  {product.location.name}
                </div>
              </div>

              <div className={styles.category}>
                {product.category.icon} {product.category.name}
              </div>

              <div className={styles.price}>R{product.price.toFixed(2)}</div>

              <div>
                <span className={`${styles.badge} ${statusClass[product.status]}`}>
                  {product.status}
                </span>
              </div>

              <div className={styles.stock}>{product.stock} left</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
