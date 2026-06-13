import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantById } from '@/lib/tenant'
import { TenantProvider } from '@/components/TenantProvider'
import { CartProvider } from '@/components/store/CartContext'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import { Tenant } from '@/types'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')

  // Allow API routes without tenant
  if (!tenantId) {
    return (
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>{children}</body>
      </html>
    )
  }

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  const cssVars = `
    :root {
      --color-primary: ${tenant.primary_color};
      --color-secondary: ${tenant.secondary_color};
      --color-accent: ${tenant.accent_color};
      --color-bg: ${tenant.background_color};
      --color-text: ${tenant.text_color};
      --font-heading: '${tenant.font_heading}';
      --font-body: '${tenant.font_body}';
    }
    * { box-sizing: border-box; }
    body {
      font-family: var(--font-body), sans-serif;
      background-color: var(--color-bg);
      color: var(--color-text);
      margin: 0; padding: 0;
    }
    h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading), serif; }
    a { color: inherit; }
  `

  return (
    <html lang="en">
      <head>
        <title>{tenant.brand_name}</title>
        <meta name="description" content={tenant.tagline || tenant.brand_name} />
        {tenant.favicon_url && <link rel="icon" href={tenant.favicon_url} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={`https://fonts.googleapis.com/css2?family=${tenant.font_heading.replace(/ /g, '+')}:wght@400;500;600;700&family=${tenant.font_body.replace(/ /g, '+')}:wght@300;400;500&display=swap`}
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body>
        <TenantProvider tenant={tenant}>
          <CartProvider>
            <Navbar />
            <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
              {children}
            </main>
            <Footer tenant={tenant} />
          </CartProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
