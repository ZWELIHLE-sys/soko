'use client'

import styles from '../seller.module.css'
import type { Location, SellerFormState } from '../_types'

interface Props {
  provinces: Location[]
  districts: Location[]
  cities: Location[]
  provinceId: string
  districtId: string
  locationId: string
  suburb: string
  onChange: (field: keyof SellerFormState, value: string) => void
}

export function LocationFields({ provinces, districts, cities, provinceId, districtId, locationId, suburb, onChange }: Props) {
  return (
    <>
      <div className={styles.sectionLabel}>Your Location · South Africa</div>

      <div className={styles.field}>
        <label className={styles.label}>Province</label>
        <select className={styles.select} required value={provinceId}
          onChange={e => onChange('provinceId', e.target.value)}>
          <option value="">Select province</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {districts.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>District</label>
          <select className={styles.select} required value={districtId}
            onChange={e => onChange('districtId', e.target.value)}>
            <option value="">Select district</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      )}

      {cities.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>City / Town</label>
          <select className={styles.select} required value={locationId}
            onChange={e => onChange('locationId', e.target.value)}>
            <option value="">Select city</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {locationId && (
        <div className={styles.fieldLast}>
          <label className={styles.label}>
            Suburb / Area <span className={styles.labelOptional}>(optional)</span>
          </label>
          <input className={styles.input} type="text"
            placeholder="e.g. Umlazi D Section, Hillbrow, Madadeni..."
            value={suburb} onChange={e => onChange('suburb', e.target.value)} />
        </div>
      )}
    </>
  )
}
