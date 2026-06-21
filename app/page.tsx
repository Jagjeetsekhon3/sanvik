import { headers } from 'next/headers'
import Link from 'next/link'
import { getTenantById } from '@/lib/tenant'
import { getFeaturedProducts, getNewArrivals } from '@/lib/store/products'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/store/ProductCard'
import InstagramFeed from '@/components/store/InstagramFeed'
import HeroBanner from '@/components/store/HeroBanner'

export default async function HomePage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(tenantId, 8),
    getNewArrivals(tenantId, 4),
  ])

  return (
    <div>
      {/* ── Hero Banner ── */}
      <HeroBanner tenant={tenant} tenantId={tenantId} />

            {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'baseline',
            justifyContent: 'space-between', marginBottom: '40px',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--color-accent)', margin: '0 0 8px',
              }}>Just In</p>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '2rem',
                fontWeight: 600, margin: 0, letterSpacing: '0.03em',
              }}>New Arrivals</h2>
            </div>
            <Link href="/shop?category=new-arrivals" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.72rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-text)', textDecoration: 'none',
              opacity: 0.5, borderBottom: '1px solid currentColor',
              paddingBottom: '2px',
            }}>View all</Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}>
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Featured ── */}
      {featured.length > 0 && (
        <section style={{
          padding: '80px 32px',
          backgroundColor: 'rgba(0,0,0,0.02)',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex', alignItems: 'baseline',
              justifyContent: 'space-between', marginBottom: '40px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '2rem',
                fontWeight: 600, margin: 0, letterSpacing: '0.03em',
              }}>Featured</h2>
              <Link href="/shop" style={{
                fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--color-text)', textDecoration: 'none',
                opacity: 0.5, borderBottom: '1px solid currentColor',
                paddingBottom: '2px',
              }}>Shop all</Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}>
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {featured.length === 0 && newArrivals.length === 0 && (
        <section style={{ padding: '80px 32px', textAlign: 'center', opacity: 0.4 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            Products coming soon. Add some from the admin panel.
          </p>
        </section>
      )}

      {/* ── Brand Story Strip ── */}
      <section style={{
        padding: '80px 32px',
        backgroundColor: 'var(--color-primary)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.68rem',
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'var(--color-accent)', marginBottom: '20px',
        }}>Our Story</p>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          color: 'var(--color-secondary)',
          fontWeight: 400,
          letterSpacing: '0.04em',
          maxWidth: '600px',
          margin: '0 auto 32px',
          lineHeight: 1.3,
        }}>
          {tenant.about || `Crafted with intention. Worn with purpose.`}
        </h2>
        <Link href="/about" style={{
          fontFamily: 'var(--font-body)', fontSize: '0.7rem',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--color-secondary)', textDecoration: 'none',
          opacity: 0.5, borderBottom: '1px solid currentColor',
          paddingBottom: '2px',
        }}>
          About us
        </Link>
      </section>

      {/* ── Instagram Feed ── */}
      <InstagramFeed tenant={tenant} />
    </div>
  )
}
