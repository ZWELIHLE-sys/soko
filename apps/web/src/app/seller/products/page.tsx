'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Package, X } from 'lucide-react'
import PageLoader from '@/components/ui/PageLoader'
import styles from './products.module.css'
import { ProductForm } from './_components/ProductForm'
import { ProductCard } from './_components/ProductCard'
import type { Category, Product, ProductStat, ProductFormData } from './_types'
import { EMPTY_FORM } from './_types'

export default function SellerProductsPage() {
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats]           = useState<Record<string, ProductStat>>({})
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState<'list' | 'add' | 'edit'>('list')
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState<ProductFormData>(EMPTY_FORM)
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [harvesting, setHarvesting] = useState<string | null>(null)

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
    if (form.images.length + files.length > 5) { setError('Maximum 5 images per product.'); return }
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

  const openEdit = (p: Product) => {
    const ls = p.livestockDetail
    setForm({
      name: p.name, description: p.description, price: String(p.price), stock: String(p.stock),
      categoryId: p.categoryId, images: p.images,
      bulkMinQty: p.bulkMinQty != null ? String(p.bulkMinQty) : '',
      bulkPrice: p.bulkPrice != null ? String(p.bulkPrice) : '',
      isHarvestPreOrder: p.isHarvestPreOrder ?? false,
      plantedAt: p.plantedAt ? p.plantedAt.slice(0, 10) : '',
      expectedHarvestDate: p.expectedHarvestDate ? p.expectedHarvestDate.slice(0, 10) : '',
      estimatedYield: p.estimatedYield != null ? String(p.estimatedYield) : '',
      yieldUnit: p.yieldUnit ?? '',
      lsSpecies: ls?.species ?? '',
      lsBreed: ls?.breed ?? '',
      lsPurpose: ls?.purpose ?? '',
      lsSex: ls?.sex ?? '',
      lsAgeMonths: ls?.approxAgeMonths != null ? String(ls.approxAgeMonths) : '',
      lsWeightKg: ls?.weightKg != null ? String(ls.weightKg) : '',
      lsColour: ls?.colour ?? '',
      lsBrandMark: ls?.brandMark ?? '',
      lsVaccinations: ls?.vaccinations ?? '',
      lsDipRecords: ls?.dipRecords ?? '',
      lsBreedingHistory: ls?.breedingHistory ?? '',
    })
    setEditingId(p.id)
    setError('')
    setView('edit')
  }

  const closeForm = () => { setView('list'); setEditingId(null); setForm(EMPTY_FORM); setError('') }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    if (!form.categoryId) { setError('Please select a category.'); return }
    if (form.images.length === 0) { setError('Add at least one product photo.'); return }
    setSaving(true)
    const res = editingId
      ? await fetch(`/api/seller/products/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : await fetch('/api/seller/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
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

  const resolveHarvest = async (id: string, action: 'ready' | 'failed') => {
    const confirmMsg = action === 'ready'
      ? 'Mark this harvest as READY? Every buyer with a reservation will be asked to pay now.'
      : 'Mark this crop as FAILED? All reservations will be cancelled and buyers told they owe nothing. This cannot be undone.'
    if (!confirm(confirmMsg)) return
    setHarvesting(id)
    const res = await fetch(`/api/seller/products/${id}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json().catch(() => ({}))
    setHarvesting(null)
    if (!res.ok) { alert(data.error ?? 'Could not update the harvest.'); return }
    alert(action === 'ready'
      ? `Harvest marked ready. ${data.notified} buyer${data.notified !== 1 ? 's' : ''} notified to pay.`
      : `Crop marked failed. ${data.notified} reservation${data.notified !== 1 ? 's' : ''} cancelled — nobody pays.`)
    load()
  }

  if (loading) return <PageLoader text="Loading products..." />

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
        <ProductForm
          view={view}
          form={form}
          categories={categories}
          uploading={uploading}
          saving={saving}
          error={error}
          onFormChange={updates => setForm(f => ({ ...f, ...updates }))}
          onImageUpload={handleImageUpload}
          onRemoveImage={idx => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
          onSubmit={handleSubmit}
        />
      )}

      {view === 'list' && (
        products.length === 0 ? (
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
              <ProductCard
                key={p.id}
                product={p}
                stat={stats[p.id]}
                deleting={deleting === p.id}
                harvesting={harvesting === p.id}
                onEdit={() => openEdit(p)}
                onDelete={() => deleteProduct(p.id)}
                onHarvest={action => resolveHarvest(p.id, action)}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
