'use client'

import { useState } from 'react'
import { Tenant } from '@/types'
import { useRouter } from 'next/navigation'

const INPUT = { width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL = { fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888', display: 'block', marginBottom: '6px' }
const SECTION = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '20px' }
const SECTION_TITLE = { fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#999', margin: '0 0 20px' }

export default function SettingsForm({ tenant }: { tenant: Tenant }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    brand_name: tenant.brand_name,
    tagline: tenant.tagline || '',
    about: tenant.about || '',
    contact_email: tenant.contact_email || '',
    instagram_url: tenant.instagram_url || '',
    facebook_url: tenant.facebook_url || '',
    return_policy: tenant.return_policy || '',
    shipping_policy: tenant.shipping_policy || '',
    logo_url: tenant.logo_url || '',
    primary_color: tenant.primary_color,
    secondary_color: tenant.secondary_color,
    accent_color: tenant.accent_color,
    background_color: tenant.background_color,
    text_color: tenant.text_color,
    font_heading: tenant.font_heading,
    font_body: tenant.font_body,
    currency: tenant.currency,
    cod_enabled: tenant.cod_enabled,
    razorpay_key_id: tenant.razorpay_key_id || '',
    razorpay_key_secret: tenant.razorpay_key_secret || '',
    stripe_publishable_key: tenant.stripe_publishable_key || '',
    stripe_secret_key: tenant.stripe_secret_key || '',
    paypal_client_id: tenant.paypal_client_id || '',
  })

  const u = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Brand */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Brand</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Brand Name</label><input style={INPUT} value={form.brand_name} onChange={e => u('brand_name', e.target.value)} /></div>
          <div><label style={LABEL}>Tagline</label><input style={INPUT} value={form.tagline} onChange={e => u('tagline', e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: '16px' }}><label style={LABEL}>Logo URL (Cloudinary)</label><input style={INPUT} value={form.logo_url} onChange={e => u('logo_url', e.target.value)} placeholder="https://res.cloudinary.com/..." /></div>
        <div style={{ marginBottom: '16px' }}><label style={LABEL}>About</label><textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={form.about} onChange={e => u('about', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={LABEL}>Contact Email</label><input style={INPUT} value={form.contact_email} onChange={e => u('contact_email', e.target.value)} /></div>
          <div><label style={LABEL}>Instagram URL</label><input style={INPUT} value={form.instagram_url} onChange={e => u('instagram_url', e.target.value)} /></div>
        </div>
      </div>

      {/* Theme */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Theme</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '16px' }}>
          {[
            { label: 'Primary', key: 'primary_color' },
            { label: 'Secondary', key: 'secondary_color' },
            { label: 'Accent', key: 'accent_color' },
            { label: 'Background', key: 'background_color' },
            { label: 'Text', key: 'text_color' },
          ].map(c => (
            <div key={c.key}>
              <label style={LABEL}>{c.label}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={form[c.key as keyof typeof form] as string} onChange={e => u(c.key, e.target.value)} style={{ width: '40px', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '2px' }} />
                <input style={{ ...INPUT, flex: 1, fontSize: '0.75rem' }} value={form[c.key as keyof typeof form] as string} onChange={e => u(c.key, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={LABEL}>Heading Font</label><input style={INPUT} value={form.font_heading} onChange={e => u('font_heading', e.target.value)} placeholder="Playfair Display" /></div>
          <div><label style={LABEL}>Body Font</label><input style={INPUT} value={form.font_body} onChange={e => u('font_body', e.target.value)} placeholder="Inter" /></div>
        </div>
      </div>

      {/* Payments */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Payments</h2>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '16px' }}>
            <input type="checkbox" checked={form.cod_enabled} onChange={e => u('cod_enabled', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#111' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#444' }}>Enable Cash on Delivery</span>
          </label>
          <div>
            <label style={LABEL}>Currency</label>
            <select style={{ ...INPUT, cursor: 'pointer', width: 'auto' }} value={form.currency} onChange={e => u('currency', e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Razorpay Key ID</label><input style={INPUT} value={form.razorpay_key_id} onChange={e => u('razorpay_key_id', e.target.value)} placeholder="rzp_live_..." /></div>
          <div><label style={LABEL}>Razorpay Secret</label><input style={{ ...INPUT, fontFamily: 'monospace' }} type="password" value={form.razorpay_key_secret} onChange={e => u('razorpay_key_secret', e.target.value)} placeholder="••••••••" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Stripe Publishable Key</label><input style={INPUT} value={form.stripe_publishable_key} onChange={e => u('stripe_publishable_key', e.target.value)} placeholder="pk_live_..." /></div>
          <div><label style={LABEL}>Stripe Secret Key</label><input style={{ ...INPUT, fontFamily: 'monospace' }} type="password" value={form.stripe_secret_key} onChange={e => u('stripe_secret_key', e.target.value)} placeholder="••••••••" /></div>
        </div>
        <div><label style={LABEL}>PayPal Client ID</label><input style={INPUT} value={form.paypal_client_id} onChange={e => u('paypal_client_id', e.target.value)} placeholder="PayPal client ID" /></div>
      </div>

      {/* Policies */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Policies</h2>
        <div style={{ marginBottom: '16px' }}><label style={LABEL}>Return Policy</label><textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={form.return_policy} onChange={e => u('return_policy', e.target.value)} /></div>
        <div><label style={LABEL}>Shipping Policy</label><textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={form.shipping_policy} onChange={e => u('shipping_policy', e.target.value)} /></div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        backgroundColor: saved ? '#22c55e' : '#111', color: '#fff',
        border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)', fontSize: '0.78rem',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '14px 32px', fontWeight: 600, borderRadius: '4px',
        transition: 'background-color 0.3s',
      }}>
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  )
}
