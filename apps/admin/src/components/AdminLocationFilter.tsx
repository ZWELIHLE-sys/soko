'use client'

import { useState, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'
import styles from './AdminLocationFilter.module.css'

interface Location { id: string; name: string }

interface Props {
  value:    string
  onChange: (locationId: string) => void
}

export function AdminLocationFilter({ value, onChange }: Props) {
  const [provinces, setProvinces]   = useState<Location[]>([])
  const [districts, setDistricts]   = useState<Location[]>([])
  const [cities, setCities]         = useState<Location[]>([])
  const [provinceId, setProvinceId] = useState('')
  const [districtId, setDistrictId] = useState('')

  useEffect(() => {
    fetch('/api/locations/provinces')
      .then(r => r.json())
      .then(setProvinces)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!provinceId) return
    fetch(`/api/locations/children?parentId=${provinceId}`)
      .then(r => r.json())
      .then(setDistricts)
  }, [provinceId])

  useEffect(() => {
    if (!districtId) return
    fetch(`/api/locations/children?parentId=${districtId}`)
      .then(r => r.json())
      .then(setCities)
  }, [districtId])

  const handleProvince = (id: string) => {
    setDistrictId('')
    setDistricts([]); setCities([])
    setProvinceId(id)
    onChange('')
  }

  const handleDistrict = (id: string) => {
    setCities([])
    setDistrictId(id)
    onChange('')
  }

  const clear = () => {
    setProvinceId(''); setDistrictId('')
    setDistricts([]); setCities([])
    onChange('')
  }

  const isFiltering = !!value || !!provinceId

  return (
    <div className={styles.row}>
      <MapPin size={13} className={styles.icon} />
      <span className={styles.label}>Location</span>

      {provinces.length > 0 && (
        <select className={styles.select} value={provinceId}
          onChange={e => handleProvince(e.target.value)}>
          <option value="">All provinces</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}

      {districts.length > 0 && (
        <select className={styles.select} value={districtId}
          onChange={e => handleDistrict(e.target.value)}>
          <option value="">All districts</option>
          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      )}

      {cities.length > 0 && (
        <select className={styles.select} value={value}
          onChange={e => onChange(e.target.value)}>
          <option value="">All cities</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}

      {isFiltering && (
        <button className={styles.clearBtn} onClick={clear}>
          <X size={11} /> Clear
        </button>
      )}
    </div>
  )
}
