'use client'

import Image from 'next/image'
import { X, UploadCloud, AlertTriangle, PawPrint, Sprout } from 'lucide-react'
import type { Category, ProductFormData } from '../_types'
import {
  SPECIES, BREED_SUGGESTIONS, PURPOSES, SPECIES_PURPOSES, SEXES, YIELD_UNITS,
  type Species,
} from '@/lib/livestock'
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
  onSubmit: (e: React.SyntheticEvent) => void
}

export function ProductForm({ view, form, categories, uploading, saving, error, onFormChange, onImageUpload, onRemoveImage, onSubmit }: Props) {
  const selectedCategory = categories.find(c => c.id === form.categoryId)
  const isLivestock = selectedCategory?.slug === 'livestock'
  const isProduce   = selectedCategory?.slug === 'produce'

  // Purpose options follow the chosen species — no wool pigs
  const purposeOptions = form.lsSpecies
    ? PURPOSES.filter(p => SPECIES_PURPOSES[form.lsSpecies as Species]?.includes(p.value))
    : PURPOSES

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

      {/* ── Livestock details — live animals only ── */}
      {isLivestock && (
        <>
          <div className={styles.sectionDivider}>
            <span className={styles.sectionDividerLabel}><PawPrint size={12} /> Animal Details</span>
          </div>
          <p className={styles.sectionHint}>
            Real buyers ask real questions — breed, purpose and records sell the animal.
            Species, breed and purpose are required.
          </p>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Species</label>
              <select
                className={styles.input}
                required
                value={form.lsSpecies}
                onChange={e => onFormChange({ lsSpecies: e.target.value, lsPurpose: '', lsBreed: '' })}
              >
                <option value="">Select species</option>
                {SPECIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Breed</label>
              <input
                className={styles.input}
                required
                list="breed-suggestions"
                value={form.lsBreed}
                onChange={e => onFormChange({ lsBreed: e.target.value })}
                placeholder={form.lsSpecies === 'POULTRY' ? 'e.g. Traditional chicken, Broiler (Lamuthuthu)' : 'e.g. Nguni, Dorper, Boer'}
              />
              <datalist id="breed-suggestions">
                {(form.lsSpecies ? BREED_SUGGESTIONS[form.lsSpecies as Species] ?? [] : []).map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Purpose</label>
              <select
                className={styles.input}
                required
                value={form.lsPurpose}
                onChange={e => onFormChange({ lsPurpose: e.target.value })}
              >
                <option value="">What is this animal for?</option>
                {purposeOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Sex (optional)</label>
              <select
                className={styles.input}
                value={form.lsSex}
                onChange={e => onFormChange({ lsSex: e.target.value })}
              >
                <option value="">Not specified</option>
                {SEXES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Approx. age (months, optional)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={form.lsAgeMonths}
                onChange={e => onFormChange({ lsAgeMonths: e.target.value })}
                placeholder="e.g. 18"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Weight (kg, optional)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.1"
                value={form.lsWeightKg}
                onChange={e => onFormChange({ lsWeightKg: e.target.value })}
                placeholder="e.g. 320"
              />
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Colour (optional)</label>
              <input
                className={styles.input}
                value={form.lsColour}
                onChange={e => onFormChange({ lsColour: e.target.value })}
                placeholder="e.g. Red and white"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Brand / tattoo mark (optional)</label>
              <input
                className={styles.input}
                value={form.lsBrandMark}
                onChange={e => onFormChange({ lsBrandMark: e.target.value })}
                placeholder="Registered mark (Animal Identification Act)"
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Vaccinations & dip records (optional)</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={2}
              value={form.lsVaccinations}
              onChange={e => onFormChange({ lsVaccinations: e.target.value })}
              placeholder={'e.g. Anthrax — March 2026\nDipped — June 2026'}
            />
          </div>
          {form.lsPurpose === 'BREEDING' && (
            <div className={styles.field}>
              <label className={styles.label}>Breeding history (optional)</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                rows={2}
                value={form.lsBreedingHistory}
                onChange={e => onFormChange({ lsBreedingHistory: e.target.value })}
                placeholder="Offspring, bloodline, performance notes"
              />
            </div>
          )}
        </>
      )}

      {/* ── Harvest pre-order — Farm Produce only ── */}
      {isProduce && (
        <>
          <div className={styles.sectionDivider}>
            <span className={styles.sectionDividerLabel}><Sprout size={12} /> Future Harvest (Pre-Orders)</span>
          </div>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={form.isHarvestPreOrder}
              onChange={e => onFormChange({ isHarvestPreOrder: e.target.checked })}
            />
            <span>
              This is a <strong>future harvest</strong> — buyers reserve now and only pay
              when I mark it harvest-ready
            </span>
          </label>
          {form.isHarvestPreOrder && (
            <>
              <p className={styles.sectionHint}>
                No money moves on a promise. Buyers reserve their share now; when your crop comes in,
                you mark it Harvest Ready and they pay the normal way. If the crop fails, reservations
                cancel cleanly — nobody is out of pocket.
              </p>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label className={styles.label}>Planted on (optional)</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.plantedAt}
                    onChange={e => onFormChange({ plantedAt: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Expected harvest date</label>
                  <input
                    className={styles.input}
                    type="date"
                    required
                    value={form.expectedHarvestDate}
                    onChange={e => onFormChange({ expectedHarvestDate: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label className={styles.label}>Estimated yield</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    required
                    value={form.estimatedYield}
                    onChange={e => onFormChange({ estimatedYield: e.target.value })}
                    placeholder="e.g. 200"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Unit</label>
                  <select
                    className={styles.input}
                    required
                    value={form.yieldUnit}
                    onChange={e => onFormChange({ yieldUnit: e.target.value })}
                  >
                    <option value="">Select unit</option>
                    {YIELD_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Product Photos (max 5 · JPEG/PNG/WebP · 10 MB each)</label>
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
        Set a discounted price for buyers who order in large quantities — useful for agricultural products, fabric, beads, etc.
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
