import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${url}/rest/v1/tenants?id=eq.${tenantId}&select=cod_enabled,razorpay_key_id,stripe_publishable_key,paypal_client_id,currency&limit=1`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const data = await res.json()
  const config = data?.[0]
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    cod_enabled: config.cod_enabled,
    has_razorpay: !!config.razorpay_key_id,
    has_stripe: !!config.stripe_publishable_key,
    has_paypal: !!config.paypal_client_id,
    currency: config.currency,
  })
}
