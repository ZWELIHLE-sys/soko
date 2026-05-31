'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Clock, XCircle, CheckCircle2, User } from 'lucide-react'
import styles from './profile.module.css'
import { AppearanceSection } from './_components/AppearanceSection'
import { PaymentSection } from './_components/PaymentSection'
import type { SellerProfile, BankFields } from './_types'

const STATUS_CONFIG: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  PENDING:   { label: 'Under Review',  cls: styles.statusPending,   Icon: Clock       },
  VERIFIED:  { label: 'Vuna Verified', cls: styles.statusVerified,  Icon: ShieldCheck },
  REJECTED:  { label: 'Not Approved',  cls: styles.statusRejected,  Icon: XCircle     },
  SUSPENDED: { label: 'Suspended',     cls: styles.statusRejected,  Icon: XCircle     },
}

export default function SellerProfilePage() {
  const [profile, setProfile]   = useState<SellerProfile | null>(null)
  const [bio, setBio]           = useState('')
  const [phone, setPhone]       = useState('')
  const [suburb, setSuburb]     = useState('')
  const [avatar, setAvatar]     = useState<string | null>(null)
  const [banner, setBanner]     = useState<string | null>(null)
  const [bank, setBank]         = useState<BankFields>({
    bankName: '', accountHolder: '', accountNumber: '', accountType: '', branchCode: '',
  })
  const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(null)
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    fetch('/api/seller/profile').then(r => r.json()).then((data: SellerProfile) => {
      setProfile(data)
      setBio(data.bio ?? '')
      setPhone(data.phone)
      setSuburb(data.suburb ?? '')
      setAvatar(data.avatar)
      setBanner(data.banner)
      setBank({
        bankName:      data.bankName      ?? '',
        accountHolder: data.accountHolder ?? '',
        accountNumber: data.accountNumber ?? '',
        accountType:   data.accountType   ?? '',
        branchCode:    data.branchCode    ?? '',
      })
    })
  }, [])

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    setUploading(type)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', `vuna/sellers/${type}`)
    const res  = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) { if (type === 'avatar') setAvatar(data.url); else setBanner(data.url) }
    setUploading(null)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/seller/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, phone, suburb, avatar, banner, ...bank }),
    })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (!profile) return <div className={styles.loading}>Loading profile...</div>

  const statusCfg = STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.PENDING

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{profile.brandName}</h1>
          <p className={styles.subtitle}>{profile.location.name} Â· {profile.category.name}</p>
        </div>
        <div className={`${styles.statusBadge} ${statusCfg.cls}`}>
          <statusCfg.Icon size={13} />
          {statusCfg.label}
          {profile.status === 'PENDING' && <span className={styles.statusHint}> â€” review within 48h</span>}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <AppearanceSection
          brandName={profile.brandName}
          banner={banner}
          avatar={avatar}
          uploading={uploading}
          onUpload={uploadImage}
        />

        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <User size={14} className={styles.cardLabelIcon} />
            Store Details
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} value={profile.name} disabled readOnly />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} value={profile.email} disabled readOnly />
              <div className={styles.fieldHint}>Cannot be changed after registration.</div>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <input className={styles.input} type="tel" value={phone}
                onChange={e => setPhone(e.target.value)} placeholder="e.g. 071 234 5678" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Suburb / Neighbourhood</label>
              <input className={styles.input} value={suburb}
                onChange={e => setSuburb(e.target.value)} placeholder="e.g. Umlazi, Soweto, Sea Point" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Your Story (Bio)</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={5}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell buyers who you are, what you make, and why it matters..."
            />
          </div>
        </div>

        <PaymentSection
          {...bank}
          onChange={(field, value) => setBank(b => ({ ...b, [field]: value }))}
        />

        {success && (
          <div className={styles.successMsg}>
            <CheckCircle2 size={14} /> Profile saved successfully.
          </div>
        )}

        <button type="submit" disabled={saving || !!uploading} className={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
