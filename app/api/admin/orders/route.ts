import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const { orderId, order_status, payment_status } = await request.json()
    const supabase = createServiceClient()

    const updates: Record<string, string> = {}
    if (order_status) updates.order_status = order_status
    if (payment_status) updates.payment_status = payment_status

    await supabase.from('orders').update(updates).eq('id', orderId).eq('tenant_id', tenantId)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
