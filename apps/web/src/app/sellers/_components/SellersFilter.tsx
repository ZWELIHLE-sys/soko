'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, X } from 'lucide-react'
import styles from './SellersFilter.module.css'

interface Location { id: string; name: string }

interface Props {
  initialQ:          string
  initialLocationId: string
}

export function SellersFilter({ initialQ, initialLocationId }: Props) {
  const router = useRouter()

  const [search, setSearch]         = useState(initialQ)
  const [countries, setCountries]   = useState<Location[]>([])
  const [provinces, setProvinces]   = useState<Location[]>([])
  const [districts, setDistricts]   = useState<Location[]>([])
  const [cities, setCities]         = useState<Location[]>([])
  const [countryId, setCountryId]   = useState('')
  const [provinceId, setProvinceId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [cityId, setCityId]         = useState(initialLocationId)

  useEffect(() => { setSearch(initialQ) },          [initialQ])
  useEffect(() => { setCityId(initialLocationId) }, [initialLocationId])

  useEffect(() => {
    fetch('/api/locations/countries')
      .then(r => r.json())
      .then((data: Location[]) => {
        setCountries(data)
        if (data.length === 1) setCountryId(data[0].id)
      })
  }, [])

  useEffect(() => {
    if (!countryId) return
    fetch(`/api/locations/children?parentId=${countryId}`)
      .then(r => r.json())
      .then(setProvinces)
  }, [countryId])

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

  const buildUrl = (updates: { q?: string; locationId?: string }) => {
    const params = new URLSearchParams()
    const newQ     = updates.q          !== undefined ? updates.q          : search
    const newLocId = updates.locationId !== undefined ? updates.locationId : cityId
    if (newQ)     params.set('q',          newQ)
    if (newLocId) params.set('locationId', newLocId)
    const qs = params.toString()
    return `/sellers${qs ? '?' + qs : ''}`
  }

  const handleCountry = (id: string) => {
    setProvinceId(''); setDistrictId(''); setCityId('')
    setProvinces([]); setDistricts([]); setCities([])
    setCountryId(id)
    router.push(buildUrl({ locationId: '' }))
  }

  const handleProvince = (id: string) => {
    setDistrictId(''); setCityId('')
    setDistricts([]); setCities([])
    setProvinceId(id)
    router.push(buildUrl({ locationId: '' }))
  }

  const handleDistrict = (id: string) => {
    setCityId('')
    setCities([])
    setDistrictId(id)
    router.push(buildUrl({ locationId: '' }))
  }

  const handleCity = (id: string) => {
    setCityId(id)
    router.push(buildUrl({ locationId: id }))
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push(buildUrl({ q: search.trim() }))
  }

  const clearSearch = () => {
    setSearch('')
    router.push(buildUrl({ q: '' }))
  }

  const clearLocation = () => {
    setCountryId(''); setProvinceId(''); setDistrictId(''); setCityId('')
    setProvinces([]); setDistricts([]); setCities([])
    router.push(buildUrl({ locationId: '' }))
  }

  const clearAll = () => {
    setSearch(''); setCityId('')
    setCountryId(''); setProvinceId(''); setDistrictId('')
    setProvinces([]); setDistricts([]); setCities([])
    router.push('/sellers')
  }

  const hasFilters = !!search || !!cityId

  return (
    <div className={styles.bar}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search sellers by name or craft..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className={styles.clearBtn} onClick={clearSearch}>
            <X size={12} />
          </button>
        )}
        <button type="submit" className={styles.submitBtn}>Search</button>
      </form>

      <div className={styles.locationRow}>
        <span className={styles.locationLabel}><MapPin size={12} /> Location</span>

        {countries.length > 0 && (
          <select className={styles.select} value={countryId}
            onChange={e => handleCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

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
          <select className={styles.select} value={cityId}
            onChange={e => handleCity(e.target.value)}>
            <option value="">All cities</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        {cityId && (
          <button type="button" className={styles.clearLocBtn} onClick={clearLocation}>
            <X size={10} /> city
          </button>
        )}
      </div>

      {hasFilters && (
        <div className={styles.activeBar}>
          {search && (
            <span className={styles.activeTag}>
              &ldquo;{search}&rdquo;
              <button type="button" onClick={clearSearch}><X size={10} /></button>
            </span>
          )}
          {cityId && (
            <span className={styles.activeTag}>
              Near me
              <button type="button" onClick={clearLocation}><X size={10} /></button>
            </span>
          )}
          <button type="button" className={styles.clearAllBtn} onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
