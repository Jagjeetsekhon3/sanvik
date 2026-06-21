'use client'

import { useState, useEffect } from 'react'

interface Variant {
  id: string; size: string; color: string; color_hex: string | null;
  stock: number; sku: string | null; price_override: number | null
}

interface Product {
  id: string; name: string; category: string; images: string[]; base_price: number;
  product_variants: Variant[]
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [saving, setSaving] = useState<string | null>(null)
  const [edited, setEdited] = useState<Record<string, { stock?: number; sku?: string }>>({})

  useEffect(() => { fetchInventory() }, [])

  const fetchInventory = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/inventory')
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleEdit = (variantId: string, field: 'stock' | 'sku', value: string) => {
    setEdited(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: field === 'stock' ? parseInt(value) || 0 : value,
      }
    }))
  }

  const handleSave = async (variantId: string) => {
    const updates = edited[variantId]
    if (!updates) return
    setSaving(variantId)

    await fetch('/api/admin/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, ...updates }),
    })

    // Update local state
    setProducts(prev => prev.map(p => ({
      ...p,
      product_variants: p.product_variants.map(v =>
        v.id === variantId ? { ...v, ...updates } : v
      )
    })))

    setEdited(prev => { const n = { ...prev }; delete n[variantId]; return n })
    setSaving(null)
  }

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    .filter(p => {
      if (filter === 'all') return true
      const stocks = p.product_variants.map(v => v.stock)
      if (filter === 'out') return stocks.some(s => s === 0)
      if (filter === 'low') return stocks.some(s => s > 0 && s <= 5)
      return true
    })

  const totalVariants = products.reduce((sum, p) => sum + p.product_variants.length, 0)
  const outOfStock = products.reduce((sum, p) => sum + p.product_variants.filter(v => v.stock === 0).length, 0)
  const lowStock = products.reduce((sum, p) => sum + p.product_variants.filter(v => v.stock > 0 && v.stock <= 5).length, 0)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Inventory</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>Manage stock levels across all variants</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Variants', value: totalVariants, color: '#3b82f6' },
          { label: 'Low Stock (≤5)', value: lowStock, color: '#eab308' },
          { label: 'Out of Stock', value: outOfStock, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '16px 20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none', color: '#111', backgroundColor: '#fff' }}
        />
        {(['all', 'low', 'out'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '10px 18px', border: '1px solid', borderRadius: '4px', cursor: 'pointer',
            borderColor: filter === f ? '#111' : '#e5e5e5',
            backgroundColor: filter === f ? '#111' : '#fff',
            color: filter === f ? '#fff' : '#666',
            fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: filter === f ? 600 : 400,
            textTransform: 'capitalize',
          }}>
            {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>No products match your filter</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
              {/* Product header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ width: '40px', height: '48px', backgroundColor: '#f5f5f5', borderRadius: '3px', flexShrink: 0, overflow: 'hidden' }}>
                  {product.images?.[0] && <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{product.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#bbb', margin: 0, textTransform: 'capitalize' }}>{product.category}</p>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888' }}>
                  {product.product_variants.length} variant{product.product_variants.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Variants table */}
              <div style={{ padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '16px 80px 100px 80px 120px 80px', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f5f5f5', fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb' }}>
                  <span></span><span>Size</span><span>Color</span><span>Stock</span><span>SKU</span><span></span>
                </div>

                {product.product_variants.length === 0 ? (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#ccc', padding: '12px 0', margin: 0 }}>No variants — add from product editor</p>
                ) : (
                  product.product_variants.map(variant => {
                    const isEdited = !!edited[variant.id]
                    const currentStock = edited[variant.id]?.stock ?? variant.stock
                    const currentSku = edited[variant.id]?.sku ?? variant.sku ?? ''
                    const stockColor = currentStock === 0 ? '#ef4444' : currentStock <= 5 ? '#eab308' : '#22c55e'

                    return (
                      <div key={variant.id} style={{ display: 'grid', gridTemplateColumns: '16px 80px 100px 80px 120px 80px', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f9f9f9', alignItems: 'center' }}>
                        {/* Stock indicator */}
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stockColor }} />

                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#444', fontWeight: 500 }}>{variant.size}</span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {variant.color_hex && (
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: variant.color_hex, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                          )}
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#666' }}>{variant.color}</span>
                        </div>

                        {/* Stock input */}
                        <input
                          type="number" min="0"
                          value={currentStock}
                          onChange={e => handleEdit(variant.id, 'stock', e.target.value)}
                          style={{ width: '64px', padding: '5px 8px', border: `1px solid ${isEdited ? '#3b82f6' : '#e5e5e5'}`, borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: stockColor, fontWeight: 600, outline: 'none', backgroundColor: isEdited ? '#eff6ff' : '#fff' }}
                        />

                        {/* SKU input */}
                        <input
                          type="text"
                          value={currentSku}
                          onChange={e => handleEdit(variant.id, 'sku', e.target.value)}
                          placeholder="SKU"
                          style={{ width: '110px', padding: '5px 8px', border: `1px solid ${isEdited ? '#3b82f6' : '#e5e5e5'}`, borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#666', outline: 'none', backgroundColor: isEdited ? '#eff6ff' : '#fff' }}
                        />

                        {/* Save button */}
                        {isEdited && (
                          <button onClick={() => handleSave(variant.id)} disabled={saving === variant.id} style={{ padding: '5px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600 }}>
                            {saving === variant.id ? '...' : 'Save'}
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
