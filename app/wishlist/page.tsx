'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import WishlistButton from '@/components/store/WishlistButton'

interface WishProduct {
  id: string; name: string; slug: string; base_price: number;
  compare_price: number | null; images: string[]; category: string
}

export default function WishlistPage() {
  const [products, setProducts] = useState<WishProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem('fashn_wishlist') || '[]')
    if (ids.length === 0) { setLoading(false); return }

    fetch(`/api/wishlist?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const fmt = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 32px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: '0 0 10px' }}>My Account</p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 600, margin: 0 }}>Wishlist</h1>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'var(--font-body)', opacity: 0.4 }}>Loading...</p>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block' }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Your wishlist is empty</p>
          <Link href="/shop" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-accent)', textDecoration: 'none' }}>Browse products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {products.map(product => (
            <div key={product.id} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}>
                <WishlistButton productId={product.id} size="small" />
              </div>
              <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ aspectRatio: '3/4', backgroundColor: 'rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '12px' }}>
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 4px' }}>{product.name}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', opacity: 0.4, margin: '0 0 6px', textTransform: 'capitalize' }}>{product.category}</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600 }}>{fmt(product.base_price)}</span>
                  {product.compare_price && (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', opacity: 0.4, textDecoration: 'line-through' }}>{fmt(product.compare_price)}</span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
