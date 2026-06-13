import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantById } from '@/lib/tenant'
import { TenantProvider } from '@/components/TenantProvider'
import { Tenant } from '@/types'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read tenant ID injected by middleware
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')

  if (!tenantId) notFound()

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  // Build CSS variable string from tenant theme
  const cssVars = buildCssVars(tenant)

  return (
    <html lang="en">
      <head>
        <title>{tenant.brand_name}</title>
        <meta name="description" content={tenant.tagline || tenant.brand_name} />
        {tenant.favicon_url && <link rel="icon" href={tenant.favicon_url} />}

        {/* Load Google Fonts for this tenant */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={`https://fonts.googleapis.com/css2?family=${encodeFontName(tenant.font_heading)}:wght@400;500;600;700&family=${encodeFontName(tenant.font_body)}:wght@300;400;500&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, ...cssVarsToStyle(tenant) }}>
        {/* Inject CSS variables */}
        <style>{`
          :root {
            ${cssVars}
          }
          * { box-sizing: border-box; }
          body {
            font-family: var(--font-body), sans-serif;
            background-color: var(--color-bg);
            color: var(--color-text);
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading), serif;
          }
        `}</style>

        <TenantProvider tenant={tenant}>
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}

// ── Helpers ────────────────────────────────────────────────────────

function buildCssVars(tenant: Tenant): string {
  return `
    --color-primary: ${tenant.primary_color};
    --color-secondary: ${tenant.secondary_color};
    --color-accent: ${tenant.accent_color};
    --color-bg: ${tenant.background_color};
    --color-text: ${tenant.text_color};
    --font-heading: '${tenant.font_heading}';
    --font-body: '${tenant.font_body}';
  `
}

function cssVarsToStyle(tenant: Tenant): React.CSSProperties {
  return {
    '--color-primary': tenant.primary_color,
    '--color-secondary': tenant.secondary_color,
    '--color-accent': tenant.accent_color,
    '--color-bg': tenant.background_color,
    '--color-text': tenant.text_color,
    '--font-heading': `'${tenant.font_heading}'`,
    '--font-body': `'${tenant.font_body}'`,
  } as React.CSSProperties
}

function encodeFontName(font: string): string {
  return font.replace(/ /g, '+')
}
