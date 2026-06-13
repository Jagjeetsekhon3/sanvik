import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import Link from 'next/link'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const supabase = createServiceClient()
  const tenant = await getTenantById(tenantId)

  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(id, stock)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const fmt = (amount: number) =>
    tenant?.currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount.toFixed(2)}`

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Products</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888', margin: 0 }}>{products?.length || 0} total</p>
        </div>
        <Link href="/master-admin/products/new" style={{
          backgroundColor: '#111', color: '#fff',
          fontFamily: 'var(--font-body)', fontSize: '0.75rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '12px 24px', textDecoration: 'none', fontWeight: 600,
          borderRadius: '4px',
        }}>
          + Add Product
        </Link>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 80px 80px 100px',
          padding: '12px 20px', borderBottom: '1px solid #eee',
          fontFamily: 'var(--font-body)', fontSize: '0.65rem',
          letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa',
        }}>
          <span>Image</span><span>Product</span><span>Category</span>
          <span>Price</span><span>Stock</span><span>Status</span><span>Actions</span>
        </div>

        {!products?.length ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
            No products yet.{' '}
            <Link href="/master-admin/products/new" style={{ color: '#111', textDecoration: 'underline' }}>Add your first product</Link>
          </div>
        ) : (
          products.map(product => {
            const totalStock = (product.variants || []).reduce((s: number, v: { stock: number }) => s + v.stock, 0)
            return (
              <div key={product.id} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 80px 80px 100px',
                padding: '14px 20px', borderBottom: '1px solid #f5f5f5',
                alignItems: 'center',
              }}>
                {/* Image */}
                <div style={{ width: '44px', height: '52px', backgroundColor: '#f5f5f5', overflow: 'hidden', borderRadius: '3px' }}>
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Name */}
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: '#111', margin: '0 0 2px' }}>
                    {product.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#bbb', margin: 0 }}>
                    {product.slug}
                  </p>
                </div>

                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#666', textTransform: 'capitalize' }}>
                  {product.category}
                </span>

                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: '#111' }}>
                  {fmt(product.base_price)}
                </span>

                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: totalStock === 0 ? '#ef4444' : '#22c55e', fontWeight: 500 }}>
                  {totalStock}
                </span>

                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                  padding: '3px 8px', borderRadius: '20px',
                  backgroundColor: product.is_active ? '#22c55e18' : '#ef444418',
                  color: product.is_active ? '#22c55e' : '#ef4444',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  display: 'inline-block',
                }}>
                  {product.is_active ? 'Active' : 'Hidden'}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/master-admin/products/${product.id}`} style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                    color: '#3b82f6', textDecoration: 'none',
                  }}>Edit</Link>
                  <DeleteProductButton productId={product.id} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
