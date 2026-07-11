'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, HandHeart } from 'lucide-react'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
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

    if (role === 'SELLER') router.push('/seller/dashboard')
    else if (role === 'BUYER') router.push('/buyer/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.patternStrip} />

      <div className={styles.center}>
        <div className={styles.wrapper}>

          <div className={styles.logoBox}>
            <div className={styles.logoImgWrap}>
              <Image src="/images/handlogo-full.png" alt="Vuna Marketplace" fill sizes="200px" className={styles.logoImg} />
            </div>
            <div className={styles.logoSub}>Where Local Is Celebrated And Cherished</div>
          </div>

          <div className={styles.card}>
            <h1 className={styles.cardTitle}>Welcome back</h1>
            <p className={styles.cardSub}>Sign in to your Vuna account</p>

            <div className={styles.roleToggle}>
              {(['BUYER', 'SELLER'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ''}`}
                >
                  {r === 'BUYER'
                    ? <><ShoppingBag size={14} /> I am Shopping</>
                    : <><HandHeart size={14} /> I am Selling</>
                  }
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input
                  className={styles.input}
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>

              <div className={styles.fieldLast}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
                  <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                </div>
                <input
                  className={styles.input}
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className={styles.footer}>
              Don&apos;t have an account?{' '}
              <Link href="/register" className={styles.link}>Join Vuna</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.patternStrip} />
    </div>
  )
}
