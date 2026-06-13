'use client'

import { useState } from 'react'
import { Product, ProductVariant } from '@/types'
import { useCart } from './CartContext'
import { useTenant } from '@/components/TenantProvider'

export default function AddToCart({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()
  const tenant = useTenant()

  const variants = product.variants || []
  const sizes = [...new Set(variants.map(v => v.size))]
  const colors = [...new Set(variants.map(v => v.color))]

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null)
  const [added, setAdded] = useState(false)

  const selectedVariant: ProductVariant | undefined = variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  )

  const inStock = selectedVariant ? selectedVariant.stock > 0 : false
  const price = selectedVariant?.price_override ?? product.base_price

  const handleAdd = () => {
    if (!selectedVariant || !inStock) return

    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      product_image: product.images?.[0] || '',
      size: selectedSize!,
      color: selectedColor!,
      price,
      quantity: 1,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Color selector */}
      {colors.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            opacity: 0.5, margin: '0 0 12px',
          }}>
            Color: <span style={{ opacity: 1, fontWeight: 500, textTransform: 'capitalize' }}>{selectedColor}</span>
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {colors.map(color => {
              const variant = variants.find(v => v.color === color && v.size === selectedSize)
              const hex = variants.find(v => v.color === color)?.color_hex
              const outOfStock = variant ? variant.stock === 0 : false
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: hex || '#ccc',
                    border: '2px solid',
                    borderColor: selectedColor === color ? 'var(--color-primary)' : 'transparent',
                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                    opacity: outOfStock ? 0.3 : 1,
                    outline: selectedColor === color ? '2px solid rgba(0,0,0,0.15)' : 'none',
                    outlineOffset: '2px',
                    position: 'relative',
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.72rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              opacity: 0.5, margin: 0,
            }}>
              Size: <span style={{ opacity: 1, fontWeight: 500 }}>{selectedSize}</span>
            </p>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.7rem',
              opacity: 0.35, textDecoration: 'underline', color: 'var(--color-text)',
            }}>
              Size guide
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sizes.map(size => {
              const variant = variants.find(v => v.size === size && v.color === selectedColor)
              const outOfStock = variant ? variant.stock === 0 : true
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && setSelectedSize(size)}
                  style={{
                    minWidth: '44px', height: '44px', padding: '0 12px',
                    border: '1px solid',
                    borderColor: selectedSize === size ? 'var(--color-primary)' : 'rgba(0,0,0,0.15)',
                    backgroundColor: selectedSize === size ? 'var(--color-primary)' : 'transparent',
                    color: selectedSize === size ? 'var(--color-secondary)' : 'var(--color-text)',
                    fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                    opacity: outOfStock ? 0.3 : 1,
                    textDecoration: outOfStock ? 'line-through' : 'none',
                    position: 'relative',
                  }}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock warning */}
      {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          color: 'var(--color-accent)', margin: '0 0 16px',
        }}>
          Only {selectedVariant.stock} left in stock
        </p>
      )}

      {/* Add to bag */}
      <button
        onClick={handleAdd}
        disabled={!inStock || !selectedVariant}
        style={{
          width: '100%', padding: '18px',
          backgroundColor: added
            ? 'var(--color-accent)'
            : !inStock
            ? 'rgba(0,0,0,0.1)'
            : 'var(--color-primary)',
          color: !inStock ? 'rgba(0,0,0,0.3)' : 'var(--color-secondary)',
          border: 'none', cursor: !inStock ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.75rem',
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
          transition: 'background-color 0.25s ease',
        }}
      >
        {added ? '✓ Added to Bag' : !inStock ? 'Out of Stock' : 'Add to Bag'}
      </button>
    </div>
  )
}
