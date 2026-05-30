'use client'

import { useRef, useState } from 'react'
import { Video } from 'lucide-react'
import styles from '../seller.module.css'

const ALLOWED = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_MB = 150

interface Props {
  videoFile: File | null
  onSelect: (file: File) => void
  onRemove: () => void
}

export function VideoUpload({ videoFile, onSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED.includes(file.type)) {
      setError('Unsupported video format. Please use a standard video from your phone or camera.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Video is too large — maximum size is ${MAX_MB} MB`)
      e.target.value = ''
      return
    }
    setError('')
    onSelect(file)
    e.target.value = ''
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        Craft video — 30 to 60 seconds <span className={styles.labelRequired}>Required</span>
      </label>
      <p className={styles.fieldHint}>
        Record yourself making or working on your product. You do not need to speak —
        just show your hands and your craft.
      </p>
      {videoFile ? (
        <div className={styles.videoSelected}>
          <Video size={16} />
          <span>{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
          <button type="button" className={styles.videoRemove}
            onClick={() => { onRemove(); setError('') }}>
            Remove
          </button>
        </div>
      ) : (
        <button type="button" className={styles.uploadBtn}
          onClick={() => inputRef.current?.click()}>
          <Video size={18} /> Choose video file
        </button>
      )}
      {error && <div className={styles.videoErrorMsg}>{error}</div>}
      <input ref={inputRef} type="file" accept="video/mp4,video/quicktime,video/webm"
        style={{ display: 'none' }} onChange={handleChange} />
    </div>
  )
}
