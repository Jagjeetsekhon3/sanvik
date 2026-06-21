'use client'

import { useState } from 'react'
import { Tenant } from '@/types'

// Define styles OUTSIDE component to prevent re-render resets
const INPUT: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #e5e5e5', borderRadius: '4px',
  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
  backgroundColor: '#fff', color: '#111', outline: 'none',
}
const LABEL: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '0.68rem',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#888', display: 'block', marginBottom: '6px',
}
const SECTION: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: '8px',
  border: '1px solid #eee', padding: '24px', marginBottom: '20px',
}
const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
  letterSpacing: '0.12em', textTransform: 'uppercase',
  color: '#999', margin: '0 0 20px',
}

export default function SettingsForm({ tenant }: { tenant: Tenant }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Individual state fields — avoids stale closure issues
  const [brandName, setBrandName] = useState(tenant.brand_name)
  const [tagline, setTagline] = useState(tenant.tagline || '')
  const [about, setAbout] = useState(tenant.about || '')
  const [contactEmail, setContactEmail] = useState(tenant.contact_email || '')
  const [instagramUrl, setInstagramUrl] = useState(tenant.instagram_url || '')
  const [instagramUsername, setInstagramUsername] = useState(tenant.instagram_username || '')
  const [instagramAccessToken, setInstagramAccessToken] = useState(tenant.instagram_access_token || '')
  const [instagramShowFeed, setInstagramShowFeed] = useState(tenant.instagram_show_feed || false)
  const [instagramFeedTitle, setInstagramFeedTitle] = useState(tenant.instagram_feed_title || 'Follow Us on Instagram')
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '')
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color)
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondary_color)
  const [accentColor, setAccentColor] = useState(tenant.accent_color)
  const [bgColor, setBgColor] = useState(tenant.background_color)
  const [textColor, setTextColor] = useState(tenant.text_color)
  const [fontHeading, setFontHeading] = useState(tenant.font_heading)
  const [fontBody, setFontBody] = useState(tenant.font_body)
  const [currency, setCurrency] = useState(tenant.currency)
  const [codEnabled, setCodEnabled] = useState(tenant.cod_enabled)
  const [razorpayKeyId, setRazorpayKeyId] = useState(tenant.razorpay_key_id || '')
  const [razorpaySecret, setRazorpaySecret] = useState(tenant.razorpay_key_secret || '')
  const [stripePublishable, setStripePublishable] = useState(tenant.stripe_publishable_key || '')
  const [stripeSecret, setStripeSecret] = useState(tenant.stripe_secret_key || '')
  const [paypalClientId, setPaypalClientId] = useState(tenant.paypal_client_id || '')
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(tenant.cloudinary_cloud_name || '')
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState(tenant.cloudinary_api_key || '')
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState(tenant.cloudinary_api_secret || '')
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(tenant.cloudinary_upload_preset || '')
  const [returnPolicy, setReturnPolicy] = useState(tenant.return_policy || '')
  const [shippingPolicy, setShippingPolicy] = useState(tenant.shipping_policy || '')

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const payload = {
      brand_name: brandName,
      tagline,
      about,
      contact_email: contactEmail,
      instagram_url: instagramUrl,
      instagram_username: instagramUsername,
      instagram_access_token: instagramAccessToken,
      instagram_show_feed: instagramShowFeed,
      instagram_feed_title: instagramFeedTitle,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      background_color: bgColor,
      text_color: textColor,
      font_heading: fontHeading,
      font_body: fontBody,
      currency,
      cod_enabled: codEnabled,
      razorpay_key_id: razorpayKeyId,
      razorpay_key_secret: razorpaySecret,
      stripe_publishable_key: stripePublishable,
      stripe_secret_key: stripeSecret,
      paypal_client_id: paypalClientId,
      cloudinary_cloud_name: cloudinaryCloudName,
      cloudinary_api_key: cloudinaryApiKey,
      cloudinary_api_secret: cloudinaryApiSecret,
      cloudinary_upload_preset: cloudinaryUploadPreset,
      return_policy: returnPolicy,
      shipping_policy: shippingPolicy,
    }

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setSaving(false)

    if (res.ok) {
      setSaved(true)
      setTimeout(() => {
        window.location.href = '/master-admin/settings'
      }, 1000)
    } else {
      setError(data.error || 'Failed to save')
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
          {error}
        </div>
      )}

      {/* Brand */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Brand</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={LABEL}>Brand Name</label>
            <input style={INPUT} value={brandName} onChange={e => setBrandName(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Tagline</label>
            <input style={INPUT} value={tagline} onChange={e => setTagline(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>Logo URL (Cloudinary)</label>
          <input style={INPUT} value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>About</label>
          <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={about} onChange={e => setAbout(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={LABEL}>Contact Email</label>
            <input style={INPUT} value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Instagram URL</label>
            <input style={INPUT} value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Theme Colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '16px' }}>
          {[
            { label: 'Primary', value: primaryColor, set: setPrimaryColor },
            { label: 'Secondary', value: secondaryColor, set: setSecondaryColor },
            { label: 'Accent', value: accentColor, set: setAccentColor },
            { label: 'Background', value: bgColor, set: setBgColor },
            { label: 'Text', value: textColor, set: setTextColor },
          ].map(c => (
            <div key={c.label}>
              <label style={LABEL}>{c.label}</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="color" value={c.value} onChange={e => c.set(e.target.value)}
                  style={{ width: '40px', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '2px' }} />
                <input style={{ ...INPUT, flex: 1, fontSize: '0.72rem', padding: '10px 8px' }}
                  value={c.value} onChange={e => c.set(e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={LABEL}>Heading Font</label>
            <input style={INPUT} value={fontHeading} onChange={e => setFontHeading(e.target.value)} placeholder="Playfair Display" />
          </div>
          <div>
            <label style={LABEL}>Body Font</label>
            <input style={INPUT} value={fontBody} onChange={e => setFontBody(e.target.value)} placeholder="Inter" />
          </div>
        </div>
      </div>

      {/* Payments */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Payments</h2>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={codEnabled} onChange={e => setCodEnabled(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#444' }}>Enable Cash on Delivery</span>
          </label>
          <div>
            <label style={{ ...LABEL, display: 'inline', marginRight: '8px' }}>Currency</label>
            <select style={{ ...INPUT, width: 'auto', cursor: 'pointer' }} value={currency} onChange={e => setCurrency(e.target.value as 'INR' | 'USD' | 'BOTH')}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={LABEL}>Razorpay Key ID</label>
            <input style={INPUT} value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} placeholder="rzp_live_..." />
          </div>
          <div>
            <label style={LABEL}>Razorpay Secret</label>
            <input style={INPUT} type="password" value={razorpaySecret} onChange={e => setRazorpaySecret(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={LABEL}>Stripe Publishable Key</label>
            <input style={INPUT} value={stripePublishable} onChange={e => setStripePublishable(e.target.value)} placeholder="pk_live_..." />
          </div>
          <div>
            <label style={LABEL}>Stripe Secret Key</label>
            <input style={INPUT} type="password" value={stripeSecret} onChange={e => setStripeSecret(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div>
          <label style={LABEL}>PayPal Client ID</label>
          <input style={INPUT} value={paypalClientId} onChange={e => setPaypalClientId(e.target.value)} placeholder="PayPal client ID" />
        </div>
        {/* Instagram Feed */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <input type='checkbox' checked={instagramShowFeed} onChange={e => setInstagramShowFeed(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#444' }}>Show Instagram feed on homepage</span>
          </div>
          {instagramShowFeed && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={LABEL}>Instagram Username</label><input style={INPUT} value={instagramUsername} onChange={e => setInstagramUsername(e.target.value)} placeholder='@yourbrand' /></div>
              <div><label style={LABEL}>Feed Section Title</label><input style={INPUT} value={instagramFeedTitle} onChange={e => setInstagramFeedTitle(e.target.value)} placeholder='Follow Us on Instagram' /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Instagram Access Token (for live feed)</label>
                <input style={{ ...INPUT, fontFamily: 'monospace' }} type='password' value={instagramAccessToken} onChange={e => setInstagramAccessToken(e.target.value)} placeholder='Get from developers.facebook.com' />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#aaa', margin: '4px 0 0' }}>Optional — without token, section shows username + follow button only</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cloudinary */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Cloudinary (Media)</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: '0 0 16px' }}>
          Required for Media Gallery — get keys from cloudinary.com/console
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={LABEL}>Cloud Name</label>
            <input style={INPUT} value={cloudinaryCloudName} onChange={e => setCloudinaryCloudName(e.target.value)} placeholder="your-cloud-name" />
          </div>
          <div>
            <label style={LABEL}>Upload Preset (optional)</label>
            <input style={INPUT} value={cloudinaryUploadPreset} onChange={e => setCloudinaryUploadPreset(e.target.value)} placeholder="ml_default" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={LABEL}>API Key</label>
            <input style={INPUT} value={cloudinaryApiKey} onChange={e => setCloudinaryApiKey(e.target.value)} placeholder="123456789012345" />
          </div>
          <div>
            <label style={LABEL}>API Secret</label>
            <input style={{ ...INPUT, fontFamily: 'monospace' }} type="password" value={cloudinaryApiSecret} onChange={e => setCloudinaryApiSecret(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
      </div>

      {/* Policies */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Policies</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>Return Policy</label>
          <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} />
        </div>
        <div>
          <label style={LABEL}>Shipping Policy</label>
          <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={shippingPolicy} onChange={e => setShippingPolicy(e.target.value)} />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        backgroundColor: saved ? '#22c55e' : '#111',
        color: '#fff', border: 'none',
        cursor: saving ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '14px 32px', fontWeight: 600, borderRadius: '4px',
        transition: 'background-color 0.3s', opacity: saving ? 0.7 : 1,
      }}>
        {saving ? 'Saving...' : saved ? '✓ Saved — Reloading...' : 'Save Settings'}
      </button>
    </div>
  )
}
