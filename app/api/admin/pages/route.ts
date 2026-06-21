import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
const sb = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, key: process.env.SUPABASE_SERVICE_ROLE_KEY! })

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { url, key } = sb()
  const res = await fetch(`${url}/rest/v1/pages?tenant_id=eq.${tenantId}&order=title.asc`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const body = await request.json()
  const { url, key } = sb()
  const res = await fetch(`${url}/rest/v1/pages`, {
    method: 'POST',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify({ ...body, tenant_id: tenantId }),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.message || 'Failed' }, { status: 400 })
  return NextResponse.json(data[0] || data)
}

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { id, ...updates } = await request.json()
  const { url, key } = sb()
  const res = await fetch(`${url}/rest/v1/pages?id=eq.${id}&tenant_id=eq.${tenantId}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  })
  const data = await res.json()
  return NextResponse.json(data[0] || { success: true })
}

export async function DELETE(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { id } = await request.json()
  const { url, key } = sb()
  await fetch(`${url}/rest/v1/pages?id=eq.${id}&tenant_id=eq.${tenantId}`, {
    method: 'DELETE',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
  })
  return NextResponse.json({ success: true })
}
