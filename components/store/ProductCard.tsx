'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@/types'
import { useTenant } from '@/components/TenantProvider'
import { useCart } from '@/components/store/CartContext'
import WishlistButton from './WishlistButton'

export default function ProductCard({ product }: { product: Product }) {
  const tenant = useTenant()
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [hovered, setHovered] = useState(false)

  const fmt = (amount: number) =>
    tenant.currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toFixed(2)}`

  const primaryImage = product.images?.[0]
  const secondaryImage = product.images?.[1]
  // Quick add — uses first available variant
  const firstVariant = (product.variants || [])[0]
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!firstVariant || firstVariant.stock === 0) return
    setAdding(true)
    addItem({
      product_id: product.id,
      variant_id: firstVariant.id,
      product_name: product.name,
      product_image: product.images?.[0] || '',
      size: firstVariant.size,
      color: firstVariant.color,
      price: firstVariant.price_override ?? product.base_price,
      quantity: 1,
    })
    setTimeout(() => setAdding(false), 1500)
  }

  const isOnSale = product.compare_price && product.compare_price > product.base_price
  const discount = isOnSale
    ? Math.round(((product.compare_price! - product.base_price) / product.compare_price!) * 100)
    : 0

  // Unique colors
  const colors = [...new Set((product.variants || []).map(v => v.color))]

  return (
    <div
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      {/* Image */}
      <div style={{
        position: 'relative',
        aspectRatio: '3/4',
        backgroundColor: 'rgba(0,0,0,0.04)',
        overflow: 'hidden',
        marginBottom: '14px',
      }}>
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'opacity 0.4s ease',
                opacity: hovered && secondaryImage ? 0 : 1,
                position: 'absolute', inset: 0,
              }}
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={product.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'opacity 0.4s ease',
                  opacity: hovered ? 1 : 0,
                  position: 'absolute', inset: 0,
                }}
              />
            )}
          </>
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.15,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}

  {/* Quick Add — inside image but outside Link handled below */}

        {/* Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isOnSale && (
            <span style={{
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '4px 8px',
            }}>
              -{discount}%
            </span>
          )}
          {product.is_featured && !isOnSale && (
            <span style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              padding: '4px 8px',
            }}>
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Wishlist */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <WishlistButton productId={product.id} size="small" />
      </div>

</Link>
      {/* Quick Add button — outside Link so click works */}
      {firstVariant && firstVariant.stock > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '12px', right: '12px',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          zIndex: 3,
        }}>
          <button
            onClick={handleQuickAdd}
            style={{
              width: '100%', padding: '11px',
              backgroundColor: adding ? 'var(--color-accent)' : 'var(--color-primary)',
              color: 'var(--color-secondary)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.7rem',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              fontWeight: 600, transition: 'background-color 0.2s',
            }}
          >
            {adding ? '✓ Added' : product.variants && product.variants.length > 1 ? 'Quick Add' : 'Add to Bag'}
          </button>
        </div>
      )}
      <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      {/* Info */}
      <div>
        {/* Color swatches */}
        {colors.length > 1 && (
          <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
            {colors.slice(0, 5).map(color => {
              const variant = (product.variants || []).find(v => v.color === color)
              return (
                <div key={color} title={color} style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  backgroundColor: variant?.color_hex || '#ccc',
                  border: '1px solid rgba(0,0,0,0.1)',
                }} />
              )
            })}
            {colors.length > 5 && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', opacity: 0.4, alignSelf: 'center' }}>
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          fontWeight: 500,
          margin: '0 0 6px',
          color: 'var(--color-text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {product.name}
        </p>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          opacity: 0.5,
          margin: '0 0 8px',
        }}>
          {product.category}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isOnSale ? 'var(--color-accent)' : 'var(--color-text)',
          }}>
            {fmt(product.base_price)}
          </span>
          {isOnSale && (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              opacity: 0.4,
              textDecoration: 'line-through',
            }}>
              {fmt(product.compare_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
    </div>
  )
}
