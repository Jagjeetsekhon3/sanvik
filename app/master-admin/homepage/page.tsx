'use client'

import { useState, useEffect } from 'react'
import { HomeSection, SectionType } from '@/types'
import { v4 as uuid } from 'uuid'

const SECTION_LABELS: Record<SectionType, string> = {
  banner: '🎨 Hero Banner',
  featured_products: '⭐ Featured Products',
  new_arrivals: '✨ New Arrivals',
  category_grid: '🗂 Category Grid',
  instagram_feed: '📸 Instagram Feed',
  brand_story: '📖 Brand Story',
  text_block: '📝 Text Block',
  image_banner: '🖼 Image Banner',
  video_banner: '🎬 Video Banner',
}

const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  banner: 'Hero with heading, image, and CTA buttons',
  featured_products: 'Grid of featured products',
  new_arrivals: 'Latest products in a grid',
  category_grid: 'Category tiles with images',
  instagram_feed: 'Instagram posts grid',
  brand_story: 'Brand quote / about section',
  text_block: 'Custom text with optional heading',
  image_banner: 'Full-width image with optional text overlay',
  video_banner: 'Video background section',
}

const INPUT: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', display: 'block', marginBottom: '4px' }

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)

  useEffect(() => {
    fetch('/api/admin/homepage').then(r => r.json()).then(d => {
      setSections(d.sections || [])
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/admin/homepage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const moveSection = (index: number, dir: 'up' | 'down') => {
    const next = [...sections]
    const swap = dir === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setSections(next)
  }

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const updateSection = (id: string, updates: Partial<HomeSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const addSection = (type: SectionType) => {
    const newSection: HomeSection = { id: uuid(), type, enabled: true }
    setSections(prev => [...prev, newSection])
    setShowAddPanel(false)
    setExpandedId(newSection.id)
  }

  const renderSectionSettings = (section: HomeSection) => {
    switch (section.type) {
      case 'featured_products':
      case 'new_arrivals':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
            <div><label style={LABEL}>Section Title</label><input style={INPUT} value={section.title || ''} onChange={e => updateSection(section.id, { title: e.target.value })} placeholder="Featured" /></div>
            <div><label style={LABEL}>Limit</label><input style={INPUT} type="number" value={section.limit || 4} onChange={e => updateSection(section.id, { limit: parseInt(e.target.value) || 4 })} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={LABEL}>Filter by Category (optional)</label><input style={INPUT} value={section.category || ''} onChange={e => updateSection(section.id, { category: e.target.value })} placeholder="Tops, Dresses..." /></div>
          </div>
        )
      case 'brand_story':
        return (
          <div>
            <div style={{ marginBottom: '10px' }}><label style={LABEL}>Heading</label><input style={INPUT} value={section.heading || ''} onChange={e => updateSection(section.id, { heading: e.target.value })} placeholder="Crafted with intention." /></div>
            <div style={{ marginBottom: '10px' }}><label style={LABEL}>Body Text</label><textarea style={{ ...INPUT, minHeight: '70px', resize: 'vertical' }} value={section.body || ''} onChange={e => updateSection(section.id, { body: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={LABEL}>BG Color</label><input type="color" value={section.bg_color || '#0f0f0f'} onChange={e => updateSection(section.id, { bg_color: e.target.value })} style={{ width: '100%', height: '34px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
              <div><label style={LABEL}>Text Color</label><input type="color" value={section.text_color || '#ffffff'} onChange={e => updateSection(section.id, { text_color: e.target.value })} style={{ width: '100%', height: '34px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }} /></div>
            </div>
          </div>
        )
      case 'text_block':
        return (
          <div>
            <div style={{ marginBottom: '10px' }}><label style={LABEL}>Heading (optional)</label><input style={INPUT} value={section.heading || ''} onChange={e => updateSection(section.id, { heading: e.target.value })} /></div>
            <div style={{ marginBottom: '10px' }}><label style={LABEL}>Content</label><textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={section.content || ''} onChange={e => updateSection(section.id, { content: e.target.value })} /></div>
            <div>
              <label style={LABEL}>Alignment</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['left', 'center', 'right'] as const).map(a => (
                  <button key={a} onClick={() => updateSection(section.id, { align: a })} style={{ flex: 1, padding: '6px', border: '1px solid', borderColor: (section.align || 'center') === a ? '#111' : '#e5e5e5', borderRadius: '4px', cursor: 'pointer', backgroundColor: (section.align || 'center') === a ? '#111' : '#fff', color: (section.align || 'center') === a ? '#fff' : '#666', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', textTransform: 'capitalize' }}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        )
      case 'image_banner':
        return (
          <div>
            <div style={{ marginBottom: '10px' }}><label style={LABEL}>Image URL</label><input style={INPUT} value={section.image_url || ''} onChange={e => updateSection(section.id, { image_url: e.target.value })} placeholder="https://res.cloudinary.com/..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div><label style={LABEL}>Heading (optional)</label><input style={INPUT} value={section.heading || ''} onChange={e => updateSection(section.id, { heading: e.target.value })} /></div>
              <div><label style={LABEL}>Min Height (px)</label><input style={INPUT} type="number" value={section.min_height || 400} onChange={e => updateSection(section.id, { min_height: parseInt(e.target.value) || 400 })} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={LABEL}>CTA Label</label><input style={INPUT} value={section.cta_label || ''} onChange={e => updateSection(section.id, { cta_label: e.target.value })} placeholder="Shop Now" /></div>
              <div><label style={LABEL}>CTA Link</label><input style={INPUT} value={section.cta_href || ''} onChange={e => updateSection(section.id, { cta_href: e.target.value })} placeholder="/shop" /></div>
            </div>
          </div>
        )
      case 'video_banner':
        return (
          <div>
            <div style={{ marginBottom: '10px' }}><label style={LABEL}>Video URL (Cloudinary or external)</label><input style={INPUT} value={section.video_url || ''} onChange={e => updateSection(section.id, { video_url: e.target.value })} placeholder="https://res.cloudinary.com/.../video.mp4" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
              <div><label style={LABEL}>Overlay Heading</label><input style={INPUT} value={section.heading || ''} onChange={e => updateSection(section.id, { heading: e.target.value })} /></div>
              <div><label style={LABEL}>Min Height (px)</label><input style={INPUT} type="number" value={section.min_height || 500} onChange={e => updateSection(section.id, { min_height: parseInt(e.target.value) || 500 })} /></div>
            </div>
          </div>
        )
      case 'category_grid':
        return (
          <div>
            <div><label style={LABEL}>Section Title</label><input style={INPUT} value={section.title || ''} onChange={e => updateSection(section.id, { title: e.target.value })} placeholder="Shop by Category" /></div>
          </div>
        )
      case 'banner':
        return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Configure in <a href="/master-admin/banner" style={{ color: '#3b82f6' }}>Banner Settings</a></p>
      case 'instagram_feed':
        return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Configure in <a href="/master-admin/settings" style={{ color: '#3b82f6' }}>Settings → Instagram</a></p>
      default:
        return null
    }
  }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Homepage Builder</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Drag sections to reorder · Toggle to show/hide</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saved ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 28px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Layout'}
        </button>
      </div>

      {/* Sections list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {sections.map((section, idx) => (
          <div key={section.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: `1px solid ${section.enabled ? '#e5e5e5' : '#f0f0f0'}`, overflow: 'hidden', opacity: section.enabled ? 1 : 0.55 }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
              {/* Move */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: '1px solid #eee', borderRadius: '3px', cursor: 'pointer', padding: '1px 5px', fontSize: '0.55rem', color: '#888', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                <button onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1} style={{ background: 'none', border: '1px solid #eee', borderRadius: '3px', cursor: 'pointer', padding: '1px 5px', fontSize: '0.55rem', color: '#888', opacity: idx === sections.length - 1 ? 0.3 : 1 }}>▼</button>
              </div>

              {/* Toggle */}
              <button onClick={() => toggleSection(section.id)} style={{ width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: section.enabled ? '#22c55e' : '#ddd', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: '2px', left: section.enabled ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s' }} />
              </button>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#111', margin: '0 0 1px' }}>{SECTION_LABELS[section.type]}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#bbb', margin: 0 }}>{SECTION_DESCRIPTIONS[section.type]}</p>
              </div>

              {/* Expand / Delete */}
              <button onClick={() => setExpandedId(expandedId === section.id ? null : section.id)} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#666' }}>
                {expandedId === section.id ? 'Close ↑' : 'Edit ↓'}
              </button>
              <button onClick={() => removeSection(section.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem', padding: '0 4px' }}>✕</button>
            </div>

            {/* Expanded settings */}
            {expandedId === section.id && (
              <div style={{ padding: '0 16px 16px 60px', borderTop: '1px solid #f5f5f5' }}>
                <div style={{ paddingTop: '14px' }}>
                  {renderSectionSettings(section)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add section */}
      {showAddPanel ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#111', margin: 0 }}>Add Section</p>
            <button onClick={() => setShowAddPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.9rem' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {(Object.keys(SECTION_LABELS) as SectionType[]).map(type => (
              <button key={type} onClick={() => addSection(type)} style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', cursor: 'pointer', background: 'none', textAlign: 'left' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{SECTION_LABELS[type]}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#bbb', margin: 0 }}>{SECTION_DESCRIPTIONS[type]}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddPanel(true)} style={{ width: '100%', padding: '13px', border: '2px dashed #e5e5e5', borderRadius: '8px', background: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#aaa' }}>
          + Add Section
        </button>
      )}
    </div>
  )
}
