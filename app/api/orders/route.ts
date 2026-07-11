import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/payments/orders'

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const body = await request.json()
    const { items, shippingAddress, paymentMethod, discountCode, notes, customerId } = body

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!shippingAddress) return NextResponse.json({ error: 'Address required' }, { status: 400 })
    if (!paymentMethod) return NextResponse.json({ error: 'Payment method required' }, { status: 400 })

    // Validate payment method against tenant config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const tenantRes = await fetch(
      `${supabaseUrl}/rest/v1/tenants?id=eq.${tenantId}&select=cod_enabled,razorpay_key_id,stripe_publishable_key&limit=1`,
      { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }, cache: 'no-store' }
    )
    const tenantData = await tenantRes.json()
    const tc = tenantData?.[0]

    if (paymentMethod === 'cod' && !tc?.cod_enabled) {
      return NextResponse.json({ error: 'Cash on Delivery is not available for this store' }, { status: 400 })
    }
    if (paymentMethod === 'razorpay' && !tc?.razorpay_key_id) {
      return NextResponse.json({ error: 'Razorpay is not configured for this store' }, { status: 400 })
    }
    if (paymentMethod === 'stripe' && !tc?.stripe_publishable_key) {
      return NextResponse.json({ error: 'Stripe is not configured for this store' }, { status: 400 })
    }

    const order = await createOrder({
      tenantId,
      customerId: customerId || null,
      items,
      shippingAddress,
      paymentMethod,
      discountCode,
      notes,
    })

    return NextResponse.json({ order })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
