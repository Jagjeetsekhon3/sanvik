import { createServiceClient } from '@/lib/supabase/server'
import { Product, ProductVariant } from '@/types'

// Fetch featured products for homepage
export async function getFeaturedProducts(tenantId: string, limit = 8): Promise<Product[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as Product[]
}

// Fetch new arrivals for homepage
export async function getNewArrivals(tenantId: string, limit = 4): Promise<Product[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as Product[]
}

// Fetch all products with optional filters
export async function getProducts(
  tenantId: string,
  filters?: {
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    limit?: number
    offset?: number
  }
): Promise<{ products: Product[]; total: number }> {
  const supabase = createServiceClient()
  let query = supabase
    .from('products')
    .select('*, variants:product_variants(*)', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  if (filters?.category && filters.category !== 'all') {
    if (filters.category === 'sale') {
      query = query.not('compare_price', 'is', null)
    } else if (filters.category === 'new-arrivals') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.ilike('category', `%${filters.category}%`)
    }
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('base_price', filters.minPrice)
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('base_price', filters.maxPrice)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 24) - 1)

  const { data, count } = await query
  return { products: (data || []) as Product[], total: count || 0 }
}

// Fetch single product by slug
export async function getProductBySlug(tenantId: string, slug: string): Promise<Product | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('tenant_id', tenantId)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Product | null
}

// Get all categories for a tenant
export async function getCategories(tenantId: string): Promise<string[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('category')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
  const cats = [...new Set((data || []).map((p: { category: string }) => p.category))]
  return cats.filter(Boolean)
}
