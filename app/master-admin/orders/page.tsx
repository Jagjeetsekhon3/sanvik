import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'

export default async function AdminOrdersPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const supabase = createServiceClient()
  const tenant = await getTenantById(tenantId)

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const fmt = (amount: number) =>
    tenant?.currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount.toFixed(2)}`

  const STATUS_COLORS: Record<string, string> = {
    pending: '#eab308', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#06b6d4', delivered: '#22c55e', cancelled: '#ef4444', refunded: '#6b7280',
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Orders</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888', margin: 0 }}>{orders?.length || 0} total</p>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '140px 1fr 120px 100px 120px 140px',
          padding: '12px 20px', borderBottom: '1px solid #eee',
          fontFamily: 'var(--font-body)', fontSize: '0.65rem',
          letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa',
        }}>
          <span>Order</span><span>Customer</span><span>Items</span>
          <span>Total</span><span>Payment</span><span>Status</span>
        </div>

        {!orders?.length ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
            No orders yet
          </div>
        ) : (
          orders.map(order => {
            const addr = order.shipping_address as { name: string; city: string }
            return (
              <div key={order.id} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr 120px 100px 120px 140px',
                padding: '16px 20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: '#111', margin: '0 0 2px' }}>
                    {order.order_number}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#bbb', margin: 0 }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#111', margin: '0 0 2px' }}>
                    {addr?.name || 'Guest'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#bbb', margin: 0 }}>
                    {addr?.city}
                  </p>
                </div>

                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#666' }}>
                  {(order.items as unknown[]).length} item{(order.items as unknown[]).length !== 1 ? 's' : ''}
                </span>

                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>
                  {fmt(order.total)}
                </span>

                <div>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                    padding: '3px 8px', borderRadius: '20px',
                    backgroundColor: order.payment_status === 'paid' ? '#22c55e18' : '#eab30818',
                    color: order.payment_status === 'paid' ? '#22c55e' : '#eab308',
                    letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block',
                    marginBottom: '4px',
                  }}>
                    {order.payment_status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#bbb', textTransform: 'uppercase' }}>
                    {order.payment_method}
                  </span>
                </div>

                <OrderStatusUpdater
                  orderId={order.id}
                  currentStatus={order.order_status}
                  statusColors={STATUS_COLORS}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
