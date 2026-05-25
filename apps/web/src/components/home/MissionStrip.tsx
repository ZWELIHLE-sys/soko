import { HandHeart, ShieldCheck, Globe, Truck } from 'lucide-react'
import styles from './MissionStrip.module.css'

const missions = [
  { icon: <HandHeart size={24} />, label: 'Hand Produced', sub: 'Made by real African people' },
  { icon: <ShieldCheck size={24} />, label: 'Vuna Verified', sub: 'Every seller checked by us' },
  { icon: <Globe size={24} />, label: 'African Owned', sub: '100% — no exceptions' },
  // TODO: DHL API integration — update label to 'DHL Delivery' and sub to 'Tracked door-to-door'
  { icon: <Truck size={24} />, label: 'Direct Delivery', sub: 'Seller arranges with you' },
]

export default function MissionStrip() {
  return (
    <div className={styles.strip}>
      {missions.map((item) => (
        <div key={item.label} className={styles.item}>
          <div className={styles.icon}>{item.icon}</div>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.sub}>{item.sub}</div>
        </div>
      ))}
    </div>
  )
}
