'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/store/CartContext'
import { useTenant } from '@/components/TenantProvider'
import { Address } from '@/types'
import { useRouter } from 'next/navigation'

type Step = 'address' | 'payment' | 'processing'

const INPUT_STYLE = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: '2px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  backgroundColor: 'transparent',
  color: 'var(--color-text)',
  outline: 'none',
}

const LABEL_STYLE = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  opacity: 0.5,
  display: 'block',
  marginBottom: '6px',
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const tenant = useTenant()
  const router = useRouter()

  const [step, setStep] = useState<Step>('address')
  const [error, setError] = useState<string | null>(null)
  const [discountCode, setDiscountCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe' | 'cod'>('razorpay')
  const [availableMethods, setAvailableMethods] = useState<{id: string; label: string; sub: string; flag: string}[]>([])

  // Build available payment methods from tenant config
  useEffect(() => {
    const methods = []
    if (tenant.razorpay_key_id) {
      methods.push({ id: 'razorpay', label: 'Pay Online (UPI / Cards / NetBanking)', sub: 'Powered by Razorpay', flag: '🇮🇳' })
    }
    if (tenant.stripe_publishable_key) {
      methods.push({ id: 'stripe', label: 'Pay with Card (International)', sub: 'Powered by Stripe', flag: '🌍' })
    }
    if (tenant.cod_enabled) {
      methods.push({ id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', flag: '💵' })
    }
    // Fallback — show all if none configured yet
    if (methods.length === 0) {
      methods.push({ id: 'razorpay', label: 'Pay Online (UPI / Cards / NetBanking)', sub: 'Powered by Razorpay', flag: '🇮🇳' })
      methods.push({ id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', flag: '💵' })
    }
    setAvailableMethods(methods)
    setPaymentMethod(methods[0].id as 'razorpay' | 'stripe' | 'cod')
  }, [tenant])

  const [address, setAddress] = useState<Address>({
    name: '', phone: '', line1: '', line2: null,
    city: '', state: '', pincode: '', country: 'India',
  })

  const fmt = (amount: number) =>
    tenant.currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toFixed(2)}`

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  const validateAddress = () => {
    const required: (keyof Address)[] = ['name', 'phone', 'line1', 'city', 'state', 'pincode']
    for (const field of required) {
      if (!address[field]) return `${field} is required`
    }
    return null
  }

  const handleAddressSubmit = () => {
    const err = validateAddress()
    if (err) { setError(err); return }
    setError(null)
    setStep('payment')
  }

  const handlePlaceOrder = async () => {
    setStep('processing')
    setError(null)

    try {
      // Step 1: Create order in DB
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: address,
          paymentMethod,
          discountCode: discountCode || undefined,
        }),
      })

      const { order, error: orderError } = await orderRes.json()
      if (orderError || !order) throw new Error(orderError || 'Failed to create order')

      // Step 2: Handle payment
      if (paymentMethod === 'cod') {
        clearCart()
        router.push(`/order/${order.id}?status=confirmed`)
        return
      }

      if (paymentMethod === 'razorpay') {
        await handleRazorpay(order)
        return
      }

      if (paymentMethod === 'stripe') {
        await handleStripe(order)
        return
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setStep('payment')
    }
  }

  const handleRazorpay = async (order: { id: string; total: number; tenant_id: string }) => {
    const rzpRes = await fetch('/api/payments/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: order.total,
        currency: 'INR',
        tenantId: order.tenant_id,
        orderId: order.id,
      }),
    })

    const { razorpayOrderId, keyId, error: rzpError } = await rzpRes.json()
    if (rzpError) throw new Error(rzpError)

    // Load Razorpay script dynamically
    await loadScript('https://checkout.razorpay.com/v1/checkout.js')

    const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
      key: keyId,
      amount: order.total * 100,
      currency: 'INR',
      order_id: razorpayOrderId,
      name: tenant.brand_name,
      description: `Order ${order.id}`,
      prefill: { name: address.name, contact: address.phone },
      theme: { color: tenant.accent_color },
      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        // Verify payment
        await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...response,
            order_id: order.id,
          }),
        })
        clearCart()
        router.push(`/order/${order.id}?status=paid`)
      },
    })

    rzp.open()
    setStep('payment')
  }

  const handleStripe = async (order: { id: string; total: number; tenant_id: string }) => {
    const stripeRes = await fetch('/api/payments/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: order.total,
        currency: 'usd',
        tenantId: order.tenant_id,
        orderId: order.id,
      }),
    })

    const { clientSecret, publishableKey, error: stripeError } = await stripeRes.json()
    if (stripeError) throw new Error(stripeError)

    // Redirect to Stripe-hosted page for now (simplest integration)
    // Full embedded Stripe Elements can be added in Phase 4
    clearCart()
    router.push(`/order/${order.id}?status=pending&method=stripe`)
  }

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
      const s = document.createElement('script')
      s.src = src
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(s)
    })
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', opacity: 0.4 }}>
        <p style={{ fontFamily: 'var(--font-body)' }}>Your bag is empty.</p>
        <a href="/shop" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text)', textDecoration: 'underline' }}>Continue shopping</a>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 600, margin: '0 0 40px', letterSpacing: '0.03em' }}>
        Checkout
      </h1>

      <div className="fashn-checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '60px', alignItems: 'start' }}>

        {/* ── Left: Steps ── */}
        <div>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '40px' }}>
            {(['address', 'payment'] as const).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {i > 0 && <div style={{ width: '40px', height: '1px', backgroundColor: 'rgba(0,0,0,0.15)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: step === s ? 'var(--color-primary)' : (
                      (s === 'address' && step === 'payment') ? 'var(--color-accent)' : 'rgba(0,0,0,0.08)'
                    ),
                    color: step === s ? 'var(--color-secondary)' : (
                      (s === 'address' && step === 'payment') ? '#fff' : 'rgba(0,0,0,0.3)'
                    ),
                    fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 600,
                  }}>
                    {s === 'address' && step === 'payment' ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    opacity: step === s ? 1 : 0.4, fontWeight: step === s ? 600 : 400,
                  }}>
                    {s === 'address' ? 'Delivery' : 'Payment'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: '4px', padding: '12px 16px', marginBottom: '24px',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          {/* ── ADDRESS STEP ── */}
          {step === 'address' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={LABEL_STYLE}>Full Name *</label>
                  <input style={INPUT_STYLE} value={address.name} onChange={e => updateAddress('name', e.target.value)} placeholder="Jagjeet Singh" />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Phone *</label>
                  <input style={INPUT_STYLE} value={address.phone} onChange={e => updateAddress('phone', e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={LABEL_STYLE}>Address Line 1 *</label>
                <input style={INPUT_STYLE} value={address.line1} onChange={e => updateAddress('line1', e.target.value)} placeholder="House / Flat / Block No." />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={LABEL_STYLE}>Address Line 2</label>
                <input style={INPUT_STYLE} value={address.line2 || ''} onChange={e => updateAddress('line2', e.target.value)} placeholder="Street / Locality / Area" />
              </div>

              <div className="fashn-checkout-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={LABEL_STYLE}>City *</label>
                  <input style={INPUT_STYLE} value={address.city} onChange={e => updateAddress('city', e.target.value)} placeholder="Gurugram" />
                </div>
                <div>
                  <label style={LABEL_STYLE}>State *</label>
                  <input style={INPUT_STYLE} value={address.state} onChange={e => updateAddress('state', e.target.value)} placeholder="Haryana" />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Pincode *</label>
                  <input style={INPUT_STYLE} value={address.pincode} onChange={e => updateAddress('pincode', e.target.value)} placeholder="122001" />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={LABEL_STYLE}>Country</label>
                <select
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  value={address.country}
                  onChange={e => updateAddress('country', e.target.value)}
                >
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>UAE</option>
                  <option>Singapore</option>
                </select>
              </div>

              <button onClick={handleAddressSubmit} style={{
                width: '100%', padding: '18px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
              }}>
                Continue to Payment
              </button>
            </div>
          )}

          {/* ── PAYMENT STEP ── */}
          {(step === 'payment' || step === 'processing') && (
            <div>
              {/* Delivery summary */}
              <div style={{
                border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px',
                padding: '16px 20px', marginBottom: '28px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.4, margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delivering to</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', margin: 0 }}>
                    {address.name} · {address.line1}, {address.city} {address.pincode}
                  </p>
                </div>
                <button onClick={() => setStep('address')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                  opacity: 0.4, textDecoration: 'underline', color: 'var(--color-text)',
                }}>Edit</button>
              </div>

              {/* Payment methods */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '16px' }}>
                Payment Method
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {[
                ...availableMethods,
                ].map(method => (
                  <label key={method.id} style={{
                    border: '1px solid',
                    borderColor: paymentMethod === method.id ? 'var(--color-primary)' : 'rgba(0,0,0,0.12)',
                    borderRadius: '4px', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === method.id ? 'rgba(0,0,0,0.02)' : 'transparent',
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id as typeof paymentMethod}
                      onChange={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span style={{ fontSize: '1.2rem' }}>{method.flag}</span>
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 3px' }}>{method.label}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.4, margin: 0 }}>{method.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Discount code */}
              <div style={{ marginBottom: '28px' }}>
                <label style={LABEL_STYLE}>Discount Code</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    style={{ ...INPUT_STYLE, flex: 1 }}
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                  />
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={step === 'processing'}
                style={{
                  width: '100%', padding: '18px',
                  backgroundColor: step === 'processing' ? 'rgba(0,0,0,0.3)' : 'var(--color-primary)',
                  color: 'var(--color-secondary)',
                  border: 'none', cursor: step === 'processing' ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                  transition: 'background-color 0.2s ease',
                }}
              >
                {step === 'processing' ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="fashn-checkout-summary" style={{ position: 'sticky', top: '96px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 20px' }}>
            Order Summary
          </p>

          {/* Items */}
          <div style={{ marginBottom: '24px' }}>
            {items.map(item => (
              <div key={`${item.product_id}-${item.variant_id}`} style={{
                display: 'flex', gap: '12px', marginBottom: '16px',
              }}>
                <div style={{
                  width: '56px', height: '68px', flexShrink: 0,
                  backgroundColor: 'rgba(0,0,0,0.04)', overflow: 'hidden',
                  position: 'relative',
                }}>
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)',
                    width: '18px', height: '18px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700,
                  }}>{item.quantity}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, margin: '0 0 3px' }}>{item.product_name}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.45, margin: 0 }}>{item.size} · {item.color}</p>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, margin: 0, whiteSpace: 'nowrap' }}>
                  {fmt(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.5 }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>{fmt(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.5 }}>Shipping</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-accent)' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
