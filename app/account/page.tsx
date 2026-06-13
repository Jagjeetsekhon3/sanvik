import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import Link from 'next/link'
import SignOutButton from '@/components/auth/SignOutButton'

export default async function AccountPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) redirect('/auth/login')

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const serviceClient = createServiceClient()
  const tenant = await getTenantById(tenantId)

  // Get or create customer record
  let { data: customer } = await serviceClient
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('email', session.user.email!)
    .single()

  if (!customer) {
    const { data: newCustomer } = await serviceClient
      .from('customers')
      .insert({
        tenant_id: tenantId,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || null,
      })
      .select()
      .single()
    customer = newCustomer
  }

  // Get recent orders
  const { data: orders } = await serviceClient
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })
    .limit(5)

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: '0 0 8px' }}>
            My Account
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 600, margin: 0 }}>
            {customer?.name || session.user.email?.split('@')[0]}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.45, margin: '6px 0 0' }}>
            {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Quick stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px', marginBottom: '48px',
      }}>
        {[
          { label: 'Total Orders', value: orders?.length || 0 },
          { label: 'Delivered', value: orders?.filter(o => o.order_status === 'delivered').length || 0 },
          { label: 'Pending', value: orders?.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.order_status)).length || 0 },
        ].map(stat => (
          <div key={stat.label} style={{
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '4px', padding: '20px 24px',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 8px' }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        {[
          { label: 'Orders', href: '/account/orders' },
          { label: 'Addresses', href: '/account/addresses' },
        ].map(link => (
          <Link key={link.href} href={link.href} style={{
            display: 'inline-block', padding: '10px 20px',
            border: '1px solid rgba(0,0,0,0.12)',
            fontFamily: 'var(--font-body)', fontSize: '0.75rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-text)', textDecoration: 'none',
            opacity: 0.6,
          }}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 20px' }}>
          Recent Orders
        </h2>

        {!orders?.length ? (
          <div style={{
            border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px',
            padding: '48px', textAlign: 'center', opacity: 0.4,
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              No orders yet
            </p>
            <Link href="/shop" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              color: 'var(--color-text)', textDecoration: 'underline',
            }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Item thumbnails */}
                  <div style={{ display: 'flex', gap: '-8px' }}>
                    {(order.items as Array<{ product_image: string; product_name: string }>).slice(0, 3).map((item, i) => (
                      <div key={i} style={{
                        width: '44px', height: '52px',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        marginLeft: i > 0 ? '-10px' : '0',
                        border: '2px solid var(--color-bg)',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 3px' }}>
                      {order.order_number}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.4, margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      {(order.items as unknown[]).length} {(order.items as unknown[]).length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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

        {orders && orders.length >= 5 && (
          <Link href="/account/orders" style={{
            display: 'block', textAlign: 'center', marginTop: '16px',
            fontFamily: 'var(--font-body)', fontSize: '0.78rem',
            color: 'var(--color-text)', opacity: 0.4, textDecoration: 'underline',
          }}>
            View all orders
          </Link>
        )}
      </div>
    </div>
  )
}
