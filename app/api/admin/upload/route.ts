import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 })

  // Get tenant Cloudinary config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const tenantRes = await fetch(`${supabaseUrl}/rest/v1/tenants?id=eq.${tenantId}&limit=1`, {
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
    cache: 'no-store',
  })
  const tenantData = await tenantRes.json()
  const tenant = tenantData?.[0]

  if (!tenant?.cloudinary_cloud_name || !tenant?.cloudinary_api_key || !tenant?.cloudinary_api_secret) {
    return NextResponse.json({ error: 'Cloudinary not configured. Add keys in Settings first.' }, { status: 400 })
  }

  // Get uploaded file from form data
  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Build signed upload
  const timestamp = Math.round(Date.now() / 1000)
  const folder = `fashn/${tenant.subdomain || tenantId}/products`
  const crypto = await import('crypto')
  const signature = crypto.default
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${tenant.cloudinary_api_secret}`)
    .digest('hex')

  // Forward to Cloudinary
  const uploadForm = new FormData()
  uploadForm.append('file', file)
  uploadForm.append('api_key', tenant.cloudinary_api_key)
  uploadForm.append('timestamp', String(timestamp))
  uploadForm.append('signature', signature)
  uploadForm.append('folder', folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${tenant.cloudinary_cloud_name}/image/upload`,
    { method: 'POST', body: uploadForm }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.json()
    return NextResponse.json({ error: err.error?.message || 'Upload failed' }, { status: 400 })
  }

  const data = await uploadRes.json()
  return NextResponse.json({ url: data.secure_url, public_id: data.public_id })
}
