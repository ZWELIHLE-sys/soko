const missions = [
  { icon: '🤲', label: 'Hand Produced', sub: 'Made by real African people' },
  { icon: '✅', label: 'Soko Verified', sub: 'Every seller checked by us' },
  { icon: '🌍', label: 'African Owned', sub: '100% — no exceptions' },
  { icon: '🚚', label: 'SA Delivery', sub: 'Local riders + couriers' },
]

export default function MissionStrip() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      borderBottom: '1px solid #e5e7eb',
      background: '#fff'
    }}>
      {missions.map((item, i) => (
        <div key={i} style={{
          padding: '22px 16px', textAlign: 'center',
          borderRight: i < missions.length - 1 ? '1px solid #e5e7eb' : 'none',
        }}>
          <div style={{ fontSize: '26px', marginBottom: '8px' }}>{item.icon}</div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
            {item.label}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
            {item.sub}
          </div>
        </div>
      ))}
    </div>
  )
}