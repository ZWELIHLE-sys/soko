'use client'

import { useEffect, useState } from 'react'
import { Settings, KeyRound, UserPlus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './settings.module.css'

interface AdminUser {
  id:        string
  name:      string
  email:     string
  createdAt: string
}

export default function AdminSettingsPage() {
  // Change password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving]   = useState(false)
  const [pwError, setPwError]     = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // New admin
  const [admins, setAdmins]       = useState<AdminUser[]>([])
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [adSaving, setAdSaving]   = useState(false)
  const [adError, setAdError]     = useState('')
  const [adSuccess, setAdSuccess] = useState('')

  const loadAdmins = () => {
    fetch('/api/settings/admins')
      .then(r => r.json())
      .then(d => setAdmins(Array.isArray(d) ? d : []))
      .catch(() => {})
  }

  useEffect(() => { loadAdmins() }, [])

  const changePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }

    setPwSaving(true)
    const res = await fetch('/api/settings/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setPwSaving(false)

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setPwError(d.error ?? 'Could not change password.')
      return
    }

    setPwSuccess(true)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setPwSuccess(false), 4000)
  }

  const createAdmin = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setAdError('')
    setAdSuccess('')

    if (password.length < 8) {
      setAdError('Password must be at least 8 characters.')
      return
    }

    setAdSaving(true)
    const res = await fetch('/api/settings/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    setAdSaving(false)

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setAdError(d.error ?? 'Could not create admin.')
      return
    }

    setAdSuccess(`Admin account created for ${email}.`)
    setName(''); setEmail(''); setPassword('')
    loadAdmins()
    setTimeout(() => setAdSuccess(''), 5000)
  }

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>
          <Settings size={20} className={styles.titleIcon} /> Settings
        </h1>
        <p className={shared.pageSub}>Manage your admin account and platform access.</p>
      </div>

      <div className={styles.grid}>

        {/* Change password */}
        <div className={shared.card}>
          <div className={styles.cardHeader}>
            <KeyRound size={16} className={styles.cardIcon} />
            <h2 className={shared.cardTitle}>Change My Password</h2>
          </div>

          <form onSubmit={changePassword}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Current password</label>
              <input
                className={shared.formInput}
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>New password (min 8 characters)</label>
              <input
                className={shared.formInput}
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Confirm new password</label>
              <input
                className={shared.formInput}
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            {pwError && <div className={styles.errorMsg}><AlertTriangle size={13} /> {pwError}</div>}
            {pwSuccess && <div className={styles.successMsg}><CheckCircle2 size={13} /> Password changed successfully.</div>}

            <button type="submit" className={shared.btnPrimary} disabled={pwSaving}>
              {pwSaving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Create new admin */}
        <div className={shared.card}>
          <div className={styles.cardHeader}>
            <UserPlus size={16} className={styles.cardIcon} />
            <h2 className={shared.cardTitle}>Add New Admin</h2>
          </div>
          <p className={styles.cardNote}>
            New admins get full access to this control panel. Only add people you trust completely.
          </p>

          <form onSubmit={createAdmin}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Full name</label>
              <input
                className={shared.formInput}
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Email address</label>
              <input
                className={shared.formInput}
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Password (min 8 characters)</label>
              <input
                className={shared.formInput}
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {adError && <div className={styles.errorMsg}><AlertTriangle size={13} /> {adError}</div>}
            {adSuccess && <div className={styles.successMsg}><CheckCircle2 size={13} /> {adSuccess}</div>}

            <button type="submit" className={shared.btnSuccess} disabled={adSaving}>
              {adSaving ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Current admins */}
      <div className={shared.card}>
        <div className={styles.cardHeader}>
          <ShieldCheck size={16} className={styles.cardIcon} />
          <h2 className={shared.cardTitle}>Current Admins ({admins.length})</h2>
        </div>
        <div className={styles.adminList}>
          {admins.map(a => (
            <div key={a.id} className={styles.adminRow}>
              <div className={styles.adminAvatar}>{a.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className={styles.adminName}>{a.name}</div>
                <div className={styles.adminEmail}>{a.email}</div>
              </div>
              <div className={styles.adminSince}>
                Since {new Date(a.createdAt).toLocaleDateString('en-ZA')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
