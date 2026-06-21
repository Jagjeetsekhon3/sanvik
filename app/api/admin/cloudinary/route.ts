import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function getTenantCloudinary(tenantId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${supabaseUrl}/rest/v1/tenants?id=eq.${tenantId}&limit=1`,
    {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      cache: 'no-store',
    }
  )
  const data = await res.json()
  return data?.[0] || null
}

// GET — list images from Cloudinary
export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const folder = searchParams.get('folder') || ''
  const nextCursor = searchParams.get('next_cursor') || ''

  const tenant = await getTenantCloudinary(tenantId)
  if (!tenant?.cloudinary_cloud_name || !tenant?.cloudinary_api_key || !tenant?.cloudinary_api_secret) {
    return NextResponse.json({ error: 'Cloudinary not configured. Add your keys in Settings.' }, { status: 400 })
  }

  const auth = Buffer.from(`${tenant.cloudinary_api_key}:${tenant.cloudinary_api_secret}`).toString('base64')

  let url = `https://api.cloudinary.com/v1_1/${tenant.cloudinary_cloud_name}/resources/image?max_results=30&tags=true`
  if (folder) url += `&prefix=${encodeURIComponent(folder)}`
  if (nextCursor) url += `&next_cursor=${nextCursor}`

  const res = await fetch(url, {
    headers: { 'Authorization': `Basic ${auth}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.error?.message || 'Cloudinary error' }, { status: 400 })
  }

  const data = await res.json()
  return NextResponse.json(data)
}

// DELETE — delete image from Cloudinary
export async function DELETE(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

  const { publicId } = await request.json()
  const tenant = await getTenantCloudinary(tenantId)

  if (!tenant?.cloudinary_cloud_name || !tenant?.cloudinary_api_key || !tenant?.cloudinary_api_secret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 400 })
  }

  // Build signed request
  const timestamp = Math.round(Date.now() / 1000)
  const crypto = await import('crypto')
  const signature = crypto.default
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${tenant.cloudinary_api_secret}`)
    .digest('hex')

  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('timestamp', String(timestamp))
  formData.append('api_key', tenant.cloudinary_api_key)
  formData.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${tenant.cloudinary_cloud_name}/image/destroy`,
    { method: 'POST', body: formData }
  )

  const data = await res.json()
  return NextResponse.json(data)
}

// POST — get upload signature for direct browser upload
export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

  const tenant = await getTenantCloudinary(tenantId)
  if (!tenant?.cloudinary_cloud_name || !tenant?.cloudinary_api_key || !tenant?.cloudinary_api_secret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 400 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = `fashn/${tenant.cloudinary_cloud_name}`
  const crypto = await import('crypto')
  const signature = crypto.default
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${tenant.cloudinary_api_secret}`)
    .digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: tenant.cloudinary_api_key,
    cloudName: tenant.cloudinary_cloud_name,
    folder,
  })
}
