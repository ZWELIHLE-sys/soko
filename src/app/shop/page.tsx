'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingBag, MapPin, BadgeCheck, X, Globe } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import styles from './shop.module.css'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  seller: { brandName: string; isVerified: boolean }
  category: { name: string; icon: string | null; slug: string }
  location: { name: string }
}

interface Category { id: string; name: string; icon: string | null; slug: string }
interface Province { id: string; name: string }

export default function ShopPage() {
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces]   = useState<Province[]>([])
  const [total, setTotal]           = useState(0)
  const [pages, setPages]           = useState(1)
  const [loading, setLoading]       = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({
    search: '', category: '', province: '',
    minPrice: '', maxPrice: '', sort: 'newest', page: 1,
  })

  useEffect(() => {
    let cancelled = false

    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })

    fetch(`/api/products?${params}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (cancelled) return
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
        setLoading(false)
      })
      .catch(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [filters])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
    fetch('/api/locations/provinces').then(r => r.json()).then(setProvinces).catch(() => {})
  }, [])

  const updateFilter = (key: string, value: string) => {
    setLoading(true)
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const commitSearch = () => {
    setLoading(true)
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }))
  }

  const hasActiveFilters = filters.category || filters.province || filters.minPrice || filters.maxPrice || filters.search

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            <Globe size={28} />
            Shop African Made
          </h1>
          <p className={styles.heroSub}>
            {total} verified African products — handmade, authentic, real.
          </p>

          <div className={styles.searchRow}>
            <input
              type="text"
              placeholder="Search products, sellers, categories..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
              className={styles.searchInput}
            />
            <button onClick={commitSearch} className={styles.searchBtn}>
              <Search size={15} />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>

        {/* Sidebar filters */}
        <aside className={styles.sidebar}>

          <div className={styles.filterCard}>
            <div className={styles.filterLabel}>Categories</div>

            <button
              className={`${styles.catItem} ${!filters.category ? styles.catItemActive : ''}`}
              onClick={() => updateFilter('category', '')}
            >
              <ShoppingBag size={13} />
              All Products
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.catItem} ${filters.category === cat.slug ? styles.catItemActive : ''}`}
                onClick={() => updateFilter('category', cat.slug)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterLabel}>Province</div>
            <select
              className={styles.filterSelect}
              value={filters.province}
              onChange={e => updateFilter('province', e.target.value)}
            >
              <option value="">All provinces</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterLabel}>Price Range</div>
            <div className={styles.priceRow}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                className={styles.priceInput}
              />
              <span className={styles.priceSep}>—</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                className={styles.priceInput}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setSearchInput('')
                setLoading(true)
                setFilters({ search: '', category: '', province: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 })
              }}
            >
              <X size={13} />
              Clear Filters
            </button>
          )}
        </aside>

        {/* Products main */}
        <div className={styles.main}>

          <div className={styles.sortBar}>
            <span className={styles.sortCount}>
              {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
            </span>
            <select
              className={styles.sortSelect}
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {loading ? (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <Search size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No products found</h2>
              <p className={styles.emptyText}>Try changing your filters or search term.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map(product => (
                <Link key={product.id} href={`/product/${product.id}`} className={styles.cardLink}>
                  <div className={styles.card}>
                    <div className={styles.cardImage}>
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className={styles.cardImg}
                          sizes="(max-width: 768px) 50vw, 200px"
                        />
                      ) : (
                        product.category.icon
                      )}
                      {product.seller.isVerified && (
                        <span className={styles.verifiedBadge}>
                          <BadgeCheck size={10} />
                          Soko
                        </span>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardName}>{product.name}</div>
                      <div className={styles.cardSeller}>by {product.seller.brandName}</div>
                      <div className={styles.cardFooter}>
                        <span className={styles.cardPrice}>R{product.price.toFixed(2)}</span>
                        <span className={styles.cardLocation}>
                          <MapPin size={10} />
                          {product.location.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${filters.page === i + 1 ? styles.pageBtnActive : ''}`}
                  onClick={() => { setLoading(true); setFilters(prev => ({ ...prev, page: i + 1 })) }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
