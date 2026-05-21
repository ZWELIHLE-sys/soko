'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './buyer.module.css'

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

  return (
    <div className={styles.page}>
      <div className={styles.patternStrip} />

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
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input className={styles.input} type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Phone number</label>
                <input className={styles.input} type="tel" placeholder="e.g. 071 234 5678"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input className={styles.input} type="password" required placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>

              <div className={styles.fieldLast}>
                <label className={styles.label}>Confirm password</label>
                <input className={styles.input} type="password" required placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
              >
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
    </div>
  )
}
