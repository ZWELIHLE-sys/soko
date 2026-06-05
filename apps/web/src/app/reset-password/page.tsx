'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './reset.module.css'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className={styles.card}>
        <div className={styles.errorBox}>
          <div className={styles.cardTitle}>Invalid link</div>
          <p className={styles.cardSub}>This password reset link is missing or broken.</p>
          <Link href="/forgot-password" className={styles.button}>Request a new link</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
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

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: form.password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (done) {
    return (
      <div className={styles.card}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successTitle}>Password updated</div>
          <p className={styles.successText}>Your password has been changed. Redirecting you to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.cardTitle}>Set a new password</h1>
      <p className={styles.cardSub}>Choose a strong password for your Vuna account.</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>New password</label>
          <input
            className={styles.input}
            type="password"
            required
            placeholder="Min 6 characters"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Confirm new password</label>
          <input
            className={styles.input}
            type="password"
            required
            placeholder="Repeat your new password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div className={styles.footer}>
        <Link href="/login" className={styles.link}>Back to Sign In</Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.page}>
      <div className={styles.patternStrip} />

      <div className={styles.center}>
        <div className={styles.wrapper}>

          <div className={styles.logoBox}>
            <div className={styles.logoIcon}>V</div>
            <div className={styles.logoTitle}>Vuna</div>
            <div className={styles.logoSub}>Reap What Africa Makes</div>
          </div>

          <Suspense fallback={<div className={styles.card}><p className={styles.cardSub}>Loading...</p></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <div className={styles.patternStrip} />
    </div>
  )
}
