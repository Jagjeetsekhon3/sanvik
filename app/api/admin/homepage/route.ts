import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
const sb = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, key: process.env.SUPABASE_SERVICE_ROLE_KEY! })

const DEFAULT_SECTIONS = [
  { id: '1', type: 'banner', enabled: true },
  { id: '2', type: 'new_arrivals', enabled: true, title: 'New Arrivals', limit: 4 },
  { id: '3', type: 'featured_products', enabled: true, title: 'Featured', limit: 8 },
  { id: '4', type: 'brand_story', enabled: true },
  { id: '5', type: 'instagram_feed', enabled: false },
]

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { url, key } = sb()
  const res = await fetch(`${url}/rest/v1/homepage_config?tenant_id=eq.${tenantId}&limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data?.[0] || { sections: DEFAULT_SECTIONS })
}

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { sections } = await request.json()
  const { url, key } = sb()
  await fetch(`${url}/rest/v1/homepage_config?tenant_id=eq.${tenantId}`, {
    method: 'DELETE', headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
  })
  await fetch(`${url}/rest/v1/homepage_config`, {
    method: 'POST',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant_id: tenantId, sections }),
  })
  return NextResponse.json({ success: true })
}
