'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTenant } from '@/components/TenantProvider'
import { useCart } from '@/components/store/CartContext'
import CartDrawer from '@/components/store/CartDrawer'

function CartDrawerWrapper() {
  const { isOpen, closeCart } = useCart()
  return <CartDrawer isOpen={isOpen} onClose={closeCart} />
}

export default function Navbar() {
  const tenant = useTenant()
  const { count, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        height: '64px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        {/* Left — desktop nav */}
        <div className="fashn-nav-links" style={{ display: 'flex', gap: '28px', flex: 1 }}>
          {[
            { label: 'Shop', href: '/shop' },
            { label: 'New', href: '/shop?category=new-arrivals' },
            { label: 'Sale', href: '/shop?category=sale', accent: true },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: item.accent ? 'var(--color-accent)' : 'var(--color-text)',
              textDecoration: 'none', opacity: item.accent ? 1 : 0.65,
              fontWeight: item.accent ? 500 : 400,
            }}>{item.label}</Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px', color: 'var(--color-text)',
            flexDirection: 'column', gap: '5px', alignItems: 'center',
            justifyContent: 'center',
          }}
          className="fashn-hamburger"
        >
          <span style={{ display: 'block', width: '22px', height: '1.5px', backgroundColor: 'currentColor', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(6.5px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '1.5px', backgroundColor: 'currentColor', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ display: 'block', width: '22px', height: '1.5px', backgroundColor: 'currentColor', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-6.5px)' : 'none' }} />
        </button>

        {/* Center — brand */}
        <Link href="/" style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--color-primary)', textDecoration: 'none',
          flex: 1, textAlign: 'center', whiteSpace: 'nowrap',
        }} className="fashn-logo">
          {tenant.brand_name}
        </Link>

        {/* Right — icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1, justifyContent: 'flex-end' }}>
          <Link href="/account" style={{ color: 'var(--color-text)', opacity: 0.65, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>
          <Link href="/wishlist" style={{ color: 'var(--color-text)', opacity: 0.65, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </Link>
          <button onClick={openCart} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text)', position: 'relative', padding: 0, opacity: 0.65, display: 'flex',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                backgroundColor: 'var(--color-accent)', color: '#fff',
                fontSize: '0.6rem', fontWeight: 700,
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{count}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
          zIndex: 99, backgroundColor: 'var(--color-bg)',
          display: 'flex', flexDirection: 'column',
          padding: '32px 24px', gap: '0',
        }}>
          {[
            { label: 'Shop All', href: '/shop' },
            { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
            { label: 'Sale', href: '/shop?category=sale' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: 'var(--font-heading)', fontSize: '2rem',
              fontWeight: 600, letterSpacing: '0.04em',
              color: 'var(--color-text)', textDecoration: 'none',
              padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'block',
            }}>{item.label}</Link>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '24px', paddingTop: '24px' }}>
            <Link href="/account" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text)', textDecoration: 'none', opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Account</Link>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text)', textDecoration: 'none', opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Wishlist</Link>
          </div>
        </div>
      )}

      {/* Additional mobile styles */}
      <style>{`
        @media (max-width: 768px) {
          .fashn-nav-links { display: none !important; }
          .fashn-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .fashn-hamburger { display: none !important; }
        }
      `}</style>

      <CartDrawerWrapper />
    </>
  )
}
