'use client'

import { MessageCircle } from 'lucide-react'
import styles from './WhatsAppShare.module.css'

interface Props {
  text: string          // the momentum line, e.g. "I'm at the Vuna Market — come see!"
  label?: string
}

// Word of mouth in South Africa happens on WhatsApp. One tap opens a
// pre-written message with the current page's link attached.
export default function WhatsAppShare({ text, label = 'Share on WhatsApp' }: Props) {
  const share = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${text} ${window.location.href}`)}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <button type="button" className={styles.btn} onClick={share}>
      <MessageCircle size={15} />
      {label}
    </button>
  )
}
