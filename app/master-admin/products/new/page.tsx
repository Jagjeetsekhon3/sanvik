import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()
  return <ProductForm tenantId={tenantId} />
}
