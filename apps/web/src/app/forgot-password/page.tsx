'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './forgot.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      return
    }

    setSent(true)
  }

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

          <div className={styles.card}>
            {sent ? (
              <div className={styles.successBox}>
                <div className={styles.successIcon}>✓</div>
                <div className={styles.successTitle}>Check your email</div>
                <p className={styles.successText}>
                  If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link.
                  The link expires in 1 hour.
                </p>
                <Link href="/login" className={styles.button}>Back to Sign In</Link>
              </div>
            ) : (
              <>
                <h1 className={styles.cardTitle}>Forgot your password?</h1>
                <p className={styles.cardSub}>Enter your email and we&apos;ll send you a reset link.</p>

                <form onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label className={styles.label}>Email address</label>
                    <input
                      className={styles.input}
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  {error && <div className={styles.error}>{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div className={styles.footer}>
                  <Link href="/login" className={styles.link}>Back to Sign In</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.patternStrip} />
    </div>
  )
}
