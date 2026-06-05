'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MailCheck, ShieldCheck } from 'lucide-react'
import styles from './verify-email.module.css'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login?verified=1'), 2000)
  }

  if (success) {
    return (
      <div className={styles.successBox}>
        <ShieldCheck size={40} className={styles.successIcon} />
        <div className={styles.successTitle}>Email Verified!</div>
        <div className={styles.successText}>Redirecting you to sign in...</div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}>
        <MailCheck size={32} className={styles.icon} />
      </div>
      <h1 className={styles.cardTitle}>Check your email</h1>
      <p className={styles.cardSub}>
        We sent a 6-digit verification code to{' '}
        <strong className={styles.emailHighlight}>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Verification code</label>
          <input
            className={styles.otpInput}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className={styles.footer}>
        Wrong email?{' '}
        <Link href="/register/buyer" className={styles.link}>Go back</Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.page}>
      <div className={styles.patternStrip} />
      <div className={styles.center}>
        <div className={styles.wrapper}>
          <Suspense>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
      <div className={styles.patternStrip} />
    </div>
  )
}
