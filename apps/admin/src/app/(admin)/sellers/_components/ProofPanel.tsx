'use client'

import Image from 'next/image'
import { Video, Link2, FileText } from 'lucide-react'
import styles from '../sellers.module.css'

interface Props {
  proofUrls: string[]
  videoUrl: string | null
  socialMediaLink: string | null
  bio: string | null
  customCategory: string | null
}

export function ProofPanel({ proofUrls, videoUrl, socialMediaLink, bio, customCategory }: Props) {
  return (
    <div className={styles.proofPanel}>
      <div className={styles.proofSectionLabel}>Proof of Craft</div>

      <div className={styles.proofPhotos}>
        {proofUrls.length > 0 ? (
          proofUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              className={styles.proofThumbWrap} title="Open full size">
              <Image src={url} alt={`Proof photo ${i + 1}`} fill
                sizes="120px" style={{ objectFit: 'cover' }} />
              <span className={styles.proofThumbOverlay}>View</span>
            </a>
          ))
        ) : (
          <span className={styles.proofMissing}>No photos uploaded</span>
        )}
      </div>

      <div className={styles.proofLinks}>
        {videoUrl ? (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer"
            className={styles.proofVideoBtn}>
            <Video size={14} /> Watch Craft Video
          </a>
        ) : (
          <span className={styles.proofMissing}><Video size={13} /> No video uploaded</span>
        )}

        {socialMediaLink && (
          <a href={socialMediaLink} target="_blank" rel="noopener noreferrer"
            className={styles.proofSocialBtn}>
            <Link2 size={13} /> Social Media
          </a>
        )}
      </div>

      {(bio || customCategory) && (
        <div className={styles.proofBio}>
          {customCategory && (
            <div className={styles.proofCustomCat}>
              <strong>Makes:</strong> {customCategory}
            </div>
          )}
          {bio && (
            <div className={styles.proofBioText}>
              <FileText size={12} /> {bio}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
