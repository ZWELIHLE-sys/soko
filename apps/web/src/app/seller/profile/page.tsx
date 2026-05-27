'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ShieldCheck, Clock, XCircle, UploadCloud, CheckCircle2, Banknote, ImageIcon, User } from 'lucide-react'
import styles from './profile.module.css'

interface SellerProfile {
  name: string
  email: string
  brandName: string
  phone: string
  bio: string | null
  suburb: string | null
  avatar: string | null
  banner: string | null
  status: string
  isVerified: boolean
  location: { name: string }
  category: { name: string }
  bankName: string | null
  accountHolder: string | null
  accountNumber: string | null
  accountType: string | null
  branchCode: string | null
}

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
  const [bankName, setBankName]           = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountType, setAccountType]     = useState('')
  const [branchCode, setBranchCode]       = useState('')
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
      setBankName(data.bankName ?? '')
      setAccountHolder(data.accountHolder ?? '')
      setAccountNumber(data.accountNumber ?? '')
      setAccountType(data.accountType ?? '')
      setBranchCode(data.branchCode ?? '')
    })
  }, [])

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    setUploading(type)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', `vuna/sellers/${type}`)
    const res  = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) type === 'avatar' ? setAvatar(data.url) : setBanner(data.url)
    setUploading(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/seller/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio, phone, suburb, avatar, banner,
        bankName, accountHolder, accountNumber, accountType, branchCode,
      }),
    })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (!profile) return <div className={styles.loading}>Loading profile...</div>

  const statusCfg = STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.PENDING

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{profile.brandName}</h1>
          <p className={styles.subtitle}>{profile.location.name} · {profile.category.name}</p>
        </div>
        <div className={`${styles.statusBadge} ${statusCfg.cls}`}>
          <statusCfg.Icon size={13} />
          {statusCfg.label}
          {profile.status === 'PENDING' && <span className={styles.statusHint}> — review within 48h</span>}
        </div>
      </div>

      <form onSubmit={handleSave}>

        {/* Store appearance */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <ImageIcon size={14} className={styles.cardLabelIcon} />
            Store Appearance
          </div>
          <p className={styles.cardNote}>This is what buyers see when they visit your store page.</p>

          {/* Banner */}
          <div className={styles.appearanceRow}>
            <div className={styles.appearanceLabel}>Store Banner</div>
            <div className={styles.bannerPreview}>
              {banner ? (
                <Image src={banner} alt="Store banner" fill style={{ objectFit: 'cover' }} sizes="660px" />
              ) : (
                <div className={styles.bannerFallback} />
              )}
              <label className={styles.bannerUploadBtn}>
                <UploadCloud size={13} />
                {uploading === 'banner' ? 'Uploading...' : 'Change Banner'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  disabled={!!uploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'banner') }}
                />
              </label>
            </div>
            <div className={styles.fieldHint}>Recommended 1200×400px · JPEG/PNG/WebP · max 10MB</div>
          </div>

          {/* Avatar */}
          <div className={styles.appearanceRow}>
            <div className={styles.appearanceLabel}>Profile Photo</div>
            <div className={styles.avatarRow}>
              <label className={styles.avatarWrap}>
                {avatar ? (
                  <Image src={avatar} alt="Avatar" fill style={{ objectFit: 'cover' }} sizes="72px" />
                ) : (
                  <div className={styles.avatarInitial}>
                    {profile.brandName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.avatarOverlay}>
                  <UploadCloud size={13} />
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  disabled={!!uploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'avatar') }}
                />
              </label>
              <div>
                <div className={styles.avatarName}>{profile.brandName}</div>
                <div className={styles.fieldHint}>Click to change · JPEG/PNG/WebP · max 10MB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Store details */}
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
              <input
                className={styles.input}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 071 234 5678"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Suburb / Neighbourhood</label>
              <input
                className={styles.input}
                value={suburb}
                onChange={e => setSuburb(e.target.value)}
                placeholder="e.g. Umlazi, Soweto, Sea Point"
              />
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

        {/* Payment details */}
        <div className={`${styles.card} ${styles.cardPayment}`}>
          <div className={styles.cardLabel}>
            <Banknote size={14} className={styles.cardLabelIcon} />
            Payment Details
          </div>
          <p className={styles.cardNote}>
            Your bank details are shared with buyers for direct EFT payments. Kept private — only shown at checkout.
          </p>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Bank Name</label>
              <input
                className={styles.input}
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="e.g. FNB, Capitec, Standard Bank"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Account Type</label>
              <select className={styles.input} value={accountType} onChange={e => setAccountType(e.target.value)}>
                <option value="">Select type</option>
                <option value="Cheque">Cheque</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Account Holder Name</label>
            <input
              className={styles.input}
              value={accountHolder}
              onChange={e => setAccountHolder(e.target.value)}
              placeholder="As it appears on your bank account"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Account Number</label>
              <input
                className={styles.input}
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="Your account number"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Branch Code</label>
              <input
                className={styles.input}
                value={branchCode}
                onChange={e => setBranchCode(e.target.value)}
                placeholder="e.g. 250655"
              />
            </div>
          </div>
        </div>

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
