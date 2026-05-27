'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Plus, Package, Edit2, Trash2, X, UploadCloud, AlertTriangle,
} from 'lucide-react'
import styles from './products.module.css'

interface Category { id: string; name: string; icon: string | null }

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  status: string
  images: string[]
  categoryId: string
  category: { name: string }
  bulkMinQty: number | null
  bulkPrice: number | null
}

interface ProductStat {
  orderCount: number
  revenue: number
}

const EMPTY_FORM = { name: '', description: '', price: '', stock: '1', categoryId: '', images: [] as string[], bulkMinQty: '', bulkPrice: '' }

export default function SellerProductsPage() {
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats]           = useState<Record<string, ProductStat>>({})
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState<'list' | 'add' | 'edit'>('list')
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [deleting, setDeleting]     = useState<string | null>(null)

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/seller/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/seller/products/stats').then(r => r.json()),
    ]).then(([prods, cats, st]) => {
      setProducts(Array.isArray(prods) ? prods : [])
      setCategories(cats)
      setStats(st && typeof st === 'object' ? st : {})
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (form.images.length + files.length > 5) {
      setError('Maximum 5 images per product.')
      return
    }
    setUploading(true)
    const urls: string[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'vuna/products')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
      else setError(data.error ?? 'Upload failed')
    }
    setForm(f => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
  }

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const openEdit = (p: Product) => {
    setForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock), categoryId: p.categoryId, images: p.images, bulkMinQty: p.bulkMinQty != null ? String(p.bulkMinQty) : '', bulkPrice: p.bulkPrice != null ? String(p.bulkPrice) : '' })
    setEditingId(p.id)
    setError('')
    setView('edit')
  }

  const closeForm = () => { setView('list'); setEditingId(null); setForm(EMPTY_FORM); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.categoryId) { setError('Please select a category.'); return }
    if (form.images.length === 0) { setError('Add at least one product photo.'); return }
    setSaving(true)
    const res = editingId
      ? await fetch(`/api/seller/products/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      : await fetch('/api/seller/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to save product.'); return }
    closeForm()
    load()
  }

  const deleteProduct = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/seller/products/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  if (loading) return <div className={styles.loading}>Loading products...</div>

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Products</h1>
          <p className={styles.subtitle}>{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
        </div>
        {view === 'list' ? (
          <button className={styles.addBtn} onClick={() => { setError(''); setEditingId(null); setForm(EMPTY_FORM); setView('add') }}>
            <Plus size={14} /> Add Product
          </button>
        ) : (
          <button className={styles.cancelTopBtn} onClick={closeForm}>
            <X size={14} /> Cancel
          </button>
        )}
      </div>

      {(view === 'add' || view === 'edit') && (
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <div className={styles.formTitle}>{view === 'edit' ? 'Edit Product' : 'New Product'}</div>

          {error && (
            <div className={styles.formError}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Product Name</label>
              <input
                className={styles.input}
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Handwoven Zulu Basket"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.input}
                required
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              required
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tell buyers about your product — the materials, the process, the story."
            />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Price (ZAR)</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                step="0.01"
                required
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 350.00"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Stock Quantity</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                required
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Product Photos (max 5 · JPEG/PNG/WebP · 10 MB each)</label>
            <div className={styles.imageGrid}>
              {form.images.map((url, i) => (
                <div key={i} className={styles.imageThumb}>
                  <Image src={url} alt={`Product ${i + 1}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                  <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              {form.images.length < 5 && (
                <label className={styles.uploadBox}>
                  <UploadCloud size={20} />
                  <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className={styles.sectionDivider}>
            <span className={styles.sectionDividerLabel}>Bulk Pricing (Optional)</span>
          </div>
          <p className={styles.sectionHint}>Set a discounted price for buyers who order in large quantities — useful for agricultural products, fabric, beads, etc.</p>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Minimum bulk quantity</label>
              <input
                className={styles.input}
                type="number"
                min="2"
                value={form.bulkMinQty}
                onChange={e => setForm(f => ({ ...f, bulkMinQty: e.target.value }))}
                placeholder="e.g. 10"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bulk price per unit (ZAR)</label>
              <input
                className={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                value={form.bulkPrice}
                onChange={e => setForm(f => ({ ...f, bulkPrice: e.target.value }))}
                placeholder="e.g. 280.00"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={saving || uploading}>
            {saving ? 'Saving...' : view === 'edit' ? 'Save Changes' : 'List Product'}
          </button>
        </form>
      )}

      {view === 'list' && (
        <>
          {products.length === 0 ? (
            <div className={styles.empty}>
              <Package size={44} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No products yet</h2>
              <p className={styles.emptyText}>
                Add your first product to start selling on Vuna.
                Once your account is verified, your listings go live immediately.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map(p => (
                <div key={p.id} className={styles.productCard}>
                  <div className={styles.productImg}>
                    {p.images[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill sizes="240px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.productImgFallback} />
                    )}
                  </div>
                  <div className={styles.productBody}>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.productMeta}>{p.category.name} · Stock: {p.stock}</div>
                    <div className={styles.productPrice}>R{p.price.toFixed(2)}</div>
                    {stats[p.id] ? (
                      <div className={styles.productStats}>
                        <span className={styles.productStatOrders}>
                          {stats[p.id].orderCount} order{stats[p.id].orderCount !== 1 ? 's' : ''}
                        </span>
                        {stats[p.id].revenue > 0 && (
                          <span className={styles.productStatRevenue}>
                            R{stats[p.id].revenue.toFixed(0)} earned
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className={styles.productStatsEmpty}>No orders yet</div>
                    )}
                    <div className={styles.productActions}>
                      <span className={`${styles.statusChip} ${p.status === 'ACTIVE' ? styles.chipActive : styles.chipDraft}`}>
                        {p.status}
                      </span>
                      <button
                        className={styles.editBtn}
                        type="button"
                        onClick={() => openEdit(p)}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        disabled={deleting === p.id}
                        onClick={() => deleteProduct(p.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
