import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

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

  // Read back what was saved to confirm
  const { data: saved } = await supabase
    .from('tenants')
    .select('id, brand_name, primary_color, accent_color')
    .eq('id', tenantId)
    .single()

  // Bust all caches
  revalidatePath('/', 'layout')
  revalidatePath('/master-admin', 'layout')
  revalidatePath('/master-admin/settings', 'page')

  return NextResponse.json(
    { success: true, saved },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    }
  )
}
