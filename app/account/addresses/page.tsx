import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AddressManager from '@/components/auth/AddressManager'

export default async function AddressesPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) redirect('/auth/login')

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const serviceClient = createServiceClient()

  const { data: customer } = await serviceClient
    .from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('email', session.user.email!)
    .single()

  const { data: addresses } = customer ? await serviceClient
    .from('addresses')
    .select('*')
    .eq('customer_id', customer.id)
    .order('is_default', { ascending: false }) : { data: [] }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/account" style={{ color: 'var(--color-text)', opacity: 0.4, textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5m7-7l-7 7 7 7"/>
            </svg>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>
            Addresses
          </h1>
        </div>
      </div>

      <AddressManager
        addresses={addresses || []}
        customerId={customer?.id || ''}
      />
    </div>
  )
}
