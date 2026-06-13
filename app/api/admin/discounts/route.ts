import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const body = await request.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('discount_codes').insert({ ...body, tenant_id: tenantId }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ discount: data })
}

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { id, ...updates } = await request.json()
  const supabase = createServiceClient()
  await supabase.from('discount_codes').update(updates).eq('id', id).eq('tenant_id', tenantId)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { id } = await request.json()
  const supabase = createServiceClient()
  await supabase.from('discount_codes').delete().eq('id', id).eq('tenant_id', tenantId)
  return NextResponse.json({ success: true })
}
