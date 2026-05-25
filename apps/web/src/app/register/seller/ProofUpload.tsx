'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Hammer, Building2, Users, Wrench, X, ImageUp, AlertCircle } from 'lucide-react'
import styles from './ProofUpload.module.css'

interface Slot {
  id: string
  label: string
  desc: string
  hint: string
  icon: React.ReactNode
}

const SLOTS: Slot[] = [
  {
    id: 'at-work',
    label: 'You making it',
    desc: 'A clear photo of YOU actively making your product',
    hint: 'Show your hands, your face, and the work in progress',
    icon: <Hammer size={20} />,
  },
  {
    id: 'workspace',
    label: 'Your workspace',
    desc: 'Your studio, kitchen, workshop, or workbench',
    hint: 'Show the space where you create — tools, materials, equipment',
    icon: <Building2 size={20} />,
  },
  {
    id: 'witness',
    label: 'Your witness',
    desc: 'A neighbour, family member, colleague, or employee',
    hint: 'Someone who can confirm you make this yourself, standing next to your work',
    icon: <Users size={20} />,
  },
  {
    id: 'materials',
    label: 'Your materials or tools',
    desc: 'The raw materials or tools you use to make your product',
    hint: 'e.g. beads and thread, chisels and wood, ingredients, fabric and needles',
    icon: <Wrench size={20} />,
  },
]

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_MB = 10
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024

interface SlotState {
  file: File | null
  preview: string | null
}

interface Props {
  value: SlotState[]
  onChange: (slots: SlotState[]) => void
}

export default function ProofUpload({ value, onChange }: Props) {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  const [errors, setErrors] = useState<(string | null)[]>([null, null, null, null])

  const setSlotError = (idx: number, msg: string | null) => {
    setErrors(prev => prev.map((e, i) => i === idx ? msg : e))
  }

  const handleSelect = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setSlotError(idx, 'Only JPEG, PNG or WebP photos are accepted')
      e.target.value = ''
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setSlotError(idx, `Photo is too large — maximum size is ${MAX_PHOTO_MB} MB`)
      e.target.value = ''
      return
    }

    setSlotError(idx, null)
    const next = value.map((s, i) => {
      if (i !== idx) return s
      if (s.preview) URL.revokeObjectURL(s.preview)
      return { file, preview: URL.createObjectURL(file) }
    })
    onChange(next)
    e.target.value = ''
  }

  const handleRemove = (idx: number) => {
    setSlotError(idx, null)
    const next = value.map((s, i) => {
      if (i !== idx) return s
      if (s.preview) URL.revokeObjectURL(s.preview)
      return { file: null, preview: null }
    })
    onChange(next)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <p className={styles.introText}>
          No ID required. Show us 4 photos that prove you make your product yourself.
          All 4 are required. JPEG, PNG or WebP · Max {MAX_PHOTO_MB} MB each.
        </p>
      </div>

      <div className={styles.slots}>
        {SLOTS.map((slot, idx) => {
          const state = value[idx]
          const filled = !!state?.preview
          const error = errors[idx]
          return (
            <div key={slot.id} className={`${styles.slot} ${filled ? styles.slotFilled : ''} ${error ? styles.slotError : ''}`}>
              <div className={styles.slotHeader}>
                <span className={styles.slotNum}>{idx + 1}</span>
                <span className={styles.slotIcon}>{slot.icon}</span>
                <div>
                  <div className={styles.slotLabel}>{slot.label}</div>
                  <div className={styles.slotDesc}>{slot.desc}</div>
                </div>
                {filled && (
                  <button type="button" className={styles.slotRemove} onClick={() => handleRemove(idx)}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {error && (
                <div className={styles.slotErrorMsg}>
                  <AlertCircle size={13} /> {error}
                </div>
              )}

              {filled ? (
                <div
                  className={styles.preview}
                  onClick={() => inputRefs[idx].current?.click()}
                  title="Click to replace"
                >
                  <Image
                    src={state.preview!}
                    alt={slot.label}
                    fill
                    className={styles.previewImg}
                    sizes="(max-width: 640px) 100vw, 460px"
                  />
                  <div className={styles.previewOverlay}>Replace photo</div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => inputRefs[idx].current?.click()}
                >
                  <ImageUp size={22} />
                  <span className={styles.addBtnLabel}>Add photo</span>
                  <span className={styles.addBtnHint}>{slot.hint}</span>
                </button>
              )}

              <input
                ref={inputRefs[idx]}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={e => handleSelect(idx, e)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
