'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INPUT = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #e5e5e5', borderRadius: '4px',
  fontFamily: 'var(--font-body)', fontSize: '0.85rem',
  backgroundColor: '#fff', color: '#111', outline: 'none',
}
const LABEL = {
  fontFamily: 'var(--font-body)', fontSize: '0.68rem',
  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: '#888', display: 'block', marginBottom: '6px',
}

interface Discount {
  id: string; code: string; type: string; value: number;
  min_order: number | null; max_uses: number | null;
  used_count: number; expires_at: string | null; is_active: boolean
}

export default function DiscountManager({ discounts: initial, tenantId }: { discounts: Discount[]; tenantId: string }) {
  const router = useRouter()
  const [discounts, setDiscounts] = useState<Discount[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '' })

  const handleCreate = async () => {
    if (!form.code || !form.value) return
    setSaving(true)

    const res = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        min_order: form.minOrder ? parseFloat(form.minOrder) : null,
        max_uses: form.maxUses ? parseInt(form.maxUses) : null,
        expires_at: form.expiresAt || null,
        is_active: true,
      }),
    })

    const data = await res.json()
    setSaving(false)
    if (data.discount) {
      setDiscounts(prev => [data.discount, ...prev])
      setShowForm(false)
      setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '' })
    }
  }

  const handleToggle = async (id: string, is_active: boolean) => {
    await fetch('/api/admin/discounts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    })
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, is_active: !is_active } : d))
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/admin/discounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDiscounts(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div>
      {/* Create form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{
          backgroundColor: '#111', color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.1em',
          textTransform: 'uppercase', padding: '12px 24px', fontWeight: 600,
          borderRadius: '4px', marginBottom: '24px',
        }}>
          + Create Discount Code
        </button>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 20px' }}>New Discount Code</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={LABEL}>Code *</label>
              <input style={INPUT} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="WELCOME10" />
            </div>
            <div>
              <label style={LABEL}>Type</label>
              <select style={{ ...INPUT, cursor: 'pointer' }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label style={LABEL}>Value * {form.type === 'percentage' ? '(%)' : '(₹/$)'}</label>
              <input style={INPUT} type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={form.type === 'percentage' ? '10' : '500'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={LABEL}>Min Order Amount</label>
              <input style={INPUT} type="number" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))} placeholder="Optional" />
            </div>
            <div>
              <label style={LABEL}>Max Uses</label>
              <input style={INPUT} type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} placeholder="Unlimited" />
            </div>
            <div>
              <label style={LABEL}>Expires At</label>
              <input style={INPUT} type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleCreate} disabled={saving} style={{ backgroundColor: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '11px 24px', fontWeight: 600, borderRadius: '4px' }}>
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: '1px solid #eee', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888', padding: '11px 20px', borderRadius: '4px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Discounts table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 100px 80px 100px 80px 80px 80px 80px', padding: '12px 20px', borderBottom: '1px solid #eee', fontFamily: 'var(--font-body)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
          <span>Code</span><span>Type</span><span>Value</span><span>Min Order</span><span>Used</span><span>Expires</span><span>Status</span><span>Actions</span>
        </div>

        {!discounts.length ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>No discount codes yet</div>
        ) : (
          discounts.map(d => (
            <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '140px 100px 80px 100px 80px 80px 80px 80px', padding: '14px 20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, color: '#111', letterSpacing: '0.05em' }}>{d.code}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888', textTransform: 'capitalize' }}>{d.type}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: '#3b82f6' }}>
                {d.type === 'percentage' ? `${d.value}%` : `₹${d.value}`}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888' }}>{d.min_order ? `₹${d.min_order}` : '—'}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888' }}>{d.used_count}{d.max_uses ? `/${d.max_uses}` : ''}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888' }}>{d.expires_at ? new Date(d.expires_at).toLocaleDateString('en-IN') : '—'}</span>
              <button onClick={() => handleToggle(d.id, d.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', backgroundColor: d.is_active ? '#22c55e18' : '#ef444418', color: d.is_active ? '#22c55e' : '#ef4444', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {d.is_active ? 'Active' : 'Off'}
              </button>
              <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#aaa', textDecoration: 'underline' }}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
