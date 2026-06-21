import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const sb = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const { product, variants } = await request.json()
    const { url, key } = sb()

    // Insert product
    const productRes = await fetch(`${url}/rest/v1/products`, {
      method: 'POST',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ ...product, tenant_id: tenantId }),
    })

    const productData = await productRes.json()
    if (!productRes.ok) return NextResponse.json({ error: productData.message || 'Failed to create product' }, { status: 400 })

    const newProduct = productData[0]

    // Insert variants
    if (variants?.length > 0) {
      const variantRes = await fetch(`${url}/rest/v1/product_variants`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(variants.map((v: Record<string, unknown>) => ({ ...v, product_id: newProduct.id }))),
      })
      if (!variantRes.ok) {
        const err = await variantRes.json()
        console.error('Variant insert error:', err)
      }
    }

    return NextResponse.json({ product: newProduct })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const { product, variants, productId } = await request.json()
    const { url, key } = sb()

    // Update product
    const productRes = await fetch(`${url}/rest/v1/products?id=eq.${productId}&tenant_id=eq.${tenantId}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(product),
    })

    const productData = await productRes.json()
    if (!productRes.ok) return NextResponse.json({ error: productData.message || 'Failed to update product' }, { status: 400 })

    // Delete old variants then insert new ones
    await fetch(`${url}/rest/v1/product_variants?product_id=eq.${productId}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    })

    if (variants?.length > 0) {
      const variantRes = await fetch(`${url}/rest/v1/product_variants`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(variants.map((v: Record<string, unknown>) => ({ ...v, product_id: productId }))),
      })
      if (!variantRes.ok) {
        const err = await variantRes.json()
        console.error('Variant update error:', err)
      }
    }

    return NextResponse.json({ product: productData[0] })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const { productId } = await request.json()
    const { url, key } = sb()

    // Delete variants first
    await fetch(`${url}/rest/v1/product_variants?product_id=eq.${productId}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    })

    // Delete product
    await fetch(`${url}/rest/v1/products?id=eq.${productId}&tenant_id=eq.${tenantId}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
