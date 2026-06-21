'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string; name: string; slug: string; description: string;
  image_url: string; sort_order: number; is_active: boolean
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
    setEditing(cat)
    setName(cat.name); setSlug(cat.slug); setDescription(cat.description || '')
    setImageUrl(cat.image_url || ''); setSortOrder(String(cat.sort_order))
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null); setName(''); setSlug(''); setDescription(''); setImageUrl(''); setSortOrder('0')
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!name) return
    setSaving(true)
    const payload = { name, slug: slug || autoSlug(name), description, image_url: imageUrl, sort_order: parseInt(sortOrder) || 0 }

    if (editing) {
      await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...payload } : c))
    } else {
      const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.id) setCategories(prev => [...prev, data])
    }
    setSaving(false)
    resetForm()
  }

  const handleToggle = async (cat: Category) => {
    await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: cat.id, is_active: !cat.is_active }) })
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Categories</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>{categories.length} categories</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
            + Add Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 20px', color: '#111' }}>
            {editing ? 'Edit Category' : 'New Category'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={LABEL}>Name *</label>
              <input style={INPUT} value={name} onChange={e => { setName(e.target.value); if (!editing) setSlug(autoSlug(e.target.value)) }} placeholder="Tops" />
            </div>
            <div>
              <label style={LABEL}>Slug</label>
              <input style={INPUT} value={slug} onChange={e => setSlug(e.target.value)} placeholder="tops" />
            </div>
            <div>
              <label style={LABEL}>Order</label>
              <input style={INPUT} type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={LABEL}>Description</label>
            <input style={INPUT} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={LABEL}>Image URL (Cloudinary)</label>
            <input style={INPUT} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Category'}
            </button>
            <button onClick={resetForm} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#888' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 80px 120px', padding: '12px 20px', borderBottom: '1px solid #eee', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
          <span>Img</span><span>Name</span><span>Slug</span><span>Order</span><span>Status</span><span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>Loading...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>No categories yet</div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 80px 120px', padding: '14px 20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                {cat.image_url && <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#111', margin: '0 0 2px' }}>{cat.name}</p>
                {cat.description && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#bbb', margin: 0 }}>{cat.description}</p>}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#888' }}>{cat.slug}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888' }}>{cat.sort_order}</span>
              <button onClick={() => handleToggle(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', backgroundColor: cat.is_active ? '#22c55e18' : '#ef444418', color: cat.is_active ? '#22c55e' : '#ef4444', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {cat.is_active ? 'Active' : 'Hidden'}
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => openEdit(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#3b82f6' }}>Edit</button>
                <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#aaa', textDecoration: 'underline' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
