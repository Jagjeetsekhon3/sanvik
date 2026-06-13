import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantById } from '@/lib/tenant'
import { getProducts, getCategories } from '@/lib/store/products'
import ProductCard from '@/components/store/ProductCard'
import ShopFilters from '@/components/store/ShopFilters'

interface PageProps {
  searchParams: { category?: string; search?: string; min?: string; max?: string; page?: string }
}

export default async function ShopPage({ searchParams }: PageProps) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  const page = parseInt(searchParams.page || '1')
  const limit = 24
  const offset = (page - 1) * limit

  const [{ products, total }, categories] = await Promise.all([
    getProducts(tenantId, {
      category: searchParams.category,
      search: searchParams.search,
      minPrice: searchParams.min ? parseFloat(searchParams.min) : undefined,
      maxPrice: searchParams.max ? parseFloat(searchParams.max) : undefined,
      limit,
      offset,
    }),
    getCategories(tenantId),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.68rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--color-accent)', margin: '0 0 8px',
        }}>
          {searchParams.category
            ? searchParams.category.replace(/-/g, ' ')
            : 'All Products'}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '2.2rem',
          fontWeight: 600, margin: 0,
        }}>
          {searchParams.search
            ? `Results for "${searchParams.search}"`
            : searchParams.category
            ? searchParams.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            : 'Shop'}
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.78rem',
          opacity: 0.4, margin: '8px 0 0',
        }}>
          {total} {total === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        {/* Sidebar filters */}
        <ShopFilters categories={categories} currentCategory={searchParams.category} />

        {/* Product grid */}
        <div style={{ flex: 1 }}>
          {products.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 0', opacity: 0.4,
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                No products found. Try a different filter.
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center',
                  gap: '8px', marginTop: '60px',
                }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <a key={p} href={`?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                      style={{
                        width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                        textDecoration: 'none',
                        backgroundColor: p === page ? 'var(--color-primary)' : 'transparent',
                        color: p === page ? 'var(--color-secondary)' : 'var(--color-text)',
                        border: '1px solid',
                        borderColor: p === page ? 'var(--color-primary)' : 'rgba(0,0,0,0.12)',
                      }}>
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
