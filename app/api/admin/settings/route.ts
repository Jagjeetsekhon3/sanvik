import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

  const updates = await request.json()
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Revalidate all pages so new brand config is picked up immediately
  revalidatePath('/', 'layout')
  revalidatePath('/master-admin', 'layout')

  return NextResponse.json({ success: true })
}
