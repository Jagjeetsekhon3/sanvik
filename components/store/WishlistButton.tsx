'use client'

import { useState, useEffect } from 'react'

export default function WishlistButton({ productId, size = 'normal' }: { productId: string; size?: 'normal' | 'small' }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check localStorage for guest wishlist
    try {
      const wl = JSON.parse(localStorage.getItem('fashn_wishlist') || '[]')
      setWishlisted(wl.includes(productId))
    } catch {}
  }, [productId])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      const wl: string[] = JSON.parse(localStorage.getItem('fashn_wishlist') || '[]')
      const newWl = wl.includes(productId)
        ? wl.filter(id => id !== productId)
        : [...wl, productId]
      localStorage.setItem('fashn_wishlist', JSON.stringify(newWl))
      setWishlisted(newWl.includes(productId))
    } catch {}

    setLoading(false)
  }

  const btnSize = size === 'small' ? 32 : 40
  const iconSize = size === 'small' ? 14 : 18

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'none', border: size === 'normal' ? '1px solid rgba(0,0,0,0.12)' : 'none',
        cursor: 'pointer', padding: size === 'normal' ? '10px 16px' : '4px',
        borderRadius: '2px', color: wishlisted ? '#ef4444' : 'var(--color-text)',
        fontFamily: 'var(--font-body)', fontSize: '0.75rem',
        letterSpacing: '0.08em', opacity: size === 'normal' ? 0.7 : 1,
        transition: 'color 0.2s',
      }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={wishlisted ? '#ef4444' : 'none'} stroke={wishlisted ? '#ef4444' : 'currentColor'} strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {size === 'normal' && <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>}
    </button>
  )
}
