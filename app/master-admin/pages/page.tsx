'use client'

import { useState, useEffect } from 'react'

interface Page {
  id: string; title: string; slug: string; content: string;
  meta_title: string; meta_desc: string; is_active: boolean; updated_at: string
}

const INPUT: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }

const DEFAULT_PAGES = [
  { title: 'About Us', slug: 'about', content: 'Tell your brand story here.' },
  { title: 'Shipping Policy', slug: 'shipping', content: 'We ship within 3–5 business days.' },
  { title: 'Return Policy', slug: 'returns', content: 'We accept returns within 30 days of purchase.' },
  { title: 'Contact', slug: 'contact', content: 'Get in touch with us.' },
  { title: 'Privacy Policy', slug: 'privacy', content: 'Your privacy matters to us.' },
]

export default function PagesAdminPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Page | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => { fetchPages() }, [])

  const fetchPages = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/pages')
    const data = await res.json()
    setPages(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const autoSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const openEdit = (page: Page) => {
    setEditing(page); setIsNew(false)
    setTitle(page.title); setSlug(page.slug)
    setContent(page.content || ''); setMetaTitle(page.meta_title || '')
    setMetaDesc(page.meta_desc || ''); setIsActive(page.is_active)
  }

  const openNew = (template?: { title: string; slug: string; content: string }) => {
    setEditing(null); setIsNew(true)
    setTitle(template?.title || ''); setSlug(template?.slug || '')
    setContent(template?.content || ''); setMetaTitle(''); setMetaDesc(''); setIsActive(true)
  }

  const closeEditor = () => { setEditing(null); setIsNew(false) }

  const handleSave = async () => {
    if (!title || !slug) return
    setSaving(true)
    const payload = { title, slug, content, meta_title: metaTitle, meta_desc: metaDesc, is_active: isActive }

    if (editing) {
      const res = await fetch('/api/admin/pages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      const data = await res.json()
      setPages(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } : p))
    } else {
      const res = await fetch('/api/admin/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.id) setPages(prev => [...prev, data])
    }

    setSaving(false); setSaved(true)
    setTimeout(() => { setSaved(false); closeEditor() }, 1000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return
    await fetch('/api/admin/pages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setPages(prev => prev.filter(p => p.id !== id))
  }

  const handleToggle = async (page: Page) => {
    await fetch('/api/admin/pages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: page.id, is_active: !page.is_active }) })
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, is_active: !p.is_active } : p))
  }

  // Editor view
  if (editing || isNew) {
    return (
      <div style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>
              {isNew ? 'New Page' : `Edit: ${editing?.title}`}
            </h1>
            {slug && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#aaa', margin: 0 }}>/{slug}</p>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={closeEditor} style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saved ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Page'}
            </button>
          </div>
        </div>

        {/* Basic info */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={LABEL}>Page Title *</label>
              <input style={INPUT} value={title} onChange={e => { setTitle(e.target.value); if (isNew) setSlug(autoSlug(e.target.value)) }} placeholder="About Us" />
            </div>
            <div>
              <label style={LABEL}>URL Slug *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e5e5', borderRadius: '4px', overflow: 'hidden' }}>
                <span style={{ padding: '10px 10px 10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#aaa', backgroundColor: '#f8f8f8', borderRight: '1px solid #e5e5e5', whiteSpace: 'nowrap' }}>/</span>
                <input style={{ ...INPUT, border: 'none', borderRadius: 0 }} value={slug} onChange={e => setSlug(e.target.value)} placeholder="about-us" />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#444' }}>Published (visible on site)</span>
          </div>
        </div>

        {/* Content editor */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '16px' }}>
          <label style={{ ...LABEL, marginBottom: '12px' }}>Page Content</label>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', padding: '8px', backgroundColor: '#f8f8f8', borderRadius: '4px', flexWrap: 'wrap' }}>
            {[
              { label: 'H1', wrap: ['# ', '\n'] },
              { label: 'H2', wrap: ['## ', '\n'] },
              { label: 'H3', wrap: ['### ', '\n'] },
              { label: 'B', wrap: ['**', '**'] },
              { label: 'I', wrap: ['_', '_'] },
              { label: '—', wrap: ['\n---\n', ''] },
              { label: '• List', wrap: ['\n- ', ''] },
              { label: 'Link', wrap: ['[', '](url)'] },
            ].map(btn => (
              <button key={btn.label} onClick={() => {
                const ta = document.getElementById('page-content') as HTMLTextAreaElement
                if (!ta) return
                const start = ta.selectionStart; const end = ta.selectionEnd
                const selected = content.substring(start, end)
                const newContent = content.substring(0, start) + btn.wrap[0] + selected + btn.wrap[1] + content.substring(end)
                setContent(newContent)
                setTimeout(() => { ta.focus(); ta.setSelectionRange(start + btn.wrap[0].length, end + btn.wrap[0].length) }, 0)
              }} style={{ padding: '4px 10px', border: '1px solid #e5e5e5', borderRadius: '3px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: btn.label === 'B' ? 700 : 400, fontStyle: btn.label === 'I' ? 'italic' : 'normal', backgroundColor: '#fff', color: '#444' }}>
                {btn.label}
              </button>
            ))}
          </div>

          <textarea
            id="page-content"
            style={{ ...INPUT, minHeight: '380px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.83rem', lineHeight: 1.6 }}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`Write your page content here using Markdown:\n\n# Heading 1\n## Heading 2\n\n**Bold text** and _italic text_\n\n- List item 1\n- List item 2\n\n[Link text](https://example.com)`}
          />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#bbb', margin: '6px 0 0' }}>Supports Markdown formatting</p>
        </div>

        {/* SEO */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 18px' }}>SEO (optional)</h2>
          <div style={{ marginBottom: '14px' }}>
            <label style={LABEL}>Meta Title</label>
            <input style={INPUT} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={title} />
          </div>
          <div>
            <label style={LABEL}>Meta Description</label>
            <textarea style={{ ...INPUT, minHeight: '70px', resize: 'vertical' }} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Short description for search engines..." />
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Pages</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>{pages.length} pages · Add to menu via Menu Builder</p>
        </div>
        <button onClick={() => openNew()} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
          + New Page
        </button>
      </div>

      {/* Quick create from templates */}
      {pages.length === 0 && !loading && (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#111', margin: '0 0 14px' }}>Quick create from templates:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {DEFAULT_PAGES.map(t => (
              <button key={t.slug} onClick={() => openNew(t)} style={{ padding: '8px 16px', border: '1px solid #e5e5e5', borderRadius: '20px', cursor: 'pointer', background: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#555' }}>
                + {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pages list */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 160px', padding: '12px 20px', borderBottom: '1px solid #eee', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
          <span>Title</span><span>Slug</span><span>Status</span><span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
            No pages yet — create your first page above
          </div>
        ) : (
          pages.map(page => (
            <div key={page.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 160px', padding: '14px 20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#111', margin: '0 0 2px' }}>{page.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#bbb', margin: 0 }}>
                  {page.content?.slice(0, 60)}{(page.content?.length || 0) > 60 ? '...' : ''}
                </p>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#888' }}>/{page.slug}</span>
              <button onClick={() => handleToggle(page)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', backgroundColor: page.is_active ? '#22c55e18' : '#ef444418', color: page.is_active ? '#22c55e' : '#ef4444', letterSpacing: '0.05em', textTransform: 'uppercase', width: 'fit-content' }}>
                {page.is_active ? 'Published' : 'Draft'}
              </button>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={() => openEdit(page)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#3b82f6' }}>Edit</button>
                <a href={`/${page.slug}`} target="_blank" rel="noopener" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', textDecoration: 'none' }}>Preview ↗</a>
                <button onClick={() => handleDelete(page.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#aaa', textDecoration: 'underline' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* How to add to menu */}
      {pages.length > 0 && (
        <div style={{ backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #bfdbfe', padding: '16px 20px', marginTop: '16px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#1d4ed8', margin: '0 0 4px', fontWeight: 600 }}>To add pages to your navigation:</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#3b82f6', margin: 0 }}>
            Go to <a href="/master-admin/menu" style={{ color: '#1d4ed8', fontWeight: 600 }}>Menu Builder</a> → Add Item → set Label to page title and URL to <code style={{ backgroundColor: '#dbeafe', padding: '1px 5px', borderRadius: '3px' }}>/slug</code>
          </p>
        </div>
      )}
    </div>
  )
}
