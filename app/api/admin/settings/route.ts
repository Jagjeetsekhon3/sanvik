import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function PUT(request: NextRequest) {
  // Get tenant ID from middleware header
  const tenantId = request.headers.get('x-tenant-id')

  // Debug — log all headers
  const allHeaders: Record<string, string> = {}
  request.headers.forEach((val, key) => { allHeaders[key] = val })

  if (!tenantId) {
    return NextResponse.json({
      error: 'No tenant ID in headers',
      headers: allHeaders,
    }, { status: 400 })
  }

  const updates = await request.json()
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)

  if (error) {
    return NextResponse.json({ error: error.message, tenantId }, { status: 400 })
  }

  // Read back what was saved
  const { data: saved } = await supabase
    .from('tenants')
    .select('id, brand_name, primary_color, accent_color')
    .eq('id', tenantId)
    .single()

  revalidatePath('/', 'layout')
  revalidatePath('/master-admin', 'layout')

  return NextResponse.json({ success: true, saved, tenantId })
}
