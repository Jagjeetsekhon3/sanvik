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
