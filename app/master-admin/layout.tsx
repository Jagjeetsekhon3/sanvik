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

  if (!session?.user?.email) redirect('/auth/login')

  const email = session.user.email

  // Check admin or super admin
  const serviceClient = createServiceClient()

  const [{ data: admin }, { data: superAdmin }] = await Promise.all([
    serviceClient
      .from('admins')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .maybeSingle(),
    serviceClient
      .from('super_admins')
      .select('id, name')
      .eq('email', email)
      .maybeSingle(),
  ])

  if (!admin && !superAdmin) {
    // Debug: return what we found instead of redirecting
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace', fontSize: '14px' }}>
        <p>Access denied.</p>
        <p>Logged in as: <strong>{email}</strong></p>
        <p>Tenant ID: <strong>{tenantId}</strong></p>
        <p>Admin record found: <strong>{admin ? 'YES' : 'NO'}</strong></p>
        <p>Super admin found: <strong>{superAdmin ? 'YES' : 'NO'}</strong></p>
        <p style={{ marginTop: '20px', opacity: 0.6 }}>
          If admin is NO, run this in Supabase SQL Editor:
        </p>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
{`INSERT INTO admins (tenant_id, email, name, role)
VALUES ('${tenantId}', '${email}', 'Jagjeet', 'owner')
ON CONFLICT (tenant_id, email) DO NOTHING;`}
        </pre>
      </div>
    )
  }

  const tenant = await getTenantById(tenantId)
  if (!tenant) redirect('/')

  const adminName = admin?.name || superAdmin?.name || email

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f8f8' }}>
      <AdminSidebar tenant={tenant} adminName={adminName} />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
