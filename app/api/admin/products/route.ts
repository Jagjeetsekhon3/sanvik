import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const { product, variants } = await request.json()
    const supabase = createServiceClient()

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({ ...product, tenant_id: tenantId })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    if (variants?.length) {
      await supabase.from('product_variants').insert(
        variants.map((v: Record<string, unknown>) => ({ ...v, product_id: newProduct.id }))
      )
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
    const supabase = createServiceClient()

    const { data: updated, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Replace variants
    await supabase.from('product_variants').delete().eq('product_id', productId)
    if (variants?.length) {
      await supabase.from('product_variants').insert(
        variants.map((v: Record<string, unknown>) => ({ ...v, product_id: productId }))
      )
    }

    return NextResponse.json({ product: updated })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

    const { productId } = await request.json()
    const supabase = createServiceClient()

    await supabase.from('products').delete().eq('id', productId).eq('tenant_id', tenantId)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
