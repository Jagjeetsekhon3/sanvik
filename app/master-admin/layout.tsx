import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { getTenantById } from '@/lib/tenant'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) redirect('/auth/login')

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  // Check if user is admin for this tenant
  const serviceClient = createServiceClient()
  const { data: admin } = await serviceClient
    .from('admins')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('email', session.user.email!)
    .single()

  // Also allow if they're in super_admins
  const { data: superAdmin } = await serviceClient
    .from('super_admins')
    .select('id')
    .eq('email', session.user.email!)
    .single()

  if (!admin && !superAdmin) redirect('/')

  const tenant = await getTenantById(tenantId)
  if (!tenant) redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f8f8' }}>
      <AdminSidebar tenant={tenant} adminName={admin?.name || superAdmin ? 'Super Admin' : ''} />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
