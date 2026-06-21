'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/components/TenantProvider'
import { FooterColumn } from '@/types'
import { v4 as uuid } from 'uuid'

const INPUT: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '5px' }
const SECTION: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '22px', marginBottom: '16px' }
const SECTION_TITLE: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 18px' }

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      <button onClick={() => onChange(!value)} style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', backgroundColor: value ? '#22c55e' : '#ddd', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s' }} />
      </button>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#444' }}>{label}</span>
    </label>
  )
}

export default function FooterBuilderPage() {
  const tenant = useTenant()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [bgColor, setBgColor] = useState('#111111')
  const [textColor, setTextColor] = useState('#ffffff')
  const [showLogo, setShowLogo] = useState(true)
  const [showTagline, setShowTagline] = useState(true)
  const [showSocials, setShowSocials] = useState(true)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [newsletterText, setNewsletterText] = useState('Subscribe to our newsletter')
  const [columns, setColumns] = useState<FooterColumn[]>([])
  const [bottomText, setBottomText] = useState('')
  const [showPayments, setShowPayments] = useState(true)

  useEffect(() => {
    fetch('/api/admin/footer').then(r => r.json()).then(d => {
      setBgColor(d.bg_color || '#111111')
      setTextColor(d.text_color || '#ffffff')
      setShowLogo(d.show_logo ?? true)
      setShowTagline(d.show_tagline ?? true)
      setShowSocials(d.show_socials ?? true)
      setShowNewsletter(d.show_newsletter ?? false)
      setNewsletterText(d.newsletter_text || 'Subscribe to our newsletter')
      setColumns(d.columns || [])
      setBottomText(d.bottom_text || '')
      setShowPayments(d.show_payments ?? true)
      setLoading(false)
    })
  }, [])

  const addColumn = () => setColumns(prev => [...prev, { id: uuid(), title: '', links: [] }])
  const updateColumn = (id: string, title: string) => setColumns(prev => prev.map(c => c.id === id ? { ...c, title } : c))
  const removeColumn = (id: string) => setColumns(prev => prev.filter(c => c.id !== id))
  const addLink = (colId: string) => setColumns(prev => prev.map(c => c.id === colId ? { ...c, links: [...c.links, { label: '', href: '/' }] } : c))
  const updateLink = (colId: string, idx: number, field: 'label' | 'href', val: string) =>
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, links: c.links.map((l, i) => i === idx ? { ...l, [field]: val } : l) } : c))
  const removeLink = (colId: string, idx: number) =>
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, links: c.links.filter((_, i) => i !== idx) } : c))

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/admin/footer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bg_color: bgColor, text_color: textColor, show_logo: showLogo, show_tagline: showTagline, show_socials: showSocials, show_newsletter: showNewsletter, newsletter_text: newsletterText, columns, bottom_text: bottomText, show_payments: showPayments }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Footer Builder</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Customise your store footer</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saved ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 28px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Footer'}
        </button>
      </div>

      {/* Preview */}
      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee', marginBottom: '20px', backgroundColor: bgColor, padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `${showLogo ? '2fr ' : ''}${columns.map(() => '1fr').join(' ')}`, gap: '32px', marginBottom: '24px' }}>
          {showLogo && (
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: textColor, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 6px' }}>{tenant.brand_name}</p>
              {showTagline && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: textColor, opacity: 0.4, margin: 0 }}>{tenant.tagline}</p>}
            </div>
          )}
          {columns.map(col => (
            <div key={col.id}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: textColor, opacity: 0.35, margin: '0 0 10px' }}>{col.title || 'Column'}</p>
              {col.links.map((link, i) => <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: textColor, opacity: 0.55, margin: '0 0 6px' }}>{link.label || 'Link'}</p>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'},0.1)`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: textColor, opacity: 0.3, margin: 0 }}>{bottomText || `© ${new Date().getFullYear()} ${tenant.brand_name}`}</p>
          {showPayments && <div style={{ display: 'flex', gap: '6px' }}>
            {['VISA', 'MC', 'UPI'].map(p => <span key={p} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', padding: '2px 6px', border: `1px solid rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'},0.2)`, borderRadius: '2px', color: textColor, opacity: 0.4 }}>{p}</span>)}
          </div>}
        </div>
      </div>

      {/* Style */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Style</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Background Color</label>
            <div style={{ display: 'flex', gap: '8px' }}><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '44px', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /><input style={INPUT} value={bgColor} onChange={e => setBgColor(e.target.value)} /></div>
          </div>
          <div><label style={LABEL}>Text Color</label>
            <div style={{ display: 'flex', gap: '8px' }}><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: '44px', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /><input style={INPUT} value={textColor} onChange={e => setTextColor(e.target.value)} /></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <Toggle value={showLogo} onChange={setShowLogo} label="Show brand logo" />
          <Toggle value={showTagline} onChange={setShowTagline} label="Show tagline" />
          <Toggle value={showSocials} onChange={setShowSocials} label="Show social links" />
          <Toggle value={showPayments} onChange={setShowPayments} label="Show payment badges" />
        </div>
      </div>

      {/* Newsletter */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Newsletter</h2>
        <div style={{ marginBottom: '12px' }}><Toggle value={showNewsletter} onChange={setShowNewsletter} label="Show newsletter signup" /></div>
        {showNewsletter && <div><label style={LABEL}>Headline Text</label><input style={INPUT} value={newsletterText} onChange={e => setNewsletterText(e.target.value)} /></div>}
      </div>

      {/* Link columns */}
      <div style={SECTION}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ ...SECTION_TITLE, margin: 0 }}>Link Columns</h2>
          <button onClick={addColumn} style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666' }}>+ Add Column</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns.length, 3)}, 1fr)`, gap: '16px' }}>
          {columns.map(col => (
            <div key={col.id} style={{ border: '1px solid #f0f0f0', borderRadius: '6px', padding: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input style={{ ...INPUT, flex: 1 }} value={col.title} onChange={e => updateColumn(col.id, e.target.value)} placeholder="Column title" />
                <button onClick={() => removeColumn(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem' }}>✕</button>
              </div>
              {col.links.map((link, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 24px', gap: '6px', marginBottom: '6px' }}>
                  <input style={{ ...INPUT, fontSize: '0.78rem', padding: '7px 10px' }} value={link.label} onChange={e => updateLink(col.id, i, 'label', e.target.value)} placeholder="Label" />
                  <input style={{ ...INPUT, fontSize: '0.78rem', padding: '7px 10px' }} value={link.href} onChange={e => updateLink(col.id, i, 'href', e.target.value)} placeholder="/page" />
                  <button onClick={() => removeLink(col.id, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem' }}>✕</button>
                </div>
              ))}
              <button onClick={() => addLink(col.id)} style={{ background: 'none', border: '1px dashed #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '5px', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#aaa', marginTop: '4px' }}>+ Link</button>
            </div>
          ))}
        </div>
        {columns.length === 0 && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#ccc', margin: 0 }}>No columns yet — add one above</p>}
      </div>

      {/* Bottom bar */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Bottom Bar</h2>
        <div><label style={LABEL}>Copyright Text (leave blank for auto)</label><input style={INPUT} value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder={`© ${new Date().getFullYear()} ${tenant.brand_name}. All rights reserved.`} /></div>
      </div>
    </div>
  )
}
