'use client'

import Image from 'next/image'
import { X, UploadCloud, AlertTriangle } from 'lucide-react'
import type { Category, ProductFormData } from '../_types'
import styles from '../products.module.css'

interface Props {
  view: 'add' | 'edit'
  form: ProductFormData
  categories: Category[]
  uploading: boolean
  saving: boolean
  error: string
  onFormChange: (updates: Partial<ProductFormData>) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (idx: number) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ProductForm({ view, form, categories, uploading, saving, error, onFormChange, onImageUpload, onRemoveImage, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className={styles.formCard}>
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
            onChange={e => onFormChange({ name: e.target.value })}
            placeholder="e.g. Handwoven Zulu Basket"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.input}
            required
            value={form.categoryId}
            onChange={e => onFormChange({ categoryId: e.target.value })}
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
          onChange={e => onFormChange({ description: e.target.value })}
          placeholder="Tell buyers about your product â€” the materials, the process, the story."
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
            onChange={e => onFormChange({ price: e.target.value })}
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
            onChange={e => onFormChange({ stock: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Product Photos (max 5 Â· JPEG/PNG/WebP Â· 10 MB each)</label>
        <div className={styles.imageGrid}>
          {form.images.map((url, i) => (
            <div key={i} className={styles.imageThumb}>
              <Image src={url} alt={`Product ${i + 1}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
              <button type="button" className={styles.removeImg} onClick={() => onRemoveImage(i)}>
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
                onChange={onImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      <div className={styles.sectionDivider}>
        <span className={styles.sectionDividerLabel}>Bulk Pricing (Optional)</span>
      </div>
      <p className={styles.sectionHint}>
        Set a discounted price for buyers who order in large quantities â€” useful for agricultural products, fabric, beads, etc.
      </p>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label}>Minimum bulk quantity</label>
          <input
            className={styles.input}
            type="number"
            min="2"
            value={form.bulkMinQty}
            onChange={e => onFormChange({ bulkMinQty: e.target.value })}
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
            onChange={e => onFormChange({ bulkPrice: e.target.value })}
            placeholder="e.g. 280.00"
          />
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={saving || uploading}>
        {saving ? 'Saving...' : view === 'edit' ? 'Save Changes' : 'List Product'}
      </button>
    </form>
  )
}
