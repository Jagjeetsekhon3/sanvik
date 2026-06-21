import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const sb = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, key: process.env.SUPABASE_SERVICE_ROLE_KEY! })

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { url, key } = sb()

  // Fetch products
  const productsRes = await fetch(
    `${url}/rest/v1/products?tenant_id=eq.${tenantId}&is_active=eq.true&order=name.asc&select=id,name,category,images,base_price`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const products = await productsRes.json()
  if (!Array.isArray(products)) return NextResponse.json([])

  // Fetch all variants for this tenant's products in one query
  const productIds = products.map((p: { id: string }) => p.id)
  if (productIds.length === 0) return NextResponse.json([])

  const variantsRes = await fetch(
    `${url}/rest/v1/product_variants?product_id=in.(${productIds.join(',')})&order=product_id.asc`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const variants = await variantsRes.json()

  // Join variants to products
  const result = products.map((p: Record<string, unknown>) => ({
    ...p,
    product_variants: Array.isArray(variants)
      ? variants.filter((v: Record<string, unknown>) => v.product_id === p.id)
      : [],
  }))

  return NextResponse.json(result)
}

export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

  const { variantId, stock, sku } = await request.json()
  const { url, key } = sb()

  const updates: Record<string, unknown> = {}
  if (stock !== undefined) updates.stock = stock
  if (sku !== undefined) updates.sku = sku

  await fetch(`${url}/rest/v1/product_variants?id=eq.${variantId}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  return NextResponse.json({ success: true })
}
