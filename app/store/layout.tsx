import { headers } from 'next/headers'
import { getTenantById } from '@/lib/tenant'
import { CartProvider } from '@/components/store/CartContext'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import { notFound } from 'next/navigation'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  return (
    <CartProvider>
      <Navbar />
      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
        {children}
      </main>
      <Footer tenant={tenant} />
    </CartProvider>
  )
}
