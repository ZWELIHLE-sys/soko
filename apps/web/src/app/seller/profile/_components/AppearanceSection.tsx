'use client'

import Image from 'next/image'
import { UploadCloud, ImageIcon } from 'lucide-react'
import styles from '../profile.module.css'

interface Props {
  brandName: string
  banner: string | null
  avatar: string | null
  uploading: 'avatar' | 'banner' | null
  onUpload: (file: File, type: 'avatar' | 'banner') => void
}

export function AppearanceSection({ brandName, banner, avatar, uploading, onUpload }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>
        <ImageIcon size={14} className={styles.cardLabelIcon} />
        Store Appearance
      </div>
      <p className={styles.cardNote}>This is what buyers see when they visit your store page.</p>

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
              onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f, 'banner') }}
            />
          </label>
        </div>
        <div className={styles.fieldHint}>Recommended 1200×400px · JPEG/PNG/WebP · max 10MB</div>
      </div>

      <div className={styles.appearanceRow}>
        <div className={styles.appearanceLabel}>Profile Photo</div>
        <div className={styles.avatarRow}>
          <label className={styles.avatarWrap}>
            {avatar ? (
              <Image src={avatar} alt="Avatar" fill style={{ objectFit: 'cover' }} sizes="72px" />
            ) : (
              <div className={styles.avatarInitial}>
                {brandName.charAt(0).toUpperCase()}
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
              onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f, 'avatar') }}
            />
          </label>
          <div>
            <div className={styles.avatarName}>{brandName}</div>
            <div className={styles.fieldHint}>Click to change · JPEG/PNG/WebP · max 10MB</div>
          </div>
        </div>
      </div>
    </div>
  )
}
