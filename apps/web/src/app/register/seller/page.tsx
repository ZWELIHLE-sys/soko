'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Globe, HandHeart, ShieldCheck,
  Shirt, Palette, Armchair, Wheat, Sparkles, Box,
  Cpu, BookOpen, Lamp, Scissors, Hammer, Leaf, Pencil, Camera,
  PenLine,
} from 'lucide-react'
import styles from './seller.module.css'
import ProofUpload from './ProofUpload'

interface Category { id: string; name: string; icon: string; slug: string }

const categoryMeta: Record<string, { icon: React.ReactNode; desc: string }> = {
  fashion:     { icon: <Shirt size={18} />,    desc: 'Clothing, accessories, traditional dress' },
  art:         { icon: <Palette size={18} />,  desc: 'Paintings, prints and visual art' },
  furniture:   { icon: <Armchair size={18} />, desc: 'Handmade furniture and wood pieces' },
  food:        { icon: <Wheat size={18} />,    desc: 'Traditional food, spices and produce' },
  beauty:      { icon: <Sparkles size={18} />, desc: 'Skincare, haircare and beauty products' },
  sculpture:   { icon: <Box size={18} />,      desc: 'Carved sculptures and craft objects' },
  electronics: { icon: <Cpu size={18} />,      desc: 'Handbuilt electronics and tech items' },
  books:       { icon: <BookOpen size={18} />, desc: 'Books, poetry and written works' },
  homeware:    { icon: <Lamp size={18} />,     desc: 'Home décor, kitchenware and interiors' },
  textiles:    { icon: <Scissors size={18} />, desc: 'Beadwork, weaving, fabrics and fibre' },
  metalwork:   { icon: <Hammer size={18} />,   desc: 'Gates, ironwork, welding and metalcraft' },
  wellness:    { icon: <Leaf size={18} />,     desc: 'Herbal remedies and holistic wellness' },
  drawings:    { icon: <Pencil size={18} />,   desc: 'Illustrations, sketches and prints' },
  photography: { icon: <Camera size={18} />,   desc: 'Photography prints and visual work' },
  other:       { icon: <PenLine size={18} />,  desc: 'Something else — tell us what you make' },
}
interface Location { id: string; name: string }

export default function SellerRegisterPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Location[]>([])
  const [districts, setDistricts] = useState<Location[]>([])
  const [cities, setCities] = useState<Location[]>([])

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', brandName: '', bio: '',
    categoryId: '', customCategory: '',
    provinceId: '', districtId: '', locationId: '', suburb: '',
  })

  const emptySlots = () => [
    { file: null, preview: null },
    { file: null, preview: null },
    { file: null, preview: null },
  ]
  const [proofSlots, setProofSlots] = useState<{ file: File | null; preview: string | null }[]>(emptySlots)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)

  useEffect(() => {
    fetch('/api/locations/provinces').then(r => r.json()).then(setProvinces)
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    if (!form.provinceId) return
    const load = async () => {
      const res = await fetch(`/api/locations/children?parentId=${form.provinceId}`)
      const data = await res.json()
      setCities([])
      setDistricts(data)
      setForm(f => ({ ...f, districtId: '', locationId: '' }))
    }
    load()
  }, [form.provinceId])

  useEffect(() => {
    if (!form.districtId) return
    const load = async () => {
      const res = await fetch(`/api/locations/children?parentId=${form.districtId}`)
      const data = await res.json()
      setCities(data)
      setForm(f => ({ ...f, locationId: '' }))
    }
    load()
  }, [form.districtId])

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
    if (filledSlots.length < 3) {
      setError('Please add all 3 proof photos before submitting')
      return
    }

    setLoading(true)

    // Upload proof photos first
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
    setUploadingProof(false)

    const res = await fetch('/api/auth/register/seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        brandName: form.brandName,
        bio: form.bio,
        categoryId: form.categoryId,
        customCategory: form.customCategory || undefined,
        locationId: form.locationId,
        suburb: form.suburb || undefined,
        proofUrls,
      })
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

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

              <div className={styles.sectionLabel}>Personal Information</div>

              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Full name</label>
                  <input className={styles.input} type="text" required placeholder="Your name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className={styles.label}>Phone number</label>
                  <input className={styles.input} type="tel" required placeholder="071 234 5678"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input className={styles.input} type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Password</label>
                  <input className={styles.input} type="password" required placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div>
                  <label className={styles.label}>Confirm password</label>
                  <input className={styles.input} type="password" required placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
              </div>

              <div className={styles.sectionLabel}>Your Shop</div>

              <div className={styles.field}>
                <label className={styles.label}>Brand / Shop name</label>
                <input className={styles.input} type="text" required placeholder="e.g. Nomvula's Beadwork"
                  value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Your story (optional)</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Tell buyers who you are and what you make..."
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.fieldLast}>
                <label className={styles.label}>Main category — what do you make?</label>
                <div className={styles.categoryGrid}>
                  {categories.map(c => {
                    const meta = categoryMeta[c.slug]
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`${styles.categoryOption} ${form.categoryId === c.id ? styles.categoryOptionSelected : ''}`}
                        onClick={() => setForm({ ...form, categoryId: c.id, customCategory: '' })}
                      >
                        <span className={styles.categoryOptionIcon}>
                          {meta?.icon ?? c.icon}
                        </span>
                        <span>
                          <div className={styles.categoryOptionName}>{c.name}</div>
                          {meta && <div className={styles.categoryOptionDesc}>{meta.desc}</div>}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {!form.categoryId && (
                  <input type="text" required style={{ display: 'none' }} />
                )}
                {form.categoryId === 'cat-other' && (
                  <input
                    className={styles.input}
                    type="text"
                    required
                    placeholder="e.g. Candle making, Soap, Pottery, Weaving..."
                    value={form.customCategory}
                    onChange={e => setForm({ ...form, customCategory: e.target.value })}
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>

              <div className={styles.sectionLabel}>Your Location</div>

              <div className={styles.field}>
                <label className={styles.label}>Province</label>
                <select className={styles.select} required
                  value={form.provinceId} onChange={e => setForm({ ...form, provinceId: e.target.value })}>
                  <option value="">Select province</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {districts.length > 0 && (
                <div className={styles.field}>
                  <label className={styles.label}>District</label>
                  <select className={styles.select} required
                    value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value })}>
                    <option value="">Select district</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {cities.length > 0 && (
                <div className={styles.field}>
                  <label className={styles.label}>City / Town</label>
                  <select className={styles.select} required
                    value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })}>
                    <option value="">Select city</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.locationId && (
                <div className={styles.fieldLast}>
                  <label className={styles.label}>Suburb / Area <span className={styles.labelOptional}>(optional)</span></label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="e.g. Umlazi D Section, Hillbrow, Madadeni..."
                    value={form.suburb}
                    onChange={e => setForm({ ...form, suburb: e.target.value })}
                  />
                </div>
              )}

              <div className={styles.sectionLabel}>Proof of Craft</div>

              <ProofUpload value={proofSlots} onChange={setProofSlots} />

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className={`${styles.button} ${loading ? styles.buttonLoading : ''}`}
              >
                {uploadingProof ? 'Uploading your photos...' : loading ? 'Submitting application...' : <><Globe size={15} /> Apply To Sell on Vuna</>}
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
