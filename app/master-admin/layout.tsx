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
  const serviceClient = createServiceClient()

  // Use service role to bypass RLS completely
  const { data: admins } = await serviceClient
    .from('admins')
    .select('*')
    .eq('tenant_id', tenantId)

  const { data: superAdmins } = await serviceClient
    .from('super_admins')
    .select('*')

  const admin = admins?.find(a => a.email.toLowerCase() === email.toLowerCase())
  const superAdmin = superAdmins?.find(s => s.email.toLowerCase() === email.toLowerCase())

  if (!admin && !superAdmin) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace', fontSize: '14px' }}>
        <p>Access denied.</p>
        <p>Email: <strong>{email}</strong></p>
        <p>Admins in DB: <strong>{JSON.stringify(admins?.map(a => a.email))}</strong></p>
        <p>Run in Supabase SQL Editor:</p>
        <pre style={{ background: '#f5f5f5', padding: '16px' }}>
{`ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
INSERT INTO admins (tenant_id, email, name, role)
VALUES ('${tenantId}', '${email}', 'Jagjeet', 'owner')
ON CONFLICT (tenant_id, email) DO NOTHING;`}
        </pre>
      </div>
    )
  }

  const tenant = await getTenantById(tenantId)
  if (!tenant) redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f8f8' }}>
      <AdminSidebar tenant={tenant} adminName={admin?.name || superAdmin?.name || email} />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
