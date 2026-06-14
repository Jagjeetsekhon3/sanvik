import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantById } from '@/lib/tenant'
import SettingsForm from '@/components/admin/SettingsForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminSettingsPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Store Settings</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888', margin: 0 }}>Manage your brand, theme, and payment configuration</p>
      </div>
      <SettingsForm tenant={tenant} />
    </div>
  )
}
