import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, tenantId, orderId } = await request.json()

    // Get tenant Razorpay keys
    const supabase = createServiceClient()
    const { data: tenant } = await supabase
      .from('tenants')
      .select('razorpay_key_id, razorpay_key_secret')
      .eq('id', tenantId)
      .single()

    if (!tenant?.razorpay_key_id || !tenant?.razorpay_key_secret) {
      return NextResponse.json({ error: 'Razorpay not configured for this store' }, { status: 400 })
    }

    // Create Razorpay order via their API
    const auth = Buffer.from(`${tenant.razorpay_key_id}:${tenant.razorpay_key_secret}`).toString('base64')

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay uses paise
        currency: currency || 'INR',
        receipt: orderId,
        notes: { order_id: orderId },
      }),
    })

    if (!rzpRes.ok) {
      const err = await rzpRes.json()
      return NextResponse.json({ error: err.error?.description || 'Razorpay error' }, { status: 400 })
    }

    const rzpOrder = await rzpRes.json()

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      keyId: tenant.razorpay_key_id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
