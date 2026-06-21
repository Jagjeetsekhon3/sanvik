'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/components/TenantProvider'

const INPUT: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '5px' }
const SECTION: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '22px', marginBottom: '16px' }
const SECTION_TITLE: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 18px' }
const TOGGLE = (on: boolean): React.CSSProperties => ({
  width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
  backgroundColor: on ? '#22c55e' : '#ddd', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
})

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={TOGGLE(value)}>
      <span style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s' }} />
    </button>
  )
}

export default function HeaderBuilderPage() {
  const tenant = useTenant()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [logoType, setLogoType] = useState<'text' | 'image'>('text')
  const [logoText, setLogoText] = useState(tenant.brand_name)
  const [logoImageUrl, setLogoImageUrl] = useState('')
  const [logoSize, setLogoSize] = useState(32)
  const [sticky, setSticky] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementBg, setAnnouncementBg] = useState('#000000')
  const [announcementColor, setAnnouncementColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('transparent')
  const [bgScrolled, setBgScrolled] = useState('#ffffff')
  const [textColor, setTextColor] = useState('#111111')
  const [borderBottom, setBorderBottom] = useState(true)
  const [height, setHeight] = useState(64)

  useEffect(() => {
    fetch('/api/admin/header').then(r => r.json()).then(d => {
      if (d.logo_type) setLogoType(d.logo_type)
      if (d.logo_text) setLogoText(d.logo_text)
      if (d.logo_image_url) setLogoImageUrl(d.logo_image_url)
      if (d.logo_size) setLogoSize(d.logo_size)
      setSticky(d.sticky ?? true)
      setShowSearch(d.show_search ?? false)
      setShowAnnouncement(d.show_announcement ?? false)
      if (d.announcement_text) setAnnouncementText(d.announcement_text)
      if (d.announcement_bg) setAnnouncementBg(d.announcement_bg)
      if (d.announcement_color) setAnnouncementColor(d.announcement_color)
      if (d.bg_color) setBgColor(d.bg_color)
      if (d.bg_scrolled) setBgScrolled(d.bg_scrolled)
      if (d.text_color) setTextColor(d.text_color)
      setBorderBottom(d.border_bottom ?? true)
      if (d.height) setHeight(d.height)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/admin/header', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logo_type: logoType, logo_text: logoText, logo_image_url: logoImageUrl,
        logo_size: logoSize, sticky, show_search: showSearch,
        show_announcement: showAnnouncement, announcement_text: announcementText,
        announcement_bg: announcementBg, announcement_color: announcementColor,
        bg_color: bgColor, bg_scrolled: bgScrolled, text_color: textColor,
        border_bottom: borderBottom, height,
      }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Header Builder</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Customise your store header</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saved ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 28px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Header'}
        </button>
      </div>

      {/* Live preview */}
      <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
        {showAnnouncement && announcementText && (
          <div style={{ backgroundColor: announcementBg, color: announcementColor, padding: '8px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
            {announcementText}
          </div>
        )}
        <div style={{ height: `${height}px`, backgroundColor: bgColor === 'transparent' ? '#fff' : bgColor, borderBottom: borderBottom ? '1px solid rgba(0,0,0,0.08)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Shop', 'New', 'Sale'].map(l => <span key={l} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: textColor, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</span>)}
          </div>
          {logoType === 'image' && logoImageUrl ? (
            <img src={logoImageUrl} alt="Logo" style={{ height: `${logoSize}px`, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: `${Math.max(logoSize * 0.4, 14)}px`, fontWeight: 700, color: textColor, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {logoText || tenant.brand_name}
            </span>
          )}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {showSearch && <span style={{ color: textColor, opacity: 0.6, fontSize: '0.8rem' }}>🔍</span>}
            <span style={{ color: textColor, opacity: 0.6, fontSize: '0.8rem' }}>👤</span>
            <span style={{ color: textColor, opacity: 0.6, fontSize: '0.8rem' }}>🛍</span>
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Announcement Bar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Toggle value={showAnnouncement} onChange={setShowAnnouncement} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#444' }}>Show announcement bar</span>
        </div>
        {showAnnouncement && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '12px' }}>
            <div><label style={LABEL}>Text</label><input style={INPUT} value={announcementText} onChange={e => setAnnouncementText(e.target.value)} placeholder="Free shipping on orders above ₹999" /></div>
            <div><label style={LABEL}>Background</label><input type="color" value={announcementBg} onChange={e => setAnnouncementBg(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
            <div><label style={LABEL}>Text Color</label><input type="color" value={announcementColor} onChange={e => setAnnouncementColor(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
          </div>
        )}
      </div>

      {/* Logo */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Logo</h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['text', 'image'] as const).map(t => (
            <button key={t} onClick={() => setLogoType(t)} style={{ padding: '8px 20px', border: '1px solid', borderColor: logoType === t ? '#111' : '#e5e5e5', borderRadius: '4px', cursor: 'pointer', backgroundColor: logoType === t ? '#111' : '#fff', color: logoType === t ? '#fff' : '#666', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
        {logoType === 'text' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
            <div><label style={LABEL}>Logo Text</label><input style={INPUT} value={logoText} onChange={e => setLogoText(e.target.value)} /></div>
            <div><label style={LABEL}>Size (px)</label><input style={INPUT} type="number" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value) || 32)} /></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
            <div><label style={LABEL}>Image URL (Cloudinary)</label><input style={INPUT} value={logoImageUrl} onChange={e => setLogoImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." /></div>
            <div><label style={LABEL}>Height (px)</label><input style={INPUT} type="number" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value) || 32)} /></div>
          </div>
        )}
      </div>

      {/* Style */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Style</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Height (px)</label><input style={INPUT} type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 64)} /></div>
          <div><label style={LABEL}>BG Color</label><input type="color" value={bgColor === 'transparent' ? '#ffffff' : bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
          <div><label style={LABEL}>BG Scrolled</label><input type="color" value={bgScrolled} onChange={e => setBgScrolled(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
          <div><label style={LABEL}>Text Color</label><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'Sticky header', value: sticky, set: setSticky },
            { label: 'Show border bottom', value: borderBottom, set: setBorderBottom },
            { label: 'Show search icon', value: showSearch, set: setShowSearch },
          ].map(t => (
            <label key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Toggle value={t.value} onChange={t.set} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#444' }}>{t.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
