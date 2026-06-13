'use client'

import Link from 'next/link'
import { useCart } from './CartContext'
import { useTenant } from '@/components/TenantProvider'

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQty, total } = useCart()
  const tenant = useTenant()

  const fmt = (amount: number) =>
    tenant.currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toFixed(2)}`

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 199,
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '400px',
        maxWidth: '100vw',
        zIndex: 200,
        backgroundColor: 'var(--color-bg)',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Your Bag ({items.length})
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text)', opacity: 0.5, padding: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: '12px', opacity: 0.4,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>Your bag is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.product_id}-${item.variant_id}`} style={{
                display: 'flex', gap: '16px', padding: '20px 28px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}>
                {/* Image */}
                <div style={{
                  width: '80px', height: '96px', flexShrink: 0,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: '4px', overflow: 'hidden',
                }}>
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    fontWeight: 500, margin: 0, color: 'var(--color-text)',
                  }}>{item.product_name}</p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                    opacity: 0.5, margin: 0,
                  }}>{item.size} · {item.color}</p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    color: 'var(--color-accent)', margin: 0, marginTop: '4px',
                  }}>{fmt(item.price)}</p>

                  {/* Qty + Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateQty(item.product_id, item.variant_id, item.quantity - 1)}
                        style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                        −
                      </button>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.product_id, item.variant_id, item.quantity + 1)}
                        style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product_id, item.variant_id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: 0, fontSize: '0.7rem', fontFamily: 'var(--font-body)', textDecoration: 'underline', color: 'var(--color-text)' }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '24px 28px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.6 }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>{fmt(total)}</span>
            </div>
            <Link href="/checkout" onClick={onClose} style={{
              display: 'block', textAlign: 'center',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '16px',
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              Checkout
            </Link>
            <button onClick={onClose} style={{
              display: 'block', width: '100%', textAlign: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              opacity: 0.5, marginTop: '12px', color: 'var(--color-text)',
              letterSpacing: '0.05em',
            }}>
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
