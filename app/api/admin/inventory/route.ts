import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const sb = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
})

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
  const { url, key } = sb()

  const res = await fetch(
    `${url}/rest/v1/products?tenant_id=eq.${tenantId}&is_active=eq.true&select=id,name,category,images,base_price,product_variants(id,size,color,color_hex,stock,sku,price_override)&order=name.asc`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const data = await res.json()
  return NextResponse.json(data)
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
