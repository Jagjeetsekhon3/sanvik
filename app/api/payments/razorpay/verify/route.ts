import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = JSON.parse(body)

    // Get order to find tenant
    const supabase = createServiceClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, tenant_id')
      .eq('id', order_id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Get tenant secret to verify
    const { data: tenant } = await supabase
      .from('tenants')
      .select('razorpay_key_secret')
      .eq('id', order.tenant_id)
      .single()

    if (!tenant?.razorpay_key_secret) {
      return NextResponse.json({ error: 'Tenant config missing' }, { status: 400 })
    }

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', tenant.razorpay_key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Update order as paid
    await supabase
      .from('orders')
      .update({
        payment_id: razorpay_payment_id,
        payment_status: 'paid',
        order_status: 'confirmed',
      })
      .eq('id', order_id)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
