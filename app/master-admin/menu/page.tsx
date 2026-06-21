'use client'

import { useState, useEffect } from 'react'
import { MenuItem } from '@/types'
import { v4 as uuid } from 'uuid'

const INPUT: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '5px' }

export default function MenuBuilderPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/menu').then(r => r.json()).then(d => {
      setItems(d.items || [])
      setLoading(false)
    })
  }, [])

  const addItem = () => setItems(prev => [...prev, { id: uuid(), label: '', href: '/', children: [] }])

  const updateItem = (id: string, field: keyof MenuItem, value: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const addChild = (parentId: string) =>
    setItems(prev => prev.map(i => i.id === parentId
      ? { ...i, children: [...(i.children || []), { id: uuid(), label: '', href: '/' }] }
      : i
    ))

  const updateChild = (parentId: string, childId: string, field: keyof MenuItem, value: string) =>
    setItems(prev => prev.map(i => i.id === parentId
      ? { ...i, children: (i.children || []).map(c => c.id === childId ? { ...c, [field]: value } : c) }
      : i
    ))

  const removeChild = (parentId: string, childId: string) =>
    setItems(prev => prev.map(i => i.id === parentId
      ? { ...i, children: (i.children || []).filter(c => c.id !== childId) }
      : i
    ))

  const moveItem = (index: number, dir: 'up' | 'down') => {
    const next = [...items]
    const swap = dir === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setItems(next)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/admin/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: '780px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Menu Builder</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Build your navigation menu with dropdowns</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saved ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 28px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Menu'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
      ) : (
        <>
          {/* Live preview */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '16px 24px', marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 12px' }}>Preview</p>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              {items.map(item => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#111', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {item.label || 'Item'}
                    {(item.children?.length ?? 0) > 0 && <span style={{ opacity: 0.4, marginLeft: '4px', fontSize: '0.6rem' }}>▾</span>}
                  </span>
                </div>
              ))}
              {items.length === 0 && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#ccc' }}>No items yet</span>}
            </div>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
                {/* Main item */}
                <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '32px 1fr 1fr 120px 80px', gap: '12px', alignItems: 'end' }}>
                  {/* Reorder */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: '1px solid #eee', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.6rem', color: '#888', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                    <button onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} style={{ background: 'none', border: '1px solid #eee', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.6rem', color: '#888', opacity: idx === items.length - 1 ? 0.3 : 1 }}>▼</button>
                  </div>
                  <div>
                    <label style={LABEL}>Label</label>
                    <input style={INPUT} value={item.label} onChange={e => updateItem(item.id, 'label', e.target.value)} placeholder="Shop" />
                  </div>
                  <div>
                    <label style={LABEL}>URL</label>
                    <input style={INPUT} value={item.href} onChange={e => updateItem(item.id, 'href', e.target.value)} placeholder="/shop" />
                  </div>
                  <div>
                    <label style={LABEL}>Opens in</label>
                    <select style={{ ...INPUT, cursor: 'pointer' }} value={item.target || '_self'} onChange={e => updateItem(item.id, 'target', e.target.value)}>
                      <option value="_self">Same tab</option>
                      <option value="_blank">New tab</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '1px' }}>
                    <button onClick={() => addChild(item.id)} style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '7px 10px', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#666', whiteSpace: 'nowrap' }}>+ Sub</button>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem', padding: '0 4px' }}>✕</button>
                  </div>
                </div>

                {/* Children / dropdown items */}
                {(item.children?.length ?? 0) > 0 && (
                  <div style={{ borderTop: '1px solid #f5f5f5', backgroundColor: '#fafafa', padding: '12px 20px 16px 52px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 10px' }}>Dropdown items</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.children!.map(child => (
                        <div key={child.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: '10px', alignItems: 'end' }}>
                          <input style={{ ...INPUT, fontSize: '0.8rem' }} value={child.label} onChange={e => updateChild(item.id, child.id, 'label', e.target.value)} placeholder="New Arrivals" />
                          <input style={{ ...INPUT, fontSize: '0.8rem' }} value={child.href} onChange={e => updateChild(item.id, child.id, 'href', e.target.value)} placeholder="/shop?category=new" />
                          <button onClick={() => removeChild(item.id, child.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={addItem} style={{ width: '100%', padding: '13px', border: '2px dashed #e5e5e5', borderRadius: '8px', background: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#aaa' }}>
            + Add Menu Item
          </button>
        </>
      )}
    </div>
  )
}
