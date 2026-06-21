'use client'

import { useState, useEffect, useRef } from 'react'
import { useTenant } from '@/components/TenantProvider'

const INPUT: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '5px' }
const SECTION: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '22px', marginBottom: '16px' }
const SECTION_TITLE: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 18px' }

export default function BannerSettingsPage() {
  const tenant = useTenant()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [enabled, setEnabled] = useState(true)
  const [layout, setLayout] = useState<'full' | 'split' | 'minimal'>('full')
  const [bgColor, setBgColor] = useState('#0f0f0f')
  const [bgImageUrl, setBgImageUrl] = useState('')
  const [bgOverlay, setBgOverlay] = useState(0.4)
  const [heading, setHeading] = useState('New Collection')
  const [subheading, setSubheading] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [badgeText, setBadgeText] = useState('')
  const [ctaLabel, setCtaLabel] = useState('Shop Now')
  const [ctaHref, setCtaHref] = useState('/shop')
  const [ctaColor, setCtaColor] = useState('#c8a96e')
  const [cta2Label, setCta2Label] = useState('')
  const [cta2Href, setCta2Href] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center')
  const [minHeight, setMinHeight] = useState(100)

  useEffect(() => {
    fetch('/api/admin/banner').then(r => r.json()).then(d => {
      setEnabled(d.enabled ?? true)
      setLayout(d.layout || 'full')
      setBgColor(d.bg_color || '#0f0f0f')
      setBgImageUrl(d.bg_image_url || '')
      setBgOverlay(d.bg_overlay ?? 0.4)
      setHeading(d.heading || 'New Collection')
      setSubheading(d.subheading || '')
      setBodyText(d.body_text || '')
      setBadgeText(d.badge_text || '')
      setCtaLabel(d.cta_label || 'Shop Now')
      setCtaHref(d.cta_href || '/shop')
      setCtaColor(d.cta_color || '#c8a96e')
      setCta2Label(d.cta2_label || '')
      setCta2Href(d.cta2_href || '')
      setTextColor(d.text_color || '#ffffff')
      setTextAlign(d.text_align || 'center')
      setMinHeight(d.min_height || 100)
      setLoading(false)
    })
  }, [])

  const handleBgUpload = async (file: File) => {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    setUploading(false)
    if (data.url) setBgImageUrl(data.url)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/admin/banner', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled, layout, bg_color: bgColor, bg_image_url: bgImageUrl || null,
        bg_overlay: bgOverlay, heading, subheading: subheading || null,
        body_text: bodyText || null, badge_text: badgeText || null,
        cta_label: ctaLabel, cta_href: ctaHref, cta_color: ctaColor,
        cta2_label: cta2Label || null, cta2_href: cta2Href || null,
        text_color: textColor, text_align: textAlign, min_height: minHeight,
      }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>

  // Live preview
  const previewStyle: React.CSSProperties = {
    position: 'relative', overflow: 'hidden', borderRadius: '8px',
    backgroundColor: bgColor, minHeight: '240px',
    display: 'flex', alignItems: 'center', justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
    marginBottom: '20px',
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Banner Settings</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Configure your hero banner</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saved ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 28px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Banner'}
        </button>
      </div>

      {/* Live preview */}
      <div style={previewStyle}>
        {bgImageUrl && <img src={bgImageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        {bgImageUrl && <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, opacity: bgOverlay }} />}
        <div style={{ position: 'relative', zIndex: 1, textAlign, padding: '40px', maxWidth: '600px' }}>
          {badgeText && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: ctaColor, margin: '0 0 12px' }}>{badgeText}</p>}
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 700, color: textColor, margin: '0 0 12px', lineHeight: 1 }}>{heading || 'Heading'}</h1>
          {subheading && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: textColor, opacity: 0.6, margin: '0 0 8px' }}>{subheading}</p>}
          {bodyText && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: textColor, opacity: 0.5, margin: '0 0 20px' }}>{bodyText}</p>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
            {ctaLabel && <span style={{ backgroundColor: ctaColor, color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '11px 28px', fontWeight: 600 }}>{ctaLabel}</span>}
            {cta2Label && <span style={{ border: `1px solid ${textColor}`, color: textColor, fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '11px 28px', opacity: 0.6 }}>{cta2Label}</span>}
          </div>
        </div>
      </div>

      {/* Enable/Layout */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>General</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#444' }}>Show banner on homepage</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {(['full', 'split', 'minimal'] as const).map(l => (
            <button key={l} onClick={() => setLayout(l)} style={{ padding: '10px', border: '1px solid', borderColor: layout === l ? '#111' : '#e5e5e5', borderRadius: '4px', cursor: 'pointer', backgroundColor: layout === l ? '#111' : '#fff', color: layout === l ? '#fff' : '#666', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', textTransform: 'capitalize' }}>
              {l === 'full' ? 'Full Screen' : l === 'split' ? 'Split (50/50)' : 'Minimal'}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', alignItems: 'end' }}>
          <div><label style={LABEL}>Height (vh)</label><input style={INPUT} type="number" value={minHeight} onChange={e => setMinHeight(parseInt(e.target.value) || 100)} /></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} onClick={() => setTextAlign(a)} style={{ flex: 1, padding: '9px', border: '1px solid', borderColor: textAlign === a ? '#111' : '#e5e5e5', borderRadius: '4px', cursor: 'pointer', backgroundColor: textAlign === a ? '#111' : '#fff', color: textAlign === a ? '#fff' : '#666', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Background */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Background</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>Background Image</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input style={{ ...INPUT, flex: 1 }} value={bgImageUrl} onChange={e => setBgImageUrl(e.target.value)} placeholder="Paste Cloudinary URL or upload below" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '9px 16px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#555', whiteSpace: 'nowrap' }}>
              {uploading ? 'Uploading...' : '📁 Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleBgUpload(e.target.files[0])} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={LABEL}>BG Color</label>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} />
          </div>
          <div>
            <label style={LABEL}>Image Overlay Opacity (0–1)</label>
            <input style={INPUT} type="number" min="0" max="1" step="0.05" value={bgOverlay} onChange={e => setBgOverlay(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={LABEL}>Text Color</label>
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Content</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Badge Text (above heading)</label><input style={INPUT} value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="New Collection" /></div>
          <div><label style={LABEL}>Heading *</label><input style={INPUT} value={heading} onChange={e => setHeading(e.target.value)} placeholder="Wear the silence." /></div>
        </div>
        <div style={{ marginBottom: '16px' }}><label style={LABEL}>Subheading</label><input style={INPUT} value={subheading} onChange={e => setSubheading(e.target.value)} placeholder="Optional subtitle" /></div>
        <div><label style={LABEL}>Body Text</label><textarea style={{ ...INPUT, minHeight: '70px', resize: 'vertical' }} value={bodyText} onChange={e => setBodyText(e.target.value)} placeholder="A short description..." /></div>
      </div>

      {/* CTAs */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Buttons</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '12px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Primary Button Label</label><input style={INPUT} value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="Shop Now" /></div>
          <div><label style={LABEL}>Primary Button Link</label><input style={INPUT} value={ctaHref} onChange={e => setCtaHref(e.target.value)} placeholder="/shop" /></div>
          <div><label style={LABEL}>Button Color</label><input type="color" value={ctaColor} onChange={e => setCtaColor(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={LABEL}>Secondary Button Label (optional)</label><input style={INPUT} value={cta2Label} onChange={e => setCta2Label(e.target.value)} placeholder="New Arrivals" /></div>
          <div><label style={LABEL}>Secondary Button Link</label><input style={INPUT} value={cta2Href} onChange={e => setCta2Href(e.target.value)} placeholder="/shop?category=new" /></div>
        </div>
      </div>
    </div>
  )
}
