import { headers } from 'next/headers'
import { getTenantById } from '@/lib/tenant'

export default async function HomePage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  const tenant = tenantId ? await getTenantById(tenantId) : null

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px',
    }}>
      <div style={{
        width: '48px',
        height: '4px',
        backgroundColor: 'var(--color-accent)',
        borderRadius: '2px',
      }} />
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '3rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        margin: 0,
        color: 'var(--color-primary)',
      }}>
        {tenant?.brand_name || 'FASHN'}
      </h1>
      {tenant?.tagline && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          letterSpacing: '0.2em',
          color: 'var(--color-text)',
          opacity: 0.6,
          margin: 0,
          textTransform: 'uppercase',
        }}>
          {tenant.tagline}
        </p>
      )}
      <p style={{
        fontSize: '0.75rem',
        opacity: 0.3,
        marginTop: '40px',
        fontFamily: 'var(--font-body)',
      }}>
        Phase 1 complete — storefront coming in Phase 2
      </p>
    </main>
  )
}
