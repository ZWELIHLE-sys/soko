'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './buyer.module.css'
import { LocationFields } from './_components/LocationFields'
import type { Location, BuyerFormState } from './_types'
import { EMPTY_FORM } from './_types'

export default function BuyerRegisterPage() {
  const router = useRouter()
  const [countries, setCountries] = useState<Location[]>([])
  const [provinces, setProvinces] = useState<Location[]>([])
  const [districts, setDistricts] = useState<Location[]>([])
  const [cities, setCities]       = useState<Location[]>([])
  const [form, setForm]           = useState<BuyerFormState>(EMPTY_FORM)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    fetch('/api/locations/countries')
      .then(r => r.json())
      .then((data: Location[]) => {
        setCountries(data)
        if (data.length === 1) {
          setForm(f => ({ ...f, countryId: data[0].id }))
        }
      })
  }, [])

  useEffect(() => {
    if (!form.countryId) return
    fetch(`/api/locations/children?parentId=${form.countryId}`)
      .then(r => r.json())
      .then(setProvinces)
  }, [form.countryId])

  useEffect(() => {
    if (!form.provinceId) return
    fetch(`/api/locations/children?parentId=${form.provinceId}`)
      .then(r => r.json())
      .then(setDistricts)
  }, [form.provinceId])

  useEffect(() => {
    if (!form.districtId) return
    fetch(`/api/locations/children?parentId=${form.districtId}`)
      .then(r => r.json())
      .then(setCities)
  }, [form.districtId])

  const handleField = (field: keyof BuyerFormState, value: string) => {
    if (field === 'countryId') {
      setProvinces([]); setDistricts([]); setCities([])
      setForm(f => ({ ...f, countryId: value, provinceId: '', districtId: '', locationId: '' }))
    } else if (field === 'provinceId') {
      setDistricts([]); setCities([])
      setForm(f => ({ ...f, provinceId: value, districtId: '', locationId: '' }))
    } else if (field === 'districtId') {
      setCities([])
      setForm(f => ({ ...f, districtId: value, locationId: '' }))
    } else {
      setForm(f => ({ ...f, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register/buyer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:       form.name,
        email:      form.email,
        password:   form.password,
        phone:      form.phone      || undefined,
        locationId: form.locationId || undefined,
        suburb:     form.suburb     || undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error); return }
    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.patternStrip} />

      <div className={styles.center}>
        <div className={styles.wrapper}>

          <div className={styles.heading}>
            <div className={styles.title}>Create Buyer Account</div>
            <p className={styles.subtitle}>Start shopping authentic African products</p>
          </div>

          <div className={styles.card}>
            <form onSubmit={handleSubmit}>

              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input className={styles.input} type="text" required placeholder="Your full name"
                  value={form.name} onChange={e => handleField('name', e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input className={styles.input} type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => handleField('email', e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Phone number <span className={styles.labelOptional}>(optional)</span>
                </label>
                <input className={styles.input} type="tel" placeholder="e.g. 071 234 5678"
                  value={form.phone} onChange={e => handleField('phone', e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input className={styles.input} type="password" required placeholder="Min 6 characters"
                  value={form.password} onChange={e => handleField('password', e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Confirm password</label>
                <input className={styles.input} type="password" required placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={e => handleField('confirmPassword', e.target.value)} />
              </div>

              <LocationFields
                countries={countries} provinces={provinces}
                districts={districts} cities={cities}
                countryId={form.countryId}   provinceId={form.provinceId}
                districtId={form.districtId} locationId={form.locationId}
                suburb={form.suburb} onChange={handleField}
              />

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" disabled={loading}
                className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className={styles.cardFooter}>
              Want to sell instead?{' '}
              <Link href="/register/seller" className={styles.link}>Apply as a seller</Link>
            </div>
          </div>

          <div className={styles.footer}>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>Sign in</Link>
          </div>
        </div>
      </div>

      <div className={styles.patternStrip} />
    </div>
  )
}
