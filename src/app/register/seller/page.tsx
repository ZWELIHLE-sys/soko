'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category { id: string; name: string; icon: string }
interface Location { id: string; name: string }

export default function SellerRegisterPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Location[]>([])
  const [districts, setDistricts] = useState<Location[]>([])
  const [cities, setCities] = useState<Location[]>([])

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', brandName: '', bio: '',
    categoryId: '', provinceId: '', districtId: '', locationId: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load categories and provinces on mount
  useEffect(() => {
    fetch('/api/locations/provinces').then(r => r.json()).then(setProvinces)
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  // Load districts when province selected
  useEffect(() => {
    if (!form.provinceId) return
    const load = async () => {
      const res = await fetch(`/api/locations/children?parentId=${form.provinceId}`)
      const data = await res.json()
      setCities([])
      setDistricts(data)
      setForm(f => ({ ...f, districtId: '', locationId: '' }))
    }
    load()
  }, [form.provinceId])

  // Load cities when district selected
  useEffect(() => {
    if (!form.districtId) return
    const load = async () => {
      const res = await fetch(`/api/locations/children?parentId=${form.districtId}`)
      const data = await res.json()
      setCities(data)
      setForm(f => ({ ...f, locationId: '' }))
    }
    load()
  }, [form.districtId])

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!form.locationId) {
      setError('Please select your city')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register/seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        brandName: form.brandName,
        bio: form.bio,
        categoryId: form.categoryId,
        locationId: form.locationId,
      })
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push('/login?registered=seller')
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: '500' as const, color: '#374151', marginBottom: '6px'
  }

  const selectStyle = { ...inputStyle, background: '#fff', cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      <div style={{ height: '6px', background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)' }} />

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#14532D' }}>
              Apply To Sell on Soko
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Your craft deserves the world. Apply for your PA Verified badge.
            </p>
          </div>

          {/* Sacred rules */}
          <div style={{ background: '#1C0A00', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '8px' }}>
            {['🌍 African owned', '🤲 Hand produced', '✅ PA Verified'].map(r => (
              <div key={r} style={{ fontSize: '12px', color: '#FEF3C7' }}>{r}</div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <form onSubmit={handleSubmit}>

              {/* Personal info */}
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7C2D12', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                Personal Information
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input style={inputStyle} type="text" required placeholder="Your name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Phone number</label>
                  <input style={inputStyle} type="tel" required placeholder="071 234 5678"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email address</label>
                <input style={inputStyle} type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input style={inputStyle} type="password" required placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm password</label>
                  <input style={inputStyle} type="password" required placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
              </div>

              {/* Shop info */}
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7C2D12', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                Your Shop
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Brand / Shop name</label>
                <input style={inputStyle} type="text" required placeholder="e.g. Nomvula's Beadwork"
                  value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Your story (optional)</label>
                <textarea
                  placeholder="Tell buyers who you are and what you make..."
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' as const }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Main category</label>
                <select style={selectStyle} required
                  value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select what you sell</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7C2D12', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                Your Location
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Province</label>
                <select style={selectStyle} required
                  value={form.provinceId} onChange={e => setForm({ ...form, provinceId: e.target.value })}>
                  <option value="">Select province</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {districts.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>District</label>
                  <select style={selectStyle} required
                    value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value })}>
                    <option value="">Select district</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {cities.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>City / Town</label>
                  <select style={selectStyle} required
                    value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })}>
                    <option value="">Select city</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div style={{
                  background: '#FEE2E2', border: '1px solid #FECACA',
                  borderRadius: '8px', padding: '10px 12px',
                  fontSize: '13px', color: '#991B1B', marginBottom: '16px'
                }}>{error}</div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? '#9ca3af' : '#14532D',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Submitting application...' : 'Apply To Sell on Soko 🌍'}
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>
              Your application will be reviewed within 24 hours. We verify every seller to protect the authenticity of Soko.
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#7C2D12', fontWeight: '500', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}