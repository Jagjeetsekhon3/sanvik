'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/components/TenantProvider'

const INPUT = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #e5e5e5', borderRadius: '4px',
  fontFamily: 'var(--font-body)', fontSize: '0.85rem',
  backgroundColor: '#fff', color: '#111', outline: 'none',
}
const LABEL = {
  fontFamily: 'var(--font-body)', fontSize: '0.68rem',
  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: '#888', display: 'block', marginBottom: '6px',
}
const SECTION = {
  backgroundColor: '#fff', borderRadius: '8px',
  border: '1px solid #eee', padding: '24px', marginBottom: '20px',
}

interface Variant { size: string; color: string; color_hex: string; stock: number; sku: string; price_override: string }

export default function ProductForm({ product, tenantId }: {
  product?: Record<string, unknown>
  tenantId: string
}) {
  const router = useRouter()
  const tenant = useTenant()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(String(product?.name || ''))
  const [slug, setSlug] = useState(String(product?.slug || ''))
  const [description, setDescription] = useState(String(product?.description || ''))
  const [category, setCategory] = useState(String(product?.category || ''))
  const [basePrice, setBasePrice] = useState(String(product?.base_price || ''))
  const [comparePrice, setComparePrice] = useState(String(product?.compare_price || ''))
  const [images, setImages] = useState<string[]>((product?.images as string[]) || [''])
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.is_featured))
  const [isActive, setIsActive] = useState(product ? Boolean(product.is_active) : true)
  const [tags, setTags] = useState(((product?.tags as string[]) || []).join(', '))
  const [variants, setVariants] = useState<Variant[]>(
    (product?.variants as Variant[]) || [{ size: '', color: '', color_hex: '#000000', stock: 0, sku: '', price_override: '' }]
  )

  const autoSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const addVariant = () =>
    setVariants(prev => [...prev, { size: '', color: '', color_hex: '#000000', stock: 0, sku: '', price_override: '' }])

  const updateVariant = (i: number, field: keyof Variant, val: string | number) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v))

  const removeVariant = (i: number) =>
    setVariants(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!name || !category || !basePrice) { setError('Name, category, and price are required'); return }
    setSaving(true); setError(null)

    const payload = {
      tenant_id: tenantId,
      name, slug: slug || autoSlug(name),
      description, category,
      base_price: parseFloat(basePrice),
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
      images: images.filter(Boolean),
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

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111' }}>
          {product ? 'Edit Product' : 'New Product'}
        </h1>
        <button onClick={handleSave} disabled={saving} style={{
          backgroundColor: '#111', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '12px 28px', fontWeight: 600, borderRadius: '4px',
          opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving...' : product ? 'Save Changes' : 'Publish Product'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Basic info */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 20px' }}>Basic Info</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>Product Name *</label>
          <input style={INPUT} value={name} onChange={e => { setName(e.target.value); if (!product) setSlug(autoSlug(e.target.value)) }} placeholder="Silk Oversized Shirt" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={LABEL}>Slug (URL)</label>
            <input style={INPUT} value={slug} onChange={e => setSlug(e.target.value)} placeholder="silk-oversized-shirt" />
          </div>
          <div>
            <label style={LABEL}>Category *</label>
            <input style={INPUT} value={category} onChange={e => setCategory(e.target.value)} placeholder="Tops, Dresses, Bottoms..." />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL}>Description</label>
          <textarea style={{ ...INPUT, minHeight: '100px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product..." />
        </div>
        <div>
          <label style={LABEL}>Tags (comma separated)</label>
          <input style={INPUT} value={tags} onChange={e => setTags(e.target.value)} placeholder="summer, minimal, bestseller" />
        </div>
      </div>

      {/* Pricing */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 20px' }}>Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={LABEL}>Selling Price *</label>
            <input style={INPUT} type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="4999" />
          </div>
          <div>
            <label style={LABEL}>MRP / Compare Price</label>
            <input style={INPUT} type="number" value={comparePrice} onChange={e => setComparePrice(e.target.value)} placeholder="6999 (shows strikethrough)" />
          </div>
        </div>
      </div>

      {/* Images */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 20px' }}>Images (Cloudinary URLs)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {images.map((img, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px' }}>
              <input style={{ ...INPUT, flex: 1 }} value={img} onChange={e => setImages(prev => prev.map((v, idx) => idx === i ? e.target.value : v))} placeholder="https://res.cloudinary.com/..." />
              {images.length > 1 && (
                <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: '1px solid #eee', cursor: 'pointer', borderRadius: '4px', padding: '0 12px', color: '#ef4444', fontSize: '0.8rem' }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={() => setImages(prev => [...prev, ''])} style={{ background: 'none', border: '1px dashed #ddd', cursor: 'pointer', borderRadius: '4px', padding: '10px', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888' }}>
            + Add image URL
          </button>
        </div>
      </div>

      {/* Variants */}
      <div style={SECTION}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: 0 }}>Variants (Size × Color)</h2>
          <button onClick={addVariant} style={{ background: 'none', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px', padding: '7px 14px', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#666' }}>
            + Add Variant
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 60px 70px 100px 100px 36px', gap: '8px', marginBottom: '8px' }}>
          {['Size', 'Color', 'Hex', 'Stock', 'SKU', 'Price Override', ''].map(h => (
            <span key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb' }}>{h}</span>
          ))}
        </div>

        {variants.map((v, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 100px 60px 70px 100px 100px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input style={{ ...INPUT, padding: '8px 10px' }} value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} placeholder="S/M/L/XL" />
            <input style={{ ...INPUT, padding: '8px 10px' }} value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} placeholder="Black" />
            <input type="color" value={v.color_hex} onChange={e => updateVariant(i, 'color_hex', e.target.value)} style={{ width: '100%', height: '38px', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '2px' }} />
            <input style={{ ...INPUT, padding: '8px 10px' }} type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} placeholder="0" />
            <input style={{ ...INPUT, padding: '8px 10px' }} value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="SKU-001" />
            <input style={{ ...INPUT, padding: '8px 10px' }} type="number" value={v.price_override} onChange={e => updateVariant(i, 'price_override', e.target.value)} placeholder="Optional" />
            {variants.length > 1 ? (
              <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem' }}>✕</button>
            ) : <div />}
          </div>
        ))}
      </div>

      {/* Visibility */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', margin: '0 0 20px' }}>Visibility</h2>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Active (visible in store)', value: isActive, set: setIsActive },
            { label: 'Featured (show on homepage)', value: isFeatured, set: setIsFeatured },
          ].map(toggle => (
            <label key={toggle.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={toggle.value} onChange={e => toggle.set(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#111', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#444' }}>{toggle.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
