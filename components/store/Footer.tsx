import Link from 'next/link'
import { Tenant } from '@/types'

const SOCIAL_ICONS: Record<string, { icon: string; label: string }> = {
  instagram_url: {
    label: 'Instagram',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  },
  facebook_url: {
    label: 'Facebook',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  },
  youtube_url: {
    label: 'YouTube',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>`,
  },
  twitter_url: {
    label: 'X / Twitter',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l16 16M4 20L20 4"/></svg>`,
  },
  tiktok_url: {
    label: 'TikTok',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>`,
  },
  pinterest_url: {
    label: 'Pinterest',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.89 1.54 1.89 1.85 0 3.27-1.95 3.27-4.77 0-2.49-1.79-4.23-4.35-4.23-2.96 0-4.7 2.22-4.7 4.52 0 .9.34 1.85.77 2.37.08.1.09.19.07.3-.08.32-.25 1.04-.29 1.18-.05.19-.16.23-.38.14-1.39-.65-2.26-2.68-2.26-4.32 0-3.51 2.55-6.74 7.36-6.74 3.86 0 6.86 2.75 6.86 6.42 0 3.83-2.41 6.91-5.76 6.91-1.13 0-2.19-.59-2.55-1.28l-.69 2.6c-.25.97-.93 2.18-1.38 2.92.04.01.07.01.11.01z"/></svg>`,
  },
  linkedin_url: {
    label: 'LinkedIn',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  },
}

export default function Footer({ tenant }: { tenant: Tenant }) {
  const socialMap: Record<string, string | null> = {
    instagram_url: tenant.instagram_url,
    facebook_url: tenant.facebook_url,
    youtube_url: tenant.youtube_url,
    twitter_url: tenant.twitter_url,
    tiktok_url: tenant.tiktok_url,
    pinterest_url: tenant.pinterest_url,
    linkedin_url: tenant.linkedin_url,
  }
  const socialLinks = Object.entries(SOCIAL_ICONS)
    .filter(([key]) => !!socialMap[key])
    .map(([key, meta]) => ({
      url: socialMap[key] as string,
      ...meta,
    }))

  return (
    <footer style={{
      borderTop: '1px solid rgba(0,0,0,0.08)',
      padding: '60px 32px 40px',
      marginTop: '80px',
    }}>
      <div className="fashn-footer-grid" style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '40px',
      }}>
        {/* Brand */}
        <div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: '12px', marginTop: 0,
          }}>
            {tenant.brand_name}
          </h3>
          {tenant.tagline && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.6, margin: '0 0 20px' }}>
              {tenant.tagline}
            </p>
          )}

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {socialLinks.map(social => (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,0.12)',
                    color: 'var(--color-text)', opacity: 0.5,
                    textDecoration: 'none', transition: 'opacity 0.2s',
                  }}
                  dangerouslySetInnerHTML={{ __html: social.icon }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shop */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '16px', marginTop: 0 }}>Shop</p>
          {['New Arrivals', 'All Products', 'Sale'].map(label => (
            <Link key={label} href={`/shop?category=${label.toLowerCase().replace(/ /g, '-')}`} style={{
              display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'var(--color-text)', textDecoration: 'none', opacity: 0.6, marginBottom: '10px',
            }}>{label}</Link>
          ))}
        </div>

        {/* Info */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '16px', marginTop: 0 }}>Info</p>
          {[
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Shipping', href: '/shipping' },
            { label: 'Returns', href: '/returns' },
            { label: 'Privacy', href: '/privacy' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'var(--color-text)', textDecoration: 'none', opacity: 0.6, marginBottom: '10px',
            }}>{item.label}</Link>
          ))}
        </div>

        {/* Account */}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '16px', marginTop: 0 }}>Account</p>
          {[
            { label: 'My Account', href: '/account' },
            { label: 'My Orders', href: '/account/orders' },
            { label: 'Wishlist', href: '/wishlist' },
            { label: 'Addresses', href: '/account/addresses' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'var(--color-text)', textDecoration: 'none', opacity: 0.6, marginBottom: '10px',
            }}>{item.label}</Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
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
