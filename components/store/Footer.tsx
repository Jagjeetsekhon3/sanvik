import Link from 'next/link'
import { Tenant } from '@/types'

export default function Footer({ tenant }: { tenant: Tenant }) {
  return (
    <footer style={{
      borderTop: '1px solid rgba(0,0,0,0.08)',
      padding: '60px 32px 40px',
      marginTop: '80px',
    }}>
      <div className="fashn-footer-grid" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '40px',
      }}>
        {/* Brand */}
        <div>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            marginTop: 0,
          }}>
            {tenant.brand_name}
          </h3>
          {tenant.tagline && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              opacity: 0.5,
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}>
              {tenant.tagline}
            </p>
          )}
          <div style={{ display: 'flex', gap: '16px' }}>
            {tenant.instagram_url && (
              <a href={tenant.instagram_url} target="_blank" rel="noopener" style={{ color: 'var(--color-text)', opacity: 0.4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Shop */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '16px', marginTop: 0 }}>Shop</p>
          {['New Arrivals', 'All Products', 'Sale'].map(label => (
            <Link key={label} href={`/shop?category=${label.toLowerCase().replace(' ', '-')}`} style={{
              display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'var(--color-text)', textDecoration: 'none', opacity: 0.6,
              marginBottom: '10px',
            }}>{label}</Link>
          ))}
        </div>

        {/* Info */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '16px', marginTop: 0 }}>Info</p>
          {['About', 'Contact', 'Shipping', 'Returns'].map(label => (
            <Link key={label} href={`/${label.toLowerCase()}`} style={{
              display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'var(--color-text)', textDecoration: 'none', opacity: 0.6,
              marginBottom: '10px',
            }}>{label}</Link>
          ))}
        </div>

        {/* Account */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '16px', marginTop: 0 }}>Account</p>
          {['My Orders', 'My Account', 'Wishlist'].map(label => (
            <Link key={label} href="/account" style={{
              display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'var(--color-text)', textDecoration: 'none', opacity: 0.6,
              marginBottom: '10px',
            }}>{label}</Link>
          ))}
        </div>
      </div>

      <div className="fashn-footer-bottom" style={{
        maxWidth: '1200px', margin: '40px auto 0',
        borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.35, margin: 0 }}>
          © {new Date().getFullYear()} {tenant.brand_name}. All rights reserved.
        </p>
        {tenant.contact_email && (
          <a href={`mailto:${tenant.contact_email}`} style={{
            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            color: 'var(--color-text)', opacity: 0.35, textDecoration: 'none',
          }}>
            {tenant.contact_email}
          </a>
        )}
      </div>
    </footer>
  )
}
