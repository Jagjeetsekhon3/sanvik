import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import Link from 'next/link'

interface PageProps {
  params: { id: string }
  searchParams: { status?: string; method?: string }
}

export default async function OrderConfirmPage({ params, searchParams }: PageProps) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!order) notFound()

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  const fmt = (amount: number) =>
    tenant.currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toFixed(2)}`

  const isPaid = searchParams.status === 'paid' || order.payment_status === 'paid'
  const isCOD = order.payment_method === 'cod'
  const address = order.shipping_address as {
    name: string; line1: string; line2?: string; city: string; state: string; pincode: string; country: string
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 32px', textAlign: 'center' }}>
      {/* Status icon */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        backgroundColor: isPaid || isCOD ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        {isPaid || isCOD ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '0.68rem',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--color-accent)', margin: '0 0 12px',
      }}>
        {isPaid ? 'Payment Confirmed' : isCOD ? 'Order Confirmed' : 'Order Placed'}
      </p>

      <h1 style={{
        fontFamily: 'var(--font-heading)', fontSize: '2rem',
        fontWeight: 600, margin: '0 0 12px',
      }}>
        Thank you, {address.name.split(' ')[0]}!
      </h1>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
        opacity: 0.6, margin: '0 0 40px', lineHeight: 1.6,
      }}>
        {isCOD
          ? 'Your order has been placed. Pay when it arrives.'
          : isPaid
          ? 'Your payment was successful. We\'ll start preparing your order.'
          : 'Your order is being processed.'}
      </p>

      {/* Order number */}
      <div style={{
        border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px',
        padding: '20px 24px', marginBottom: '24px', textAlign: 'left',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 4px' }}>Order Number</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{order.order_number}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 4px' }}>Total</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{fmt(order.total)}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 8px' }}>Delivering to</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
            {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
            {address.city}, {address.state} {address.pincode}
          </p>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '32px', textAlign: 'left' }}>
        {(order.items as Array<{
          product_name: string; product_image: string;
          size: string; color: string; quantity: number; price: number
        }>).map((item, i) => (
          <div key={i} style={{
            display: 'flex', gap: '12px', padding: '14px 0',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{ width: '48px', height: '60px', backgroundColor: 'rgba(0,0,0,0.04)', flexShrink: 0, overflow: 'hidden' }}>
              {item.product_image && (
                <img src={item.product_image} alt={item.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, margin: '0 0 3px' }}>{item.product_name}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.45, margin: 0 }}>
                {item.size} · {item.color} · Qty {item.quantity}
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, margin: 0 }}>
              {fmt(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link href="/shop" style={{
          display: 'inline-block', padding: '14px 32px',
          backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)',
          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          textDecoration: 'none', fontWeight: 600,
        }}>
          Continue Shopping
        </Link>
        <Link href="/account" style={{
          display: 'inline-block', padding: '14px 32px',
          border: '1px solid rgba(0,0,0,0.15)',
          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          textDecoration: 'none', color: 'var(--color-text)', opacity: 0.6,
        }}>
          View Orders
        </Link>
      </div>
    </div>
  )
}
