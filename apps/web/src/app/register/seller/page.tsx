'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Globe, HandHeart, ShieldCheck } from 'lucide-react'
import styles from './seller.module.css'
import ProofUpload from './ProofUpload'
import { PersonalShopSection } from './_components/PersonalShopSection'
import { CategoryGrid } from './_components/CategoryGrid'
import { LocationFields } from './_components/LocationFields'
import { VideoUpload } from './_components/VideoUpload'
import type { Category, Location, SellerFormState } from './_types'
import { EMPTY_FORM } from './_types'

export default function SellerRegisterPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces]   = useState<Location[]>([])
  const [districts, setDistricts]   = useState<Location[]>([])
  const [cities, setCities]         = useState<Location[]>([])

  const [form, setForm]           = useState<SellerFormState>(EMPTY_FORM)
  const [proofSlots, setProofSlots] = useState(() => [
    { file: null as File | null, preview: null as string | null },
    { file: null as File | null, preview: null as string | null },
    { file: null as File | null, preview: null as string | null },
    { file: null as File | null, preview: null as string | null },
  ])
  const [videoFile, setVideoFile]         = useState<File | null>(null)
  const [hasDeclaration, setHasDeclaration] = useState(false)
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)

  useEffect(() => {
    fetch('/api/locations/provinces').then(r => r.json()).then(setProvinces)
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    if (!form.provinceId) return
    fetch(`/api/locations/children?parentId=${form.provinceId}`)
      .then(r => r.json())
      .then(setDistricts)
  }, [form.provinceId])

  useEffect(() => {
    if (!form.districtId) return
    fetch(`/api/locations/children?parentId=${form.districtId}`)
      .then(r => r.json())
      .then(setCities)
  }, [form.districtId])

  const handleField = (field: keyof SellerFormState, value: string) => {
    if (field === 'provinceId') {
      setDistricts([])
      setCities([])
      setForm(f => ({ ...f, provinceId: value, districtId: '', locationId: '' }))
    } else if (field === 'districtId') {
      setCities([])
      setForm(f => ({ ...f, districtId: value, locationId: '' }))
    } else {
      setForm(f => ({ ...f, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!form.locationId) {
      setError('Please select your city')
      return
    }
    if (form.categoryId === 'cat-other' && !form.customCategory.trim()) {
      setError('Please describe what you make')
      return
    }
    const filledSlots = proofSlots.filter(s => s.file)
    if (filledSlots.length < 4) {
      setError('Please add all 4 proof photos before submitting')
      return
    }
    if (!videoFile) {
      setError('Please add your craft video (30–60 seconds)')
      return
    }
    if (!hasDeclaration) {
      setError('Please confirm the self-declaration before submitting')
      return
    }

    setLoading(true)
    setUploadingProof(true)

    const proofUrls: string[] = []
    for (const { file } of filledSlots) {
      if (!file) continue
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'vuna/proof')
      const up = await fetch('/api/upload', { method: 'POST', body: fd })
      const upData = await up.json()
      if (!up.ok) {
        setError('Photo upload failed. Please try again.')
        setLoading(false)
        setUploadingProof(false)
        return
      }
      proofUrls.push(upData.url)
    }

    const vfd = new FormData()
    vfd.append('file', videoFile)
    vfd.append('folder', 'vuna/proof/videos')
    const vup = await fetch('/api/upload', { method: 'POST', body: vfd })
    const vupData = await vup.json()
    if (!vup.ok) {
      setError('Video upload failed. Please try again.')
      setLoading(false)
      setUploadingProof(false)
      return
    }

    setUploadingProof(false)

    const res = await fetch('/api/auth/register/seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, brandName: form.brandName, bio: form.bio,
        categoryId: form.categoryId, customCategory: form.customCategory || undefined,
        locationId: form.locationId, suburb: form.suburb || undefined,
        socialMediaLink: form.socialMediaLink || undefined,
        proofUrls, videoUrl: vupData.url, hasDeclaration: true,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error); return }
    router.push('/login?registered=seller')
  }

  return (
    <div className={styles.page}>
      <div className={styles.patternStrip} />

      <div className={styles.center}>
        <div className={styles.wrapper}>

          <div className={styles.heading}>
            <div className={styles.title}>Apply To Sell on Vuna</div>
            <p className={styles.subtitle}>Your craft deserves the world. Apply for your Vuna Verified badge.</p>
          </div>

          <div className={styles.sacredBadges}>
            <div className={styles.badge}><Globe size={14} /> African owned</div>
            <div className={styles.badge}><HandHeart size={14} /> Hand produced</div>
            <div className={styles.badge}><ShieldCheck size={14} /> Vuna Verified</div>
          </div>

          <div className={styles.card}>
            <form onSubmit={handleSubmit}>
              <PersonalShopSection form={form} onChange={handleField} />

              <CategoryGrid
                categories={categories}
                selectedId={form.categoryId}
                customCategory={form.customCategory}
                onSelect={id => setForm(f => ({ ...f, categoryId: id, customCategory: '' }))}
                onCustomChange={v => handleField('customCategory', v)}
              />

              <LocationFields
                provinces={provinces} districts={districts} cities={cities}
                provinceId={form.provinceId} districtId={form.districtId}
                locationId={form.locationId} suburb={form.suburb}
                onChange={handleField}
              />

              <div className={styles.sectionLabel}>Proof of Craft</div>
              <ProofUpload value={proofSlots} onChange={setProofSlots} />

              <VideoUpload
                videoFile={videoFile}
                onSelect={setVideoFile}
                onRemove={() => setVideoFile(null)}
              />

              <div className={styles.declarationBox}>
                <label className={styles.declarationLabel}>
                  <input type="checkbox" className={styles.declarationCheck}
                    checked={hasDeclaration} required
                    onChange={e => setHasDeclaration(e.target.checked)} />
                  <span>
                    I declare that all products I list on Vuna are personally made, grown or produced
                    by me or my registered business. I understand that listing fraudulent products will
                    result in immediate removal and legal action.
                  </span>
                </label>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" disabled={loading}
                className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}>
                {uploadingProof
                  ? 'Uploading photos and video...'
                  : loading
                    ? 'Submitting application...'
                    : <><Globe size={15} /> Apply To Sell on Vuna</>
                }
              </button>
            </form>

            <div className={styles.cardFooter}>
              Your application will be reviewed within 24 hours. We verify every seller to protect the authenticity of Vuna.
            </div>
          </div>

          <div className={styles.footer}>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>Sign in</Link>
          </div>
        </div>
      </div>

      <div className={styles.patternStrip} />
    </div>
  )
}
