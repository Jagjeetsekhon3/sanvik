'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function OrderStatusUpdater({
  orderId, currentStatus, statusColors,
}: {
  orderId: string
  currentStatus: string
  statusColors: Record<string, string>
}) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleChange = async (newStatus: string) => {
    setSaving(true)
    setStatus(newStatus)
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, order_status: newStatus }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        style={{
          border: '1px solid #e5e5e5', borderRadius: '20px',
          padding: '4px 10px', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.68rem',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          backgroundColor: `${statusColors[status]}18`,
          color: statusColors[status],
          outline: 'none', fontWeight: 500,
          appearance: 'none', paddingRight: '24px',
        }}
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {saving && (
        <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', opacity: 0.5 }}>...</span>
      )}
    </div>
  )
}
