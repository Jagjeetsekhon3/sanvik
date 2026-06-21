'use client'

import { useState, useEffect } from 'react'
import { Product, ProductVariant } from '@/types'
import { useCart } from './CartContext'
import { useTenant } from '@/components/TenantProvider'
import { useRouter } from 'next/navigation'
import WishlistButton from './WishlistButton'
import SizeGuideModal from './SizeGuideModal'

export default function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const tenant = useTenant()
  const router = useRouter()

  const variants = product.variants || []
  const sizes = [...new Set(variants.map(v => v.size))]
  const colors = [...new Set(variants.map(v => v.color))]

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const selectedVariant: ProductVariant | undefined = variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  )

  const inStock = selectedVariant ? selectedVariant.stock > 0 : variants.length === 0
  const maxQty = selectedVariant ? selectedVariant.stock : 99
  const price = selectedVariant?.price_override ?? product.base_price

  const buildCartItem = () => ({
    product_id: product.id,
    variant_id: selectedVariant?.id || '',
    product_name: product.name,
    product_image: product.images?.[0] || '',
    size: selectedSize || '',
    color: selectedColor || '',
    price,
    quantity,
  })

  const handleAdd = () => {
    if (!inStock) return
    addItem(buildCartItem())
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!inStock) return
    addItem(buildCartItem())
    router.push('/checkout')
  }

  return (
    <div>
      {/* Color selector */}
      {colors.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5, margin: '0 0 12px' }}>
            Color: <span style={{ opacity: 1, fontWeight: 500, textTransform: 'capitalize' }}>{selectedColor}</span>
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {colors.map(color => {
              const variant = variants.find(v => v.color === color)
              const hex = variant?.color_hex
              return (
                <button key={color} onClick={() => setSelectedColor(color)} title={color} style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: hex || '#ccc',
                  border: '2px solid',
                  borderColor: selectedColor === color ? 'var(--color-primary)' : 'transparent',
                  cursor: 'pointer',
                  outline: selectedColor === color ? '2px solid rgba(0,0,0,0.15)' : 'none',
                  outlineOffset: '2px',
                }} />
              )
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5, margin: 0 }}>
              Size: <span style={{ opacity: 1, fontWeight: 500 }}>{selectedSize}</span>
            </p>
            {product.size_guide_id && (
              <SizeGuideModal sizeGuideId={product.size_guide_id} />
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sizes.map(size => {
              const variant = variants.find(v => v.size === size && v.color === selectedColor)
              const outOfStock = variant ? variant.stock === 0 : true
              return (
                <button key={size} onClick={() => !outOfStock && setSelectedSize(size)} style={{
                  minWidth: '44px', height: '44px', padding: '0 12px',
                  border: '1px solid',
                  borderColor: selectedSize === size ? 'var(--color-primary)' : 'rgba(0,0,0,0.15)',
                  backgroundColor: selectedSize === size ? 'var(--color-primary)' : 'transparent',
                  color: selectedSize === size ? 'var(--color-secondary)' : 'var(--color-text)',
                  fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                  opacity: outOfStock ? 0.3 : 1,
                  textDecoration: outOfStock ? 'line-through' : 'none',
                }}>
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity selector */}
      {inStock && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5, margin: '0 0 12px' }}>Quantity</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid rgba(0,0,0,0.15)', width: 'fit-content' }}>
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{ width: '40px', height: '44px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.1)' }}
            >−</button>
            <span style={{ minWidth: '48px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600 }}>{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
              style={{ width: '40px', height: '44px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(0,0,0,0.1)' }}
            >+</button>
          </div>
        </div>
      )}

      {/* Stock warning */}
      {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-accent)', margin: '0 0 16px' }}>
          Only {selectedVariant.stock} left
        </p>
      )}

      {/* Add to bag + Buy now */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button onClick={handleAdd} disabled={!inStock} style={{
          flex: 1, padding: '17px',
          backgroundColor: added ? 'var(--color-accent)' : !inStock ? 'rgba(0,0,0,0.08)' : 'var(--color-primary)',
          color: !inStock ? 'rgba(0,0,0,0.3)' : 'var(--color-secondary)',
          border: 'none', cursor: !inStock ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.75rem',
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
          transition: 'background-color 0.25s ease',
        }}>
          {added ? '✓ Added' : !inStock ? 'Out of Stock' : 'Add to Bag'}
        </button>

        {inStock && (
          <button onClick={handleBuyNow} style={{
            flex: 1, padding: '17px',
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.75rem',
            letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
          }}>
            Buy Now
          </button>
        )}
      </div>

      {/* Wishlist */}
      <WishlistButton productId={product.id} />
    </div>
  )
}
