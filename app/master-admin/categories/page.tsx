'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string; name: string; slug: string; description: string;
  image_url: string; sort_order: number; is_active: boolean; parent_id: string | null
}

const INPUT: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [parentId, setParentId] = useState<string>('')

  const autoSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat); setName(cat.name); setSlug(cat.slug)
    setDescription(cat.description || ''); setImageUrl(cat.image_url || '')
    setSortOrder(String(cat.sort_order)); setParentId(cat.parent_id || '')
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null); setName(''); setSlug(''); setDescription('')
    setImageUrl(''); setSortOrder('0'); setParentId(''); setShowForm(false)
  }

  const handleSave = async () => {
    if (!name) return
    setSaving(true)
    const payload = {
      name, slug: slug || autoSlug(name), description, image_url: imageUrl,
      sort_order: parseInt(sortOrder) || 0,
      parent_id: parentId || null,
    }
    if (editing) {
      await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...payload } : c))
    } else {
      const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.id) setCategories(prev => [...prev, data])
    }
    setSaving(false); resetForm()
  }

  const handleToggle = async (cat: Category) => {
    await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: cat.id, is_active: !cat.is_active }) })
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Subcategories will be unlinked.')) return
    await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  // Separate parent and child categories
  const parents = categories.filter(c => !c.parent_id)
  const children = categories.filter(c => c.parent_id)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Categories</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>{parents.length} categories · {children.length} subcategories</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
            + Add Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 20px', color: '#111' }}>{editing ? 'Edit' : 'New'} Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: '16px', marginBottom: '16px' }}>
            <div><label style={LABEL}>Name *</label><input style={INPUT} value={name} onChange={e => { setName(e.target.value); if (!editing) setSlug(autoSlug(e.target.value)) }} placeholder="Tops" /></div>
            <div><label style={LABEL}>Slug</label><input style={INPUT} value={slug} onChange={e => setSlug(e.target.value)} /></div>
            <div>
              <label style={LABEL}>Parent Category</label>
              <select style={{ ...INPUT, cursor: 'pointer' }} value={parentId} onChange={e => setParentId(e.target.value)}>
                <option value="">None (Top level)</option>
                {parents.filter(p => p.id !== editing?.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div><label style={LABEL}>Order</label><input style={INPUT} type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div><label style={LABEL}>Description</label><input style={INPUT} value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div><label style={LABEL}>Image URL (Cloudinary)</label><input style={INPUT} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." /></div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
            </button>
            <button onClick={resetForm} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#888' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {parents.map(parent => (
            <div key={parent.id}>
              {/* Parent row */}
              <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  {parent.image_url && <img src={parent.image_url} alt={parent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0 0 1px' }}>{parent.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#bbb', margin: 0 }}>{parent.slug} · {children.filter(c => c.parent_id === parent.id).length} subcategories</p>
                </div>
                <button onClick={() => handleToggle(parent)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', backgroundColor: parent.is_active ? '#22c55e18' : '#ef444418', color: parent.is_active ? '#22c55e' : '#ef4444', textTransform: 'uppercase' }}>
                  {parent.is_active ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => openEdit(parent)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#3b82f6' }}>Edit</button>
                <button onClick={() => handleDelete(parent.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#aaa', textDecoration: 'underline' }}>Delete</button>
              </div>

              {/* Subcategory rows */}
              {children.filter(c => c.parent_id === parent.id).map(child => (
                <div key={child.id} style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0', borderTop: 'none', padding: '11px 20px 11px 56px', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '0 0 4px 4px' }}>
                  <div style={{ width: '8px', height: '1px', backgroundColor: '#ddd', flexShrink: 0 }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#555', margin: 0, flex: 1 }}>{child.name} <span style={{ color: '#ccc', fontSize: '0.7rem' }}>/ {child.slug}</span></p>
                  <button onClick={() => handleToggle(child)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', padding: '2px 8px', borderRadius: '20px', backgroundColor: child.is_active ? '#22c55e18' : '#ef444418', color: child.is_active ? '#22c55e' : '#ef4444', textTransform: 'uppercase' }}>
                    {child.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => openEdit(child)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#3b82f6' }}>Edit</button>
                  <button onClick={() => handleDelete(child.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#aaa', textDecoration: 'underline' }}>Delete</button>
                </div>
              ))}
            </div>
          ))}

          {/* Orphaned subcategories */}
          {children.filter(c => !parents.find(p => p.id === c.parent_id)).map(child => (
            <div key={child.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#555', margin: 0, flex: 1 }}>{child.name} <span style={{ color: '#ccc', fontSize: '0.7rem' }}>(subcategory)</span></p>
              <button onClick={() => openEdit(child)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#3b82f6' }}>Edit</button>
              <button onClick={() => handleDelete(child.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#aaa', textDecoration: 'underline' }}>Delete</button>
            </div>
          ))}

          {categories.length === 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '48px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
              No categories yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}
