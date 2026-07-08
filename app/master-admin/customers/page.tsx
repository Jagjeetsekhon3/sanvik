import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import CustomerActions from '@/components/admin/CustomerActions'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const supabase = createServiceClient()
  const tenant = await getTenantById(tenantId)

  // Fetch customers with order count and total spend
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  // Fetch order stats per customer
  const { data: orderStats } = await supabase
    .from('orders')
    .select('customer_id, total, payment_status')
    .eq('tenant_id', tenantId)

  // Fetch admins for cross-reference
  const { data: admins } = await supabase
    .from('admins')
    .select('email, role')
    .eq('tenant_id', tenantId)

  const adminEmails = new Set((admins || []).map(a => a.email))

  // Compute stats per customer
  const statsMap: Record<string, { orders: number; spent: number }> = {}
  for (const o of orderStats || []) {
    if (!o.customer_id) continue
    if (!statsMap[o.customer_id]) statsMap[o.customer_id] = { orders: 0, spent: 0 }
    statsMap[o.customer_id].orders++
    if (o.payment_status === 'paid') statsMap[o.customer_id].spent += Number(o.total)
  }

  const fmt = (amount: number) =>
    tenant?.currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount.toFixed(2)}`

  const totalRevenue = Object.values(statsMap).reduce((sum, s) => sum + s.spent, 0)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Customers</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>
          {customers?.length || 0} registered · {fmt(totalRevenue)} total revenue
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Customers', value: customers?.length || 0, color: '#3b82f6' },
          { label: 'With Orders', value: Object.keys(statsMap).length, color: '#8b5cf6' },
          { label: 'Total Revenue', value: fmt(totalRevenue), color: '#22c55e' },
          { label: 'Banned', value: customers?.filter(c => c.is_banned).length || 0, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '16px 20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 100px 80px 160px', padding: '12px 20px', borderBottom: '1px solid #eee', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
          <span>Customer</span><span>Joined</span><span>Orders</span><span>Spent</span><span>Status</span><span>Actions</span>
        </div>

        {!customers?.length ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
            No customers yet
          </div>
        ) : (
          customers.map(customer => {
            const stats = statsMap[customer.id] || { orders: 0, spent: 0 }
            const isAdmin = adminEmails.has(customer.email)
            const adminRecord = admins?.find(a => a.email === customer.email)

            return (
              <div key={customer.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 100px 80px 160px', padding: '14px 20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
                {/* Customer info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    backgroundColor: isAdmin ? '#8b5cf620' : '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: isAdmin ? '#8b5cf6' : '#aaa' }}>
                      {(customer.name || customer.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#111', margin: '0 0 1px' }}>
                      {customer.name || '—'}
                      {isAdmin && (
                        <span style={{ marginLeft: '6px', fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: '#8b5cf620', color: '#8b5cf6', fontWeight: 600, textTransform: 'uppercase' }}>
                          {adminRecord?.role || 'admin'}
                        </span>
                      )}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#aaa', margin: 0 }}>{customer.email}</p>
                    {customer.phone && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#bbb', margin: 0 }}>{customer.phone}</p>}
                  </div>
                </div>

                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#888' }}>
                  {new Date(customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>

                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: stats.orders > 0 ? 600 : 400, color: stats.orders > 0 ? '#111' : '#ccc' }}>
                  {stats.orders}
                </span>

                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: stats.spent > 0 ? 600 : 400, color: stats.spent > 0 ? '#22c55e' : '#ccc' }}>
                  {stats.spent > 0 ? fmt(stats.spent) : '—'}
                </span>

                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.65rem',
                  padding: '3px 8px', borderRadius: '20px', display: 'inline-block',
                  backgroundColor: customer.is_banned ? '#ef444418' : '#22c55e18',
                  color: customer.is_banned ? '#ef4444' : '#22c55e',
                  letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500,
                }}>
                  {customer.is_banned ? 'Banned' : 'Active'}
                </span>

                <CustomerActions
                  customerId={customer.id}
                  customerEmail={customer.email}
                  customerName={customer.name || ''}
                  isBanned={customer.is_banned}
                  isAdmin={isAdmin}
                  adminRole={adminRecord?.role || null}
                  tenantId={tenantId}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
