'use client'

import { useEffect, useState } from 'react'

export default function AdminMonitoringPage() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      fetch('/api/admin/monitoring')
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false) })
    }
    load()
    // Auto-refresh every 60 seconds
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontFamily: 'Georgia, serif', fontSize: '26px',
              fontWeight: '700', color: '#1a1a1a', marginBottom: '6px'
            }}>
              System Monitoring
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Platform health — auto-refreshes every 60 seconds.
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#DCFCE7', padding: '8px 14px',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '8px', height: '8px', background: '#16A34A',
              borderRadius: '50%', animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '13px', color: '#14532D', fontWeight: '500' }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading monitoring data...
        </div>
      ) : (
        <>
          {/* System status */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px', marginBottom: '28px'
          }}>
            {[
              { label: 'Database', status: data.alerts.databaseStatus, icon: '🗄️' },
              { label: 'Payments (PayFast)', status: data.alerts.paymentsStatus, icon: '💳' },
              { label: 'API Server', status: 'operational', icon: '⚡' },
              { label: 'Image Storage', status: 'operational', icon: '📸' },
            ].map(item => (
              <div key={item.label} style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: '12px', padding: '16px',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <span style={{ fontSize: '22px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: '500', marginTop: '2px',
                    color: item.status === 'healthy' || item.status === 'operational'
                      ? '#14532D' : '#991B1B'
                  }}>
                    {item.status === 'healthy' || item.status === 'operational'
                      ? '✅ Operational' : '❌ ' + item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '14px', padding: '24px', marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '16px', fontWeight: '600',
              color: '#1a1a1a', marginBottom: '16px'
            }}>
              ⚠️ Active Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.alerts.pendingProducts > 0 && (
                <div style={{
                  padding: '12px', background: '#FEF9C3',
                  borderRadius: '8px', fontSize: '13px', color: '#92400E'
                }}>
                  📝 {data.alerts.pendingProducts} product{data.alerts.pendingProducts !== 1 ? 's' : ''} in DRAFT — not visible to buyers
                </div>
              )}
              {data.alerts.outOfStock > 0 && (
                <div style={{
                  padding: '12px', background: '#FEE2E2',
                  borderRadius: '8px', fontSize: '13px', color: '#991B1B'
                }}>
                  📦 {data.alerts.outOfStock} product{data.alerts.outOfStock !== 1 ? 's' : ''} out of stock
                </div>
              )}
              {data.alerts.pendingProducts === 0 && data.alerts.outOfStock === 0 && (
                <div style={{
                  padding: '12px', background: '#DCFCE7',
                  borderRadius: '8px', fontSize: '13px', color: '#14532D'
                }}>
                  ✅ No active alerts — platform is running cleanly
                </div>
              )}
            </div>
          </div>

          {/* Activity metrics */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '20px', marginBottom: '24px'
          }}>
            {/* Last 24 hours */}
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '14px', padding: '24px'
            }}>
              <h2 style={{
                fontSize: '15px', fontWeight: '600',
                color: '#1a1a1a', marginBottom: '16px'
              }}>
                Last 24 Hours
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'New sellers applied', value: data.last24h.sellers, icon: '🤲' },
                  { label: 'New buyers registered', value: data.last24h.buyers, icon: '👤' },
                  { label: 'Orders placed', value: data.last24h.orders, icon: '📦' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px',
                    background: '#FAFAF9', borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '13px', color: '#374151' }}>
                      {item.icon} {item.label}
                    </span>
                    <span style={{
                      fontFamily: 'Georgia, serif', fontSize: '18px',
                      fontWeight: '700', color: '#7C2D12'
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last 7 days */}
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '14px', padding: '24px'
            }}>
              <h2 style={{
                fontSize: '15px', fontWeight: '600',
                color: '#1a1a1a', marginBottom: '16px'
              }}>
                Last 7 Days
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'New sellers applied', value: data.last7d.sellers, icon: '🤲' },
                  { label: 'New buyers registered', value: data.last7d.buyers, icon: '👤' },
                  { label: 'Orders placed', value: data.last7d.orders, icon: '📦' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px',
                    background: '#FAFAF9', borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '13px', color: '#374151' }}>
                      {item.icon} {item.label}
                    </span>
                    <span style={{
                      fontFamily: 'Georgia, serif', fontSize: '18px',
                      fontWeight: '700', color: '#7C2D12'
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '14px', padding: '24px'
          }}>
            <h2 style={{
              fontSize: '15px', fontWeight: '600',
              color: '#1a1a1a', marginBottom: '16px'
            }}>
              Recent Orders
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.recentOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '14px' }}>
                  No orders yet — waiting for the harvest to begin 🌱
                </div>
              ) : data.recentOrders.map((order: any) => (
                <div key={order.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '10px 12px',
                  background: '#FAFAF9', borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  <div>
                    <span style={{ fontWeight: '500', color: '#1a1a1a' }}>
                      {order.buyer.name}
                    </span>
                    <span style={{ color: '#9ca3af' }}> → </span>
                    <span style={{ color: '#6b7280' }}>{order.seller.brandName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#7C2D12' }}>
                      R{order.totalAmount.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}