'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Megaphone, Upload, Image as ImageIcon, Trash2, ExternalLink,
  CheckCircle2, AlertTriangle,
} from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './ads.module.css'

interface Ad {
  id: string
  advertiserName: string
  imageUrl: string
  linkUrl: string | null
  isActive: boolean
  startDate: string | null
  endDate: string | null
  createdAt: string
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  const [advertiserName, setAdvertiserName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const load = useCallback(() => {
    fetch('/api/ads').then(r => r.json()).then(d => {
      setAds(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'vuna/ads')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({}))
    if (data.url) setImageUrl(data.url)
    else setError(data.error ?? 'Image upload failed.')
    setUploading(false)
    e.target.value = ''
  }

  const submit = async () => {
    if (!advertiserName.trim() || !imageUrl) {
      setError('Advertiser name and a banner image are required.')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advertiserName, imageUrl,
        linkUrl: linkUrl || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Could not save the ad.')
      return
    }
    setAdvertiserName(''); setImageUrl(''); setLinkUrl(''); setStartDate(''); setEndDate('')
    setOk(true); setTimeout(() => setOk(false), 3000)
    load()
  }

  const toggle = async (id: string, current: boolean) => {
    await fetch(`/api/ads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this ad banner? This cannot be undone.')) return
    await fetch(`/api/ads/${id}`, { method: 'DELETE' })
    load()
  }

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>
          <Megaphone size={20} className={styles.titleIcon} /> Advertising Banners
        </h1>
        <p className={shared.pageSub}>
          Upload an advertiser&apos;s own designed banner. Their brand, their colours — you just
          place it, link it, and schedule it. It shows as a dismissible bar across the bottom of the site.
        </p>
      </div>

      {/* ── Add new ad ── */}
      <div className={shared.card} style={{ marginBottom: 20 }}>
        <h2 className={shared.cardTitle}>Add a Banner</h2>

        <div className={styles.formGrid}>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Advertiser name *</label>
            <input
              className={shared.formInput}
              value={advertiserName}
              onChange={e => setAdvertiserName(e.target.value)}
              placeholder="e.g. Nandos Highflats"
            />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Click-through link (optional)</label>
            <input
              className={shared.formInput}
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://advertiser.co.za"
            />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Starts (optional)</label>
            <input type="date" className={shared.formInput} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Ends (optional)</label>
            <input type="date" className={shared.formInput} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className={styles.uploadRow}>
          {imageUrl ? (
            <div className={styles.previewWrap}>
              <img src={imageUrl} alt="Banner preview" className={styles.preview} />
              <button type="button" className={styles.clearImg} onClick={() => setImageUrl('')}>Remove image</button>
            </div>
          ) : (
            <label className={styles.uploadBtn}>
              {uploading ? <Upload size={16} /> : <ImageIcon size={16} />}
              <span>{uploading ? 'Uploading...' : 'Upload advertiser banner (wide image, JPEG/PNG/WebP)'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={uploadImage} disabled={uploading} />
            </label>
          )}
        </div>

        {error && <div className={styles.error}><AlertTriangle size={13} /> {error}</div>}
        {ok && <div className={styles.success}><CheckCircle2 size={13} /> Banner saved and live.</div>}

        <button className={shared.btnPrimary} onClick={submit} disabled={saving || uploading}>
          {saving ? 'Saving...' : 'Add Banner'}
        </button>
      </div>

      {/* ── Existing ads ── */}
      <div className={shared.card}>
        <h2 className={shared.cardTitle}>All Banners ({ads.length})</h2>
        {loading ? (
          <div className={shared.loading}>Loading banners...</div>
        ) : ads.length === 0 ? (
          <div className={shared.empty}>No ad banners yet. Add one above.</div>
        ) : (
          <div className={styles.list}>
            {ads.map(ad => (
              <div key={ad.id} className={styles.adRow}>
                <img src={ad.imageUrl} alt={ad.advertiserName} className={styles.thumb} />
                <div className={styles.adInfo}>
                  <div className={styles.adName}>
                    {ad.advertiserName}
                    <span className={`${styles.chip} ${ad.isActive ? styles.chipLive : styles.chipOff}`}>
                      {ad.isActive ? 'Live' : 'Off'}
                    </span>
                  </div>
                  <div className={styles.adMeta}>
                    {ad.linkUrl && <a href={ad.linkUrl} target="_blank" rel="noopener" className={styles.adLink}><ExternalLink size={11} /> {ad.linkUrl}</a>}
                    {(fmt(ad.startDate) || fmt(ad.endDate)) && (
                      <span>{fmt(ad.startDate) ?? 'now'} → {fmt(ad.endDate) ?? 'no end'}</span>
                    )}
                  </div>
                </div>
                <div className={styles.adActions}>
                  <button className={styles.toggleBtn} onClick={() => toggle(ad.id, ad.isActive)}>
                    {ad.isActive ? 'Turn off' : 'Turn on'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => remove(ad.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
