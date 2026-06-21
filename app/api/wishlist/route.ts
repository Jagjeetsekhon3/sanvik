import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json([])

  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')
  if (!ids) return NextResponse.json([])

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${url}/rest/v1/products?id=in.(${ids})&tenant_id=eq.${tenantId}&is_active=eq.true&select=id,name,slug,base_price,compare_price,images,category`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  return NextResponse.json(await res.json())
}
