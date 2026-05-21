'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import styles from './profile.module.css'

export default function BuyerProfilePage() {
  const { data: session } = useSession()
  const [nameEdit, setNameEdit] = useState<string | null>(null)
  const [phone, setPhone]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)

  const name  = nameEdit  ?? session?.user?.name  ?? ''
  const email = session?.user?.email ?? ''

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Profile update API — coming soon
    setTimeout(() => {
      setSaving(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 800)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Manage your Vuna account details.</p>
      </div>

      <div className={styles.avatarCard}>
        <div className={styles.avatar}>
          {session?.user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className={styles.avatarName}>{session?.user?.name}</div>
          <div className={styles.avatarRole}>Vuna Shopper · Supporting African creators</div>
        </div>
      </div>

      <form onSubmit={handleSave} className={styles.card}>
        <div className={styles.cardLabel}>Personal Details</div>

        <div className={styles.field}>
          <label className={styles.label}>Full name</label>
          <input
            className={styles.input}
            type="text"
            required
            value={name}
            onChange={e => setNameEdit(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email address</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            disabled
            readOnly
          />
          <div className={styles.inputNote}>
            Email cannot be changed after registration.
          </div>
        </div>

        <div className={styles.fieldLast}>
          <label className={styles.label}>Phone number</label>
          <input
            className={styles.input}
            type="tel"
            placeholder="e.g. 071 234 5678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        {success && (
          <div className={styles.success}>
            <CheckCircle2 size={14} />
            Profile updated successfully!
          </div>
        )}

        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className={styles.impact}>
        <div className={styles.impactLabel}>Uvunile</div>
        <p className={styles.impactText}>
          You have reaped from Africa. Every purchase you make on Vuna
          puts money directly into the hands of an African creator.
          That is the harvest we are building together.
        </p>
      </div>
    </div>
  )
}
