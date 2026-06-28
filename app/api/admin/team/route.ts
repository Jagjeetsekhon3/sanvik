import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
const sb = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, key: process.env.SUPABASE_SERVICE_ROLE_KEY! })

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { url, key } = sb()
  const res = await fetch(
    `${url}/rest/v1/admins?tenant_id=eq.${tenantId}&order=created_at.asc`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  return NextResponse.json(await res.json())
}

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { email, name, role } = await request.json()
  if (!email || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 })

  const { url, key } = sb()

  // Check if already exists
  const checkRes = await fetch(
    `${url}/rest/v1/admins?tenant_id=eq.${tenantId}&email=eq.${encodeURIComponent(email)}&limit=1`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const existing = await checkRes.json()
  if (existing?.length > 0) return NextResponse.json({ error: 'This email is already an admin' }, { status: 400 })

  const res = await fetch(`${url}/rest/v1/admins`, {
    method: 'POST',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify({ tenant_id: tenantId, email: email.toLowerCase().trim(), name: name || email.split('@')[0], role }),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.message || 'Failed to add admin' }, { status: 400 })
  return NextResponse.json(data[0] || data)
}

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { id, role, name } = await request.json()
  const { url, key } = sb()
  const updates: Record<string, string> = {}
  if (role) updates.role = role
  if (name) updates.name = name
  const res = await fetch(`${url}/rest/v1/admins?id=eq.${id}&tenant_id=eq.${tenantId}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(updates),
  })
  const data = await res.json()
  return NextResponse.json(data[0] || { success: true })
}

export async function DELETE(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { id } = await request.json()
  const { url, key } = sb()

  // Prevent deleting the last owner
  const ownersRes = await fetch(
    `${url}/rest/v1/admins?tenant_id=eq.${tenantId}&role=eq.owner`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const owners = await ownersRes.json()
  const thisAdmin = owners?.find((a: { id: string }) => a.id === id)
  if (thisAdmin && owners?.length <= 1) {
    return NextResponse.json({ error: 'Cannot remove the only owner' }, { status: 400 })
  }

  await fetch(`${url}/rest/v1/admins?id=eq.${id}&tenant_id=eq.${tenantId}`, {
    method: 'DELETE',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
  })
  return NextResponse.json({ success: true })
}
