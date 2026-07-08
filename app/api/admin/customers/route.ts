import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
const sb = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, key: process.env.SUPABASE_SERVICE_ROLE_KEY! })

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { customerId, ...updates } = await request.json()
  const { url, key } = sb()
  await fetch(`${url}/rest/v1/customers?id=eq.${customerId}&tenant_id=eq.${tenantId}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return NextResponse.json({ success: true })
}
