'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BuyerRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    setLoading(true)

    const res = await fetch('/api/auth/register/buyer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      })
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push('/login?registered=buyer')
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      <div style={{ height: '6px', background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#7C2D12' }}>
              Create Buyer Account
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Start shopping authentic African products
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full name</label>
                <input style={inputStyle} type="text" required placeholder="Your full name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email address</label>
                <input style={inputStyle} type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Phone number</label>
                <input style={inputStyle} type="tel" placeholder="e.g. 071 234 5678"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} type="password" required placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Confirm password</label>
                <input style={inputStyle} type="password" required placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>

              {error && (
                <div style={{
                  background: '#FEE2E2', border: '1px solid #FECACA',
                  borderRadius: '8px', padding: '10px 12px',
                  fontSize: '13px', color: '#991B1B', marginBottom: '16px'
                }}>{error}</div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? '#9ca3af' : '#7C2D12',
                color: '#FEF3C7', border: 'none',
                borderRadius: '8px', fontSize: '15px',
                fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
              Want to sell instead?{' '}
              <Link href="/register/seller" style={{ color: '#14532D', fontWeight: '500', textDecoration: 'none' }}>
                Apply as a seller
              </Link>
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