import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const updates = await request.json()

    // Use raw fetch to Supabase — bypasses any Next.js caching completely
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        error: 'Missing env vars',
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceKey,
      }, { status: 500 })
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant ID' }, { status: 400 })
    }

    // Direct REST API call to Supabase — no SDK, no caching
    const res = await fetch(
      `${supabaseUrl}/rest/v1/tenants?id=eq.${tenantId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updates),
        cache: 'no-store',
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: 'Supabase error', detail: data }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, saved: data[0] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Surrogate-Control': 'no-store',
        }
      }
    )
  } catch (err: unknown) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
