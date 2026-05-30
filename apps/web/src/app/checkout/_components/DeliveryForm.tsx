'use client'

import { Info } from 'lucide-react'
import type { DeliveryFormState, Location } from '../_types'
import styles from '../checkout.module.css'

interface Props {
  form: DeliveryFormState
  provinces: Location[]
  districts: Location[]
  cities: Location[]
  onProvinceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onFieldChange: (field: keyof DeliveryFormState, value: string) => void
}

export function DeliveryForm({ form, provinces, districts, cities, onProvinceChange, onDistrictChange, onFieldChange }: Props) {
  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardLabel}>Personal Details</div>
        <div className={styles.twoCol}>
          <div>
            <label className={styles.label}>First name</label>
            <input className={styles.input} required placeholder="First name"
              value={form.firstName} onChange={e => onFieldChange('firstName', e.target.value)} />
          </div>
          <div>
            <label className={styles.label}>Last name</label>
            <input className={styles.input} required placeholder="Last name"
              value={form.lastName} onChange={e => onFieldChange('lastName', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={styles.label}>Phone number</label>
          <input className={styles.input} required placeholder="e.g. 071 234 5678"
            value={form.phone} onChange={e => onFieldChange('phone', e.target.value)} />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Delivery Address</div>
        <div className={styles.fieldWrap}>
          <label className={styles.label}>Street address</label>
          <input className={styles.input} required
            placeholder="e.g. 12 Mandela Street, Umlazi"
            value={form.address} onChange={e => onFieldChange('address', e.target.value)} />
        </div>
        <div className={styles.twoCol}>
          <div>
            <label className={styles.label}>Province</label>
            <select className={styles.select} required value={form.provinceId} onChange={onProvinceChange}>
              <option value="">Select province</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={styles.label}>District</label>
            <select className={styles.select} required value={form.districtId}
              onChange={onDistrictChange} disabled={districts.length === 0}>
              <option value="">Select district</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={styles.label}>City / Town</label>
          <select className={styles.select} required value={form.cityId}
            onChange={e => onFieldChange('cityId', e.target.value)} disabled={cities.length === 0}>
            <option value="">Select city</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.deliveryNotice}>
        <Info size={16} className={styles.deliveryNoticeIcon} />
        <div>
          <div className={styles.deliveryNoticeTitle}>Delivery arranged by the seller</div>
          <div className={styles.deliveryNoticeText}>
            Once your order is confirmed, the seller will contact you directly
            to arrange delivery and confirm any associated cost. Your delivery
            address above will be shared with them.
          </div>
        </div>
      </div>
    </>
  )
}
