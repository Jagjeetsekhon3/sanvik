'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Address } from '@/types'

const INPUT_STYLE = {
  width: '100%', padding: '11px 14px',
  border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px',
  fontFamily: 'var(--font-body)', fontSize: '0.85rem',
  backgroundColor: 'transparent', color: 'var(--color-text)', outline: 'none',
}
const LABEL_STYLE = {
  fontFamily: 'var(--font-body)', fontSize: '0.68rem',
  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  opacity: 0.45, display: 'block', marginBottom: '6px',
}

interface StoredAddress extends Address {
  id: string
  customer_id: string
  is_default: boolean
}

export default function AddressManager({
  addresses: initial,
  customerId,
}: {
  addresses: StoredAddress[]
  customerId: string
}) {
  const supabase = createClient()
  const [addresses, setAddresses] = useState<StoredAddress[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Address>({
    name: '', phone: '', line1: '', line2: null,
    city: '', state: '', pincode: '', country: 'India',
  })

  const update = (field: keyof Address, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }))

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) return
    setSaving(true)

    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...form, customer_id: customerId, is_default: addresses.length === 0 })
      .select()
      .single()

    setSaving(false)
    if (!error && data) {
      setAddresses(prev => [...prev, data as StoredAddress])
      setShowForm(false)
      setForm({ name: '', phone: '', line1: '', line2: null, city: '', state: '', pincode: '', country: 'India' })
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handleSetDefault = async (id: string) => {
    // Remove default from all
    await supabase.from('addresses').update({ is_default: false }).eq('customer_id', customerId)
    // Set new default
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
  }

  return (
    <div>
      {/* Address list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {addresses.map(addr => (
          <div key={addr.id} style={{
            border: '1px solid',
            borderColor: addr.is_default ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)',
            borderRadius: '4px', padding: '20px',
            position: 'relative',
          }}>
            {addr.is_default && (
              <span style={{
                position: 'absolute', top: '12px', right: '12px',
                backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)',
                fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '3px 8px',
              }}>Default</span>
            )}

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 4px' }}>
              {addr.name}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', opacity: 0.55, margin: '0 0 2px', lineHeight: 1.5 }}>
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
              {addr.city}, {addr.state} {addr.pincode}<br />
              {addr.country} · {addr.phone}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
              {!addr.is_default && (
                <button onClick={() => handleSetDefault(addr.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                  opacity: 0.45, textDecoration: 'underline', color: 'var(--color-text)', padding: 0,
                }}>
                  Set default
                </button>
              )}
              <button onClick={() => handleDelete(addr.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                opacity: 0.35, textDecoration: 'underline', color: '#ef4444', padding: 0,
              }}>
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add new card */}
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{
            border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '4px',
            padding: '20px', cursor: 'pointer', background: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '8px', minHeight: '120px',
            color: 'var(--color-text)', opacity: 0.4,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.08em' }}>
              Add Address
            </span>
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', margin: '0 0 24px' }}>New Address</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div><label style={LABEL_STYLE}>Full Name</label><input style={INPUT_STYLE} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Jagjeet Singh" /></div>
            <div><label style={LABEL_STYLE}>Phone</label><input style={INPUT_STYLE} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" /></div>
          </div>
          <div style={{ marginBottom: '14px' }}><label style={LABEL_STYLE}>Address Line 1</label><input style={INPUT_STYLE} value={form.line1} onChange={e => update('line1', e.target.value)} /></div>
          <div style={{ marginBottom: '14px' }}><label style={LABEL_STYLE}>Address Line 2</label><input style={INPUT_STYLE} value={form.line2 || ''} onChange={e => update('line2', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            <div><label style={LABEL_STYLE}>City</label><input style={INPUT_STYLE} value={form.city} onChange={e => update('city', e.target.value)} /></div>
            <div><label style={LABEL_STYLE}>State</label><input style={INPUT_STYLE} value={form.state} onChange={e => update('state', e.target.value)} /></div>
            <div><label style={LABEL_STYLE}>Pincode</label><input style={INPUT_STYLE} value={form.pincode} onChange={e => update('pincode', e.target.value)} /></div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '12px 28px', backgroundColor: 'var(--color-primary)',
              color: 'var(--color-secondary)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
            }}>
              {saving ? 'Saving...' : 'Save Address'}
            </button>
            <button onClick={() => setShowForm(false)} style={{
              padding: '12px 20px', background: 'none',
              border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-text)', opacity: 0.5,
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
