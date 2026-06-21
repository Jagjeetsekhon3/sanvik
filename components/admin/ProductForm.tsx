'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/components/TenantProvider'

const INPUT: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }
const SECTION: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '20px' }
const SECTION_TITLE: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 18px' }

interface Variant { size: string; color: string; color_hex: string; stock: number; sku: string; price_override: string }
interface Category { id: string; name: string; slug: string; parent_id: string | null }

export default function ProductForm({ product, tenantId }: {
  product?: Record<string, unknown>
  tenantId: string
}) {
  const router = useRouter()
  const tenant = useTenant()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    (product?.categories as string[]) || (product?.category ? [product.category as string] : [])
  )

  const [name, setName] = useState(String(product?.name || ''))
  const [slug, setSlug] = useState(String(product?.slug || ''))
  const [description, setDescription] = useState(String(product?.description || ''))
  const [basePrice, setBasePrice] = useState(String(product?.base_price || ''))
  const [comparePrice, setComparePrice] = useState(String(product?.compare_price || ''))
  const [images, setImages] = useState<string[]>(
    ((product?.images as string[]) || []).length > 0 ? (product?.images as string[]) : ['', '', '', '']
  )
  const [instagramVideoUrl, setInstagramVideoUrl] = useState(product?.instagram_video_url ? String(product.instagram_video_url) : '')
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.is_featured))
  const [isActive, setIsActive] = useState(product ? Boolean(product.is_active) : true)
  const [tags, setTags] = useState(((product?.tags as string[]) || []).join(', '))
  const [variants, setVariants] = useState<Variant[]>(
    (product?.variants as Variant[])?.length
      ? (product.variants as Variant[])
      : [{ size: '', color: '', color_hex: '#000000', stock: 0, sku: '', price_override: '' }]
  )

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(data => {
      setAllCategories(Array.isArray(data) ? data : [])
    })
  }, [])

  const autoSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev =>
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    )
  }

  const handleImageUpload = async (file: File, index: number) => {
    setUploadingIdx(index)
    setError(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    setUploadingIdx(null)
    if (data.error) { setError(data.error); return }
    setImages(prev => prev.map((v, i) => i === index ? data.url : v))
  }

  const addVariant = () => setVariants(prev => [...prev, { size: '', color: '', color_hex: '#000000', stock: 0, sku: '', price_override: '' }])
  const updateVariant = (i: number, field: keyof Variant, val: string | number) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v))
  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!name || !basePrice) { setError('Name and price are required'); return }
    if (selectedCategories.length === 0) { setError('Select at least one category'); return }
    setSaving(true); setError(null)

    const payload = {
      tenant_id: tenantId,
      name, slug: slug || autoSlug(name),
      description,
      category: selectedCategories[0],
      categories: selectedCategories,
      base_price: parseFloat(basePrice),
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
      images: images.filter(Boolean),
      instagram_video_url: instagramVideoUrl || null,
      is_featured: isFeatured,
      is_active: isActive,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      currency: tenant.currency === 'USD' ? 'USD' : 'INR',
    }

    const cleanVariants = variants
      .filter(v => v.size && v.color)
      .map(v => ({
        size: v.size, color: v.color, color_hex: v.color_hex,
        stock: Number(v.stock), sku: v.sku || null,
        price_override: v.price_override ? parseFloat(v.price_override) : null,
      }))

    const res = await fetch('/api/admin/products', {
      method: product ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: payload, variants: cleanVariants, productId: product?.id }),
    })

    const data = await res.json()
    setSaving(false)
    if (data.error) { setError(data.error); return }
    router.push('/master-admin/products')
    router.refresh()
  }

  const parentCats = allCategories.filter(c => !c.parent_id)
  const getChildren = (parentId: string) => allCategories.filter(c => c.parent_id === parentId)

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111' }}>
          {product ? 'Edit Product' : 'New Product'}
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#111', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '11px 28px', fontWeight: 600, borderRadius: '4px', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : product ? 'Save Changes' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#dc2626' }}>{error}</div>}

      {/* Basic Info */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Basic Info</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>Product Name *</label>
          <input style={INPUT} value={name} onChange={e => { setName(e.target.value); if (!product) setSlug(autoSlug(e.target.value)) }} placeholder="Silk Oversized Shirt" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LABEL}>Slug (URL)</label><input style={INPUT} value={slug} onChange={e => setSlug(e.target.value)} /></div>
          <div><label style={LABEL}>Tags (comma separated)</label><input style={INPUT} value={tags} onChange={e => setTags(e.target.value)} placeholder="summer, minimal" /></div>
        </div>
        <div><label style={LABEL}>Description</label><textarea style={{ ...INPUT, minHeight: '90px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} /></div>
      </div>

      {/* Categories */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Categories *</h2>
        {allCategories.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#aaa', margin: 0 }}>
            No categories yet — <a href="/master-admin/categories" style={{ color: '#3b82f6' }}>add some first</a>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {parentCats.map(parent => (
              <div key={parent.id}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px' }}>
                  <input type="checkbox" checked={selectedCategories.includes(parent.name)} onChange={() => toggleCategory(parent.name)} style={{ width: '15px', height: '15px', accentColor: '#111', cursor: 'pointer' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>{parent.name}</span>
                </label>
                {getChildren(parent.id).length > 0 && (
                  <div style={{ paddingLeft: '24px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {getChildren(parent.id).map(child => (
                      <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 12px', border: '1px solid', borderColor: selectedCategories.includes(child.name) ? '#111' : '#e5e5e5', borderRadius: '20px', backgroundColor: selectedCategories.includes(child.name) ? '#111' : '#fff' }}>
                        <input type="checkbox" checked={selectedCategories.includes(child.name)} onChange={() => toggleCategory(child.name)} style={{ display: 'none' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: selectedCategories.includes(child.name) ? '#fff' : '#555' }}>{child.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {selectedCategories.length > 0 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#888', margin: '4px 0 0' }}>Selected: {selectedCategories.join(', ')}</p>
            )}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={LABEL}>Selling Price *</label><input style={INPUT} type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="4999" /></div>
          <div><label style={LABEL}>MRP / Compare Price</label><input style={INPUT} type="number" value={comparePrice} onChange={e => setComparePrice(e.target.value)} placeholder="6999" /></div>
        </div>
      </div>

      {/* Images */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Product Images</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '3/4', backgroundColor: '#f8f8f8', borderRadius: '6px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
              {img ? (
                <>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setImages(prev => prev.map((v, idx) => idx === i ? '' : v))} style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.65)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </>
              ) : uploadingIdx === i ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '8px', color: '#aaa' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #e5e5e5', borderTopColor: '#111', borderRadius: '50%' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem' }}>Uploading...</span>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', cursor: 'pointer', gap: '6px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#ccc' }}>{i === 0 ? 'Main photo' : `Photo ${i + 1}`}</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], i)} />
                </label>
              )}
            </div>
          ))}
        </div>

        {/* Instagram video */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <label style={LABEL}>Instagram Reel / Video URL (optional)</label>
          <input style={INPUT} value={instagramVideoUrl} onChange={e => setInstagramVideoUrl(e.target.value)} placeholder="https://www.instagram.com/reel/..." />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#aaa', margin: '4px 0 0' }}>Embeds on the product page</p>
        </div>
      </div>

      {/* Variants */}
      <div style={SECTION}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ ...SECTION_TITLE, margin: 0 }}>Variants</h2>
          <button onClick={addVariant} style={{ background: 'none', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666' }}>+ Add</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 50px 70px 100px 100px 36px', gap: '8px', marginBottom: '6px' }}>
          {['Size', 'Color', 'Hex', 'Stock', 'SKU', 'Price Override', ''].map(h => (
            <span key={h} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb' }}>{h}</span>
          ))}
        </div>
        {variants.map((v, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 100px 50px 70px 100px 100px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input style={{ ...INPUT, padding: '8px 10px' }} value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} placeholder="S/M/L" />
            <input style={{ ...INPUT, padding: '8px 10px' }} value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} placeholder="Black" />
            <input type="color" value={v.color_hex} onChange={e => updateVariant(i, 'color_hex', e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '2px' }} />
            <input style={{ ...INPUT, padding: '8px 10px' }} type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} />
            <input style={{ ...INPUT, padding: '8px 10px' }} value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="SKU-001" />
            <input style={{ ...INPUT, padding: '8px 10px' }} type="number" value={v.price_override} onChange={e => updateVariant(i, 'price_override', e.target.value)} placeholder="Optional" />
            {variants.length > 1 ? <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem' }}>✕</button> : <div />}
          </div>
        ))}
      </div>

      {/* Visibility */}
      <div style={SECTION}>
        <h2 style={SECTION_TITLE}>Visibility</h2>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Active (visible in store)', value: isActive, set: setIsActive },
            { label: 'Featured on homepage', value: isFeatured, set: setIsFeatured },
          ].map(t => (
            <label key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={t.value} onChange={e => t.set(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#111', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#444' }}>{t.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
