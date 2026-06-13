import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import Link from 'next/link'

export default async function AdminDashboard() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const supabase = createServiceClient()
  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  // Fetch stats
  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: recentOrders },
    { data: allOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(8),
    supabase.from('orders').select('total, payment_status').eq('tenant_id', tenantId).eq('payment_status', 'paid'),
  ])

  const revenue = (allOrders || []).reduce((sum, o) => sum + Number(o.total), 0)

  const fmt = (amount: number) =>
    tenant.currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toFixed(2)}`

  const STATUS_COLORS: Record<string, string> = {
    pending: '#eab308', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#06b6d4', delivered: '#22c55e', cancelled: '#ef4444', refunded: '#6b7280',
  }

  const STAT_CARDS = [
    { label: 'Total Revenue', value: fmt(revenue), sub: 'From paid orders', color: 'var(--color-accent, #c8a96e)' },
    { label: 'Total Orders', value: String(totalOrders || 0), sub: 'All time', color: '#3b82f6' },
    { label: 'Products', value: String(totalProducts || 0), sub: 'Active listings', color: '#8b5cf6' },
    { label: 'Customers', value: String(totalCustomers || 0), sub: 'Registered', color: '#22c55e' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>
          Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {STAT_CARDS.map(card => (
          <div key={card.label} style={{
            backgroundColor: '#fff', borderRadius: '8px',
            padding: '20px 24px', border: '1px solid #eee',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', margin: '0 0 10px' }}>
              {card.label}
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: card.color, margin: '0 0 4px' }}>
              {card.value}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#bbb', margin: 0 }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Recent orders */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#111' }}>Recent Orders</h2>
            <Link href="/master-admin/orders" style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888', textDecoration: 'none' }}>View all →</Link>
          </div>

          {!recentOrders?.length ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
              No orders yet
            </div>
          ) : (
            <div>
              {recentOrders.map(order => (
                <Link key={order.id} href={`/master-admin/orders/${order.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 24px', borderBottom: '1px solid #f5f5f5',
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: '#111', margin: '0 0 2px' }}>
                      {order.order_number}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#aaa', margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                      padding: '3px 8px', borderRadius: '20px',
                      backgroundColor: `${STATUS_COLORS[order.order_status]}18`,
                      color: STATUS_COLORS[order.order_status],
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      {order.order_status}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: '#111' }}>
                      {fmt(order.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Add Product', href: '/master-admin/products/new', color: '#111' },
            { label: 'View Orders', href: '/master-admin/orders', color: '#3b82f6' },
            { label: 'Add Discount', href: '/master-admin/discounts', color: '#8b5cf6' },
            { label: 'Store Settings', href: '/master-admin/settings', color: '#22c55e' },
            { label: '← View Store', href: '/', color: '#888' },
          ].map(action => (
            <Link key={action.href} href={action.href} style={{
              display: 'block', padding: '14px 20px',
              backgroundColor: '#fff', borderRadius: '8px',
              border: '1px solid #eee', textDecoration: 'none',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem',
              fontWeight: 500, color: action.color,
              letterSpacing: '0.03em',
            }}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
