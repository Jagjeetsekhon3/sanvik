import { Product, ProductVariant } from '@/types'

const sb = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
})

async function fetchVariants(productIds: string[]): Promise<ProductVariant[]> {
  if (productIds.length === 0) return []
  const { url, key } = sb()
  const res = await fetch(
    `${url}/rest/v1/product_variants?product_id=in.(${productIds.join(',')})`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

function attachVariants(products: Product[], variants: ProductVariant[]): Product[] {
  return products.map(p => ({
    ...p,
    variants: variants.filter(v => v.product_id === p.id),
  }))
}

export async function getFeaturedProducts(tenantId: string, limit = 8): Promise<Product[]> {
  const { url, key } = sb()
  const res = await fetch(
    `${url}/rest/v1/products?tenant_id=eq.${tenantId}&is_active=eq.true&is_featured=eq.true&order=created_at.desc&limit=${limit}`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const products = await res.json()
  if (!Array.isArray(products) || products.length === 0) return []
  const variants = await fetchVariants(products.map((p: Product) => p.id))
  return attachVariants(products, variants)
}

export async function getNewArrivals(tenantId: string, limit = 4): Promise<Product[]> {
  const { url, key } = sb()
  const res = await fetch(
    `${url}/rest/v1/products?tenant_id=eq.${tenantId}&is_active=eq.true&order=created_at.desc&limit=${limit}`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const products = await res.json()
  if (!Array.isArray(products) || products.length === 0) return []
  const variants = await fetchVariants(products.map((p: Product) => p.id))
  return attachVariants(products, variants)
}

export async function getProducts(
  tenantId: string,
  filters?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; limit?: number; offset?: number }
): Promise<{ products: Product[]; total: number }> {
  const { url, key } = sb()
  const limit = filters?.limit || 24
  const offset = filters?.offset || 0

  let query = `${url}/rest/v1/products?tenant_id=eq.${tenantId}&is_active=eq.true&order=created_at.desc`

  if (filters?.category && filters.category !== 'all') {
    if (filters.category === 'sale') {
      query += `&compare_price=not.is.null`
    } else {
      query += `&category=ilike.*${encodeURIComponent(filters.category)}*`
    }
  }

  if (filters?.search) query += `&name=ilike.*${encodeURIComponent(filters.search)}*`
  if (filters?.minPrice !== undefined) query += `&base_price=gte.${filters.minPrice}`
  if (filters?.maxPrice !== undefined) query += `&base_price=lte.${filters.maxPrice}`

  query += `&limit=${limit}&offset=${offset}`

  const res = await fetch(query, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Prefer': 'count=exact' },
    cache: 'no-store',
  })

  const products = await res.json()
  const countHeader = res.headers.get('content-range')
  const total = countHeader ? parseInt(countHeader.split('/')[1] || '0') : 0

  if (!Array.isArray(products) || products.length === 0) return { products: [], total: 0 }
  const variants = await fetchVariants(products.map((p: Product) => p.id))
  return { products: attachVariants(products, variants), total }
}

export async function getProductBySlug(tenantId: string, slug: string): Promise<Product | null> {
  const { url, key } = sb()
  const res = await fetch(
    `${url}/rest/v1/products?tenant_id=eq.${tenantId}&slug=eq.${slug}&is_active=eq.true&limit=1`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const data = await res.json()
  const product = data?.[0]
  if (!product) return null
  const variants = await fetchVariants([product.id])
  return { ...product, variants }
}

export async function getCategories(tenantId: string): Promise<string[]> {
  const { url, key } = sb()
  const res = await fetch(
    `${url}/rest/v1/products?tenant_id=eq.${tenantId}&is_active=eq.true&select=category`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }
  )
  const data = await res.json()
  const cats = [...new Set((Array.isArray(data) ? data : []).map((p: { category: string }) => p.category))]
  return cats.filter(Boolean)
}
