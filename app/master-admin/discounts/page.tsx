import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getTenantById } from '@/lib/tenant'
import DiscountManager from '@/components/admin/DiscountManager'

export default async function AdminDiscountsPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const supabase = createServiceClient()
  const tenant = await getTenantById(tenantId)

  const { data: discounts } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Discounts</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888', margin: 0 }}>Create and manage discount codes</p>
      </div>
      <DiscountManager discounts={discounts || []} tenantId={tenantId} />
    </div>
  )
}
