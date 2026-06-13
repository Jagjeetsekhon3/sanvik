import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import Link from 'next/link'

export default async function OrdersPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) redirect('/auth/login')

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const serviceClient = createServiceClient()
  const tenant = await getTenantById(tenantId)

  const { data: customer } = await serviceClient
    .from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('email', session.user.email!)
    .single()

  const { data: orders } = customer ? await serviceClient
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false }) : { data: [] }

  const fmt = (amount: number) =>
    tenant?.currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toFixed(2)}`

  const STATUS_COLORS: Record<string, string> = {
    pending: '#eab308', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#06b6d4', delivered: '#22c55e', cancelled: '#ef4444', refunded: '#6b7280',
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <Link href="/account" style={{ color: 'var(--color-text)', opacity: 0.4, textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5m7-7l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>
          My Orders
        </h1>
      </div>

      {!orders?.length ? (
        <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}>
          <p style={{ fontFamily: 'var(--font-body)' }}>No orders yet.</p>
          <Link href="/shop" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', textDecoration: 'underline', color: 'var(--color-text)' }}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map(order => (
            <Link key={order.id} href={`/order/${order.id}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px',
              padding: '20px 24px', textDecoration: 'none', color: 'inherit',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 4px' }}>
                  {order.order_number}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.4, margin: 0 }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}
                  {(order.items as unknown[]).length} {(order.items as unknown[]).length === 1 ? 'item' : 'items'}
                  {' · '}
                  {order.payment_method.toUpperCase()}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: '20px',
                  backgroundColor: `${STATUS_COLORS[order.order_status]}18`,
                  color: STATUS_COLORS[order.order_status],
                  fontWeight: 500,
                }}>
                  {order.order_status}
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600 }}>
                  {fmt(order.total)}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
