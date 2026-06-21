'use client'

import { useState, useEffect } from 'react'
import { SizeGuide } from '@/types'

const INPUT: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '5px' }

export default function SizeGuidesPage() {
  const [guides, setGuides] = useState<SizeGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<SizeGuide | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [headers, setHeaders] = useState(['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'])
  const [rows, setRows] = useState<string[][]>([
    ['XS', '32', '26', '34'],
    ['S', '34', '28', '36'],
    ['M', '36', '30', '38'],
    ['L', '38', '32', '40'],
    ['XL', '40', '34', '42'],
  ])

  useEffect(() => { fetchGuides() }, [])

  const fetchGuides = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/size-guides')
    const data = await res.json()
    setGuides(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const openEdit = (guide: SizeGuide) => {
    setEditing(guide); setIsNew(false)
    setName(guide.name); setDescription(guide.description || '')
    setHeaders([...guide.headers])
    setRows(guide.rows.map(r => [...r]))
  }

  const openNew = () => {
    setEditing(null); setIsNew(true)
    setName(''); setDescription('')
    setHeaders(['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'])
    setRows([['XS','','',''],['S','','',''],['M','','',''],['L','','',''],['XL','','','']])
  }

  const closeEditor = () => { setEditing(null); setIsNew(false) }

  const updateHeader = (i: number, val: string) => setHeaders(prev => prev.map((h, idx) => idx === i ? val : h))
  const addHeader = () => {
    setHeaders(prev => [...prev, ''])
    setRows(prev => prev.map(r => [...r, '']))
  }
  const removeHeader = (i: number) => {
    if (headers.length <= 1) return
    setHeaders(prev => prev.filter((_, idx) => idx !== i))
    setRows(prev => prev.map(r => r.filter((_, idx) => idx !== i)))
  }

  const updateCell = (ri: number, ci: number, val: string) =>
    setRows(prev => prev.map((r, ridx) => ridx === ri ? r.map((c, cidx) => cidx === ci ? val : c) : r))
  const addRow = () => setRows(prev => [...prev, headers.map(() => '')])
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!name) return
    setSaving(true)
    const payload = { name, description: description || null, headers, rows }

    if (editing) {
      const res = await fetch('/api/admin/size-guides', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      const data = await res.json()
      setGuides(prev => prev.map(g => g.id === editing.id ? { ...g, ...data } : g))
    } else {
      const res = await fetch('/api/admin/size-guides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.id) setGuides(prev => [...prev, data])
    }
    setSaving(false); closeEditor()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this size guide?')) return
    await fetch('/api/admin/size-guides', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setGuides(prev => prev.filter(g => g.id !== id))
  }

  if (editing || isNew) {
    return (
      <div style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>
              {isNew ? 'New Size Guide' : `Edit: ${editing?.name}`}
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Build your size chart table</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={closeEditor} style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Guide'}
            </button>
          </div>
        </div>

        {/* Name */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={LABEL}>Guide Name *</label><input style={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="Women's Tops, Men's Bottoms..." /></div>
            <div><label style={LABEL}>Description (optional)</label><input style={INPUT} value={description} onChange={e => setDescription(e.target.value)} placeholder="How to measure..." /></div>
          </div>
        </div>

        {/* Table editor */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '20px', marginBottom: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', margin: 0 }}>Size Chart</p>
            <button onClick={addHeader} style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '6px 12px', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#666' }}>+ Column</button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: '6px 4px', border: 'none' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input style={{ ...INPUT, fontWeight: 600, fontSize: '0.75rem', padding: '6px 8px', backgroundColor: '#f8f8f8' }} value={h} onChange={e => updateHeader(i, e.target.value)} />
                      {headers.length > 1 && (
                        <button onClick={() => removeHeader(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', flexShrink: 0, padding: '0 2px' }}>✕</button>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ width: '32px' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? '#fafafa' : '#fff' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '4px' }}>
                      <input style={{ ...INPUT, fontSize: '0.82rem', padding: '7px 10px' }} value={cell} onChange={e => updateCell(ri, ci, e.target.value)} placeholder={headers[ci] || ''} />
                    </td>
                  ))}
                  <td style={{ padding: '4px', textAlign: 'center' }}>
                    <button onClick={() => removeRow(ri)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem' }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addRow} style={{ marginTop: '10px', background: 'none', border: '1px dashed #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '8px', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#aaa' }}>
            + Add Row
          </button>
        </div>

        {/* Preview */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', margin: '0 0 14px' }}>Preview</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #111' }}>
                  {headers.map((h, i) => <th key={i} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#111', fontSize: '0.78rem', letterSpacing: '0.05em' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: ri % 2 === 0 ? '#fafafa' : '#fff' }}>
                    {row.map((cell, ci) => <td key={ci} style={{ padding: '10px 12px', color: ci === 0 ? '#111' : '#666', fontWeight: ci === 0 ? 600 : 400 }}>{cell || '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Size Guides</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>{guides.length} guides · Assign to products when adding</p>
        </div>
        <button onClick={openNew} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
          + New Size Guide
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
      ) : guides.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '60px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#ccc', margin: '0 0 16px' }}>No size guides yet</p>
          <button onClick={openNew} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
            Create your first guide
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {guides.map(guide => (
            <div key={guide.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0 0 3px' }}>{guide.name}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#bbb', margin: 0 }}>
                  {guide.headers.join(' · ')} · {guide.rows.length} sizes
                </p>
              </div>
              <button onClick={() => openEdit(guide)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#3b82f6' }}>Edit</button>
              <button onClick={() => handleDelete(guide.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#aaa', textDecoration: 'underline' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
