import { Tenant } from '@/types'
import Link from 'next/link'

interface BannerConfig {
  enabled: boolean
  layout: string
  bg_color: string
  bg_image_url: string | null
  bg_overlay: number
  heading: string
  subheading: string | null
  body_text: string | null
  badge_text: string | null
  cta_label: string
  cta_href: string
  cta_color: string
  cta2_label: string | null
  cta2_href: string | null
  text_color: string
  text_align: string
  min_height: number
}

async function getBannerConfig(tenantId: string): Promise<BannerConfig | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(
    `${supabaseUrl}/rest/v1/banner_config?tenant_id=eq.${tenantId}&limit=1`,
    {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      cache: 'no-store',
    }
  )
  const data = await res.json()
  return data?.[0] || null
}

export default async function HeroBanner({ tenant, tenantId }: { tenant: Tenant; tenantId: string }) {
  const config = await getBannerConfig(tenantId)

  // Defaults if no config saved yet
  const banner: BannerConfig = config || {
    enabled: true,
    layout: 'full',
    bg_color: tenant.primary_color || '#0f0f0f',
    bg_image_url: null,
    bg_overlay: 0.4,
    heading: tenant.brand_name,
    subheading: null,
    body_text: null,
    badge_text: 'New Collection',
    cta_label: 'Shop Now',
    cta_href: '/shop',
    cta_color: tenant.accent_color || '#c8a96e',
    cta2_label: 'New Arrivals',
    cta2_href: '/shop?category=new-arrivals',
    text_color: '#ffffff',
    text_align: 'center',
    min_height: 100,
  }

  if (!banner.enabled) return null

  const alignItems = banner.text_align === 'left' ? 'flex-start' : banner.text_align === 'right' ? 'flex-end' : 'center'
  const textAlign = banner.text_align as 'left' | 'center' | 'right'

  return (
    <section style={{
      position: 'relative',
      minHeight: `${banner.min_height}vh`,
      display: 'flex',
      flexDirection: 'column',
      alignItems,
      justifyContent: 'center',
      backgroundColor: banner.bg_color,
      overflow: 'hidden',
    }}>
      {/* Background image */}
      {banner.bg_image_url && (
        <>
          <img
            src={banner.bg_image_url}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: banner.bg_color,
            opacity: banner.bg_overlay,
          }} />
        </>
      )}

      {/* Decorative line */}
      {!banner.bg_image_url && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1px', height: '80%',
          backgroundColor: banner.cta_color,
          opacity: 0.12,
        }} />
      )}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        textAlign,
        padding: '0 48px',
        maxWidth: banner.layout === 'minimal' ? '640px' : '900px',
        width: '100%',
        marginLeft: banner.text_align === 'left' ? '0' : 'auto',
        marginRight: banner.text_align === 'right' ? '0' : 'auto',
      }}>
        {banner.badge_text && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: banner.cta_color,
            marginBottom: '20px',
            margin: '0 0 20px',
          }}>
            {banner.badge_text}
          </p>
        )}

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(3rem, 8vw, 8rem)',
          fontWeight: 700,
          color: banner.text_color,
          letterSpacing: '0.04em',
          lineHeight: 0.92,
          margin: '0 0 28px',
          textTransform: 'uppercase',
        }}>
          {banner.heading}
        </h1>

        {banner.subheading && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: banner.text_color,
            opacity: 0.6,
            margin: '0 0 12px',
            letterSpacing: '0.05em',
          }}>
            {banner.subheading}
          </p>
        )}

        {banner.body_text && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: banner.text_color,
            opacity: 0.45,
            margin: '0 0 36px',
            maxWidth: '480px',
            lineHeight: 1.6,
            marginLeft: textAlign === 'center' ? 'auto' : 0,
            marginRight: textAlign === 'center' ? 'auto' : 0,
          }}>
            {banner.body_text}
          </p>
        )}

        {!banner.subheading && !banner.body_text && (
          <div style={{ marginBottom: '36px' }} />
        )}

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap',
          justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        }}>
          {banner.cta_label && (
            <Link href={banner.cta_href} style={{
              display: 'inline-block',
              backgroundColor: banner.cta_color,
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '16px 40px',
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              {banner.cta_label}
            </Link>
          )}
          {banner.cta2_label && (
            <Link href={banner.cta2_href || '/shop'} style={{
              display: 'inline-block',
              border: `1px solid rgba(${banner.text_color === '#ffffff' ? '255,255,255' : '0,0,0'},0.3)`,
              color: banner.text_color,
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '16px 40px',
              textDecoration: 'none',
              opacity: 0.7,
            }}>
              {banner.cta2_label}
            </Link>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '8px',
        opacity: 0.25,
      }}>
        <div style={{ width: '1px', height: '48px', backgroundColor: banner.text_color }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: banner.text_color, margin: 0 }}>
          Scroll
        </p>
      </div>
    </section>
  )
}
