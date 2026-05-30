'use client'

import styles from '../seller.module.css'
import type { SellerFormState } from '../_types'

interface Props {
  form: SellerFormState
  onChange: (field: keyof SellerFormState, value: string) => void
}

export function PersonalShopSection({ form, onChange }: Props) {
  return (
    <>
      <div className={styles.sectionLabel}>Personal Information</div>

      <div className={styles.row}>
        <div>
          <label className={styles.label}>Full name</label>
          <input className={styles.input} type="text" required placeholder="Your name"
            value={form.name} onChange={e => onChange('name', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Phone number</label>
          <input className={styles.input} type="tel" required placeholder="071 234 5678"
            value={form.phone} onChange={e => onChange('phone', e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email address</label>
        <input className={styles.input} type="email" required placeholder="you@example.com"
          value={form.email} onChange={e => onChange('email', e.target.value)} />
      </div>

      <div className={styles.row}>
        <div>
          <label className={styles.label}>Password</label>
          <input className={styles.input} type="password" required placeholder="Min 6 characters"
            value={form.password} onChange={e => onChange('password', e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Confirm password</label>
          <input className={styles.input} type="password" required placeholder="Repeat password"
            value={form.confirmPassword} onChange={e => onChange('confirmPassword', e.target.value)} />
        </div>
      </div>

      <div className={styles.sectionLabel}>Your Shop</div>

      <div className={styles.field}>
        <label className={styles.label}>Brand / Shop name</label>
        <input className={styles.input} type="text" required placeholder="e.g. Nomvula's Beadwork"
          value={form.brandName} onChange={e => onChange('brandName', e.target.value)} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Your story <span className={styles.labelOptional}>(optional)</span></label>
        <textarea className={styles.textarea} rows={3}
          placeholder="Tell buyers who you are and what you make..."
          value={form.bio} onChange={e => onChange('bio', e.target.value)} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Social media link <span className={styles.labelOptional}>(optional)</span>
        </label>
        <p className={styles.fieldHint}>
          Instagram, Facebook or TikTok where you show your craft. Not required —
          especially if you are just starting out.
        </p>
        <input className={styles.input} type="url"
          placeholder="e.g. https://www.instagram.com/yourcraft"
          value={form.socialMediaLink} onChange={e => onChange('socialMediaLink', e.target.value)} />
      </div>
    </>
  )
}
