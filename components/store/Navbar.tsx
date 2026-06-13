'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTenant } from '@/components/TenantProvider'
import { useCart } from '@/components/store/CartContext'
import CartDrawer from '@/components/store/CartDrawer'

export default function Navbar() {
  const tenant = useTenant()
  const { count, isOpen, openCart, closeCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        {/* Left — nav links */}
        <div style={{ display: 'flex', gap: '28px', flex: 1 }}>
          <Link href="/shop" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text)',
            textDecoration: 'none',
            opacity: 0.7,
          }}>
            Shop
          </Link>
          <Link href="/shop?category=new" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text)',
            textDecoration: 'none',
            opacity: 0.7,
          }}>
            New
          </Link>
          <Link href="/shop?category=sale" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Sale
          </Link>
        </div>

        {/* Center — brand name */}
        <Link href="/" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-primary)',
          textDecoration: 'none',
          flex: 1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          {tenant.brand_name}
        </Link>

        {/* Right — icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'flex-end' }}>
          <Link href="/account" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>

          <button
            onClick={openCart}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              position: 'relative',
              padding: 0,
              opacity: 0.7,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {count > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </>
  )
}
