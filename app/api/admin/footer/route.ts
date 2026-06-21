import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const sb = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, key: process.env.SUPABASE_SERVICE_ROLE_KEY! })

const DEFAULTS = {
  bg_color: '#111111', text_color: '#ffffff',
  show_logo: true, show_tagline: true, show_socials: true,
  show_newsletter: false, newsletter_text: 'Subscribe to our newsletter',
  columns: [], bottom_text: null, show_payments: true,
}

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { url, key } = sb()
  const res = await fetch(`${url}/rest/v1/footer_config?tenant_id=eq.${tenantId}&limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data?.[0] || DEFAULTS)
}

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const updates = await request.json()
  const { url, key } = sb()
  await fetch(`${url}/rest/v1/footer_config?tenant_id=eq.${tenantId}`, {
    method: 'DELETE',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
  })
  const res = await fetch(`${url}/rest/v1/footer_config`, {
    method: 'POST',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify({ ...updates, tenant_id: tenantId }),
  })
  const data = await res.json()
  return NextResponse.json({ success: true, config: data?.[0] })
}
