'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      role,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    // Redirect based on role
    if (role === 'SELLER') router.push('/seller/dashboard')
    else if (role === 'BUYER') router.push('/buyer/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', flexDirection: 'column' }}>

      {/* Top pattern strip */}
      <div style={{ height: '6px', background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)' }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '52px', height: '52px', background: '#7C2D12',
              borderRadius: '10px', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#FEF3C7', fontSize: '20px', fontWeight: '900',
              fontFamily: 'Georgia, serif', marginBottom: '12px'
            }}>S</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: '#7C2D12' }}>Soko</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '2px' }}>To The World</div>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb' }}>

            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              Sign in to your Soko account
            </p>

            {/* Role Toggle */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: '#f3f4f6', borderRadius: '10px',
              padding: '4px', marginBottom: '24px', gap: '4px'
            }}>
              {(['BUYER', 'SELLER'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: role === r ? '#7C2D12' : 'transparent',
                    color: role === r ? '#FEF3C7' : '#6b7280',
                  }}
                >
                  {r === 'BUYER' ? '🛍️ I am Shopping' : '🤲 I am Selling'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1px solid #d1d5db', borderRadius: '8px',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1px solid #d1d5db', borderRadius: '8px',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: '#FEE2E2', border: '1px solid #FECACA',
                  borderRadius: '8px', padding: '10px 12px',
                  fontSize: '13px', color: '#991B1B', marginBottom: '16px'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#9ca3af' : '#7C2D12',
                  color: '#FEF3C7', border: 'none',
                  borderRadius: '8px', fontSize: '15px',
                  fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Footer links */}
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: '#7C2D12', fontWeight: '500', textDecoration: 'none' }}>
                Join Soko
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom pattern strip */}
      <div style={{ height: '6px', background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)' }} />
    </div>
  )
}