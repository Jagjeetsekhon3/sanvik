import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Get products
  const productsRes = await fetch(
    `${url}/rest/v1/products?tenant_id=eq.${tenantId}&select=id,name&limit=5`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const products = await productsRes.json()

  // Get ALL variants no filter
  const variantsRes = await fetch(
    `${url}/rest/v1/product_variants?limit=20`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const variants = await variantsRes.json()

  // Try inserting a test variant for first product
  let testInsert = null
  if (Array.isArray(products) && products.length > 0) {
    const testRes = await fetch(`${url}/rest/v1/product_variants`, {
      method: 'POST',
      headers: {
        'apikey': key, 'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json', 'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        product_id: products[0].id,
        size: 'TEST', color: 'TestColor', color_hex: '#ff0000', stock: 99,
      }),
    })
    testInsert = { status: testRes.status, data: await testRes.json() }

    // Clean up test insert
    if (testRes.ok && testInsert.data?.[0]?.id) {
      await fetch(`${url}/rest/v1/product_variants?id=eq.${testInsert.data[0].id}`, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      })
    }
  }

  return NextResponse.json({
    tenant_id: tenantId,
    products: Array.isArray(products) ? products : { error: products },
    variants_count: Array.isArray(variants) ? variants.length : 0,
    variants: Array.isArray(variants) ? variants.slice(0, 5) : { error: variants },
    test_insert: testInsert,
  })
}
