import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(`${url}/rest/v1/size_guides?id=eq.${params.id}&limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data?.[0] || null)
}
