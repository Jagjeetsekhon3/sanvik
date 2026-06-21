import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

async function getProduct(tenantId: string, id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${supabaseUrl}/rest/v1/products?id=eq.${id}&tenant_id=eq.${tenantId}&select=*,variants:product_variants(*)&limit=1`,
    {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      cache: 'no-store',
    }
  )
  const data = await res.json()
  return data?.[0] || null
}

export default async function EditProductPage({ params }: PageProps) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const product = await getProduct(tenantId, params.id)
  if (!product) notFound()

  return <ProductForm product={product} tenantId={tenantId} />
}
