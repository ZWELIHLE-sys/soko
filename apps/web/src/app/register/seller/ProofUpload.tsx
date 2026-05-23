'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Hammer, Building2, Users, X, ImageUp } from 'lucide-react'
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
]

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
  ]

  const handleSelect = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const next = value.map((s, i) => {
      if (i !== idx) return s
      if (s.preview) URL.revokeObjectURL(s.preview)
      return { file, preview: URL.createObjectURL(file) }
    })
    onChange(next)
    e.target.value = ''
  }

  const handleRemove = (idx: number) => {
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
          No ID required. Instead, show us 3 real photos that prove you make your product yourself.
          Each slot has a specific purpose — all 3 are required before your application can be reviewed.
        </p>
      </div>

      <div className={styles.slots}>
        {SLOTS.map((slot, idx) => {
          const state = value[idx]
          const filled = !!state?.preview
          return (
            <div key={slot.id} className={`${styles.slot} ${filled ? styles.slotFilled : ''}`}>
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
                accept="image/*"
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
