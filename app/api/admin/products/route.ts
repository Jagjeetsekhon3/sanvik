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

    const body = await request.json()
    const { product, variants } = body
    const { url, key } = sb()

    // Insert product
    const productRes = await fetch(`${url}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ ...product, tenant_id: tenantId }),
    })

    const productData = await productRes.json()
    if (!productRes.ok) {
      return NextResponse.json({ error: productData.message || productData.details || JSON.stringify(productData) }, { status: 400 })
    }

    const newProduct = Array.isArray(productData) ? productData[0] : productData
    if (!newProduct?.id) {
      return NextResponse.json({ error: 'Product created but no ID returned', raw: productData }, { status: 500 })
    }

    // Insert variants one by one to catch individual errors
    const variantResults = []
    const cleanVariants = (variants || []).filter((v: Record<string, unknown>) => v.size && v.color)

    for (const variant of cleanVariants) {
      const vRes = await fetch(`${url}/rest/v1/product_variants`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          product_id: newProduct.id,
          size: variant.size,
          color: variant.color,
          color_hex: variant.color_hex || '#000000',
          stock: Number(variant.stock) || 0,
          sku: variant.sku || null,
          price_override: variant.price_override ? Number(variant.price_override) : null,
        }),
      })
      const vData = await vRes.json()
      variantResults.push({ ok: vRes.ok, status: vRes.status, data: vData })
    }

    const failedVariants = variantResults.filter(r => !r.ok)

    return NextResponse.json({
      product: newProduct,
      variants_attempted: cleanVariants.length,
      variants_saved: variantResults.filter(r => r.ok).length,
      variant_errors: failedVariants.length > 0 ? failedVariants : undefined,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
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
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(product),
    })

    if (!productRes.ok) {
      const err = await productRes.json()
      return NextResponse.json({ error: err.message || JSON.stringify(err) }, { status: 400 })
    }

    // Delete existing variants
    await fetch(`${url}/rest/v1/product_variants?product_id=eq.${productId}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    })

    // Insert new variants one by one
    const cleanVariants = (variants || []).filter((v: Record<string, unknown>) => v.size && v.color)
    const variantResults = []

    for (const variant of cleanVariants) {
      const vRes = await fetch(`${url}/rest/v1/product_variants`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          product_id: productId,
          size: variant.size,
          color: variant.color,
          color_hex: variant.color_hex || '#000000',
          stock: Number(variant.stock) || 0,
          sku: variant.sku || null,
          price_override: variant.price_override ? Number(variant.price_override) : null,
        }),
      })
      const vData = await vRes.json()
      variantResults.push({ ok: vRes.ok, status: vRes.status, data: vData })
    }

    const failedVariants = variantResults.filter(r => !r.ok)

    return NextResponse.json({
      success: true,
      variants_attempted: cleanVariants.length,
      variants_saved: variantResults.filter(r => r.ok).length,
      variant_errors: failedVariants.length > 0 ? failedVariants : undefined,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const { productId } = await request.json()
    const { url, key } = sb()

    await fetch(`${url}/rest/v1/product_variants?product_id=eq.${productId}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    })

    await fetch(`${url}/rest/v1/products?id=eq.${productId}&tenant_id=eq.${tenantId}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
