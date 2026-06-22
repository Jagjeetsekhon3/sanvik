import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantById } from '@/lib/tenant'
import { getProductBySlug, getProducts } from '@/lib/store/products'
import ProductGallery from '@/components/store/ProductGallery'
import AddToCart from '@/components/store/AddToCart'
import ProductCard from '@/components/store/ProductCard'

interface PageProps {
  params: { slug: string }
}

export default async function ProductPage({ params }: PageProps) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const [tenant, product] = await Promise.all([
    getTenantById(tenantId),
    getProductBySlug(tenantId, params.slug),
  ])

  if (!tenant || !product) notFound()

  const { products: related } = await getProducts(tenantId, {
    category: product.category, limit: 4,
  })

  const fmt = (amount: number) =>
    tenant.currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toFixed(2)}`

  const isOnSale = product.compare_price && product.compare_price > product.base_price
  const discount = isOnSale
    ? Math.round(((product.compare_price! - product.base_price) / product.compare_price!) * 100)
    : 0

  return (
    <div>
      {/* Main product section */}
      <div className="fashn-pdp" style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '40px 32px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'start',
      }}>
        {/* Left — Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Right — Info */}
        <div className="fashn-pdp-sticky" style={{ position: 'sticky', top: '96px' }}>
          {/* Breadcrumb */}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.7rem',
            opacity: 0.4, margin: '0 0 16px',
          }}>
            <a href="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</a>
            {' / '}
            <a href={`/shop?category=${product.category}`} style={{ color: 'inherit', textDecoration: 'none', textTransform: 'capitalize' }}>
              {product.category}
            </a>
          </p>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem', fontWeight: 600,
            margin: '0 0 16px', letterSpacing: '0.02em',
          }}>
            {product.name}
          </h1>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem', fontWeight: 600,
              color: isOnSale ? 'var(--color-accent)' : 'var(--color-text)',
            }}>
              {fmt(product.base_price)}
            </span>
            {isOnSale && (
              <>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '1rem',
                  opacity: 0.4, textDecoration: 'line-through',
                }}>
                  {fmt(product.compare_price!)}
                </span>
                <span style={{
                  backgroundColor: 'var(--color-accent)', color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                  fontWeight: 700, padding: '3px 8px', letterSpacing: '0.05em',
                }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: '28px' }} />

          {/* Add to cart with variant selection */}
          <AddToCart product={product} />

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '32px 0' }} />

          {/* Description */}
          {product.description && (
            <div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                opacity: 0.4, margin: '0 0 12px',
              }}>Details</p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                lineHeight: 1.7, opacity: 0.7, margin: 0,
              }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.tags.map(tag => (
                <span key={tag} style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: '1px solid rgba(0,0,0,0.12)',
                  padding: '4px 10px', opacity: 0.5,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.filter(r => r.id !== product.id).length > 0 && (
        <section style={{
          padding: '60px 32px 80px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.6rem',
              fontWeight: 600, margin: '0 0 32px', letterSpacing: '0.03em',
            }}>
              You may also like
            </h2>
            <div className="fashn-product-grid-4" style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
            }}>
              {related.filter(r => r.id !== product.id).slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
