import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, tenantId, orderId } = await request.json()

    const supabase = createServiceClient()
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_secret_key, stripe_publishable_key')
      .eq('id', tenantId)
      .single()

    if (!tenant?.stripe_secret_key) {
      return NextResponse.json({ error: 'Stripe not configured for this store' }, { status: 400 })
    }

    // Dynamically import Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(tenant.stripe_secret_key, { apiVersion: '2024-06-20' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: (currency || 'usd').toLowerCase(),
      metadata: { order_id: orderId },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: tenant.stripe_publishable_key,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
