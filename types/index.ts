// ─── TENANT ───────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string
  subdomain: string
  custom_domain: string | null
  brand_name: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_heading: string
  font_body: string
  currency: 'INR' | 'USD' | 'BOTH'
  razorpay_key_id: string | null
  razorpay_key_secret: string | null
  stripe_publishable_key: string | null
  stripe_secret_key: string | null
  paypal_client_id: string | null
  paypal_client_secret: string | null
  cod_enabled: boolean
  active: boolean
  created_at: string
  // Store metadata
  tagline: string | null
  about: string | null
  contact_email: string | null
  instagram_url: string | null
  facebook_url: string | null
  return_policy: string | null
  shipping_policy: string | null
}

// ─── PRODUCT ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  tenant_id: string
  name: string
  slug: string
  description: string | null
  category: string
  tags: string[]
  images: string[]                // Cloudinary URLs
  base_price: number
  compare_price: number | null    // Original / MRP for strikethrough
  currency: 'INR' | 'USD'
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  color_hex: string | null
  stock: number
  sku: string | null
  price_override: number | null   // If variant has different price
}

// ─── CART ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string
  variant_id: string
  product_name: string
  product_image: string
  size: string
  color: string
  price: number
  quantity: number
}

// ─── ORDER ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentMethod = 'razorpay' | 'stripe' | 'paypal' | 'cod'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  tenant_id: string
  customer_id: string | null
  order_number: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  currency: 'INR' | 'USD'
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_id: string | null       // Gateway transaction ID
  order_status: OrderStatus
  shipping_address: Address
  discount_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface OrderItem {
  product_id: string
  variant_id: string
  product_name: string
  product_image: string
  size: string
  color: string
  price: number
  quantity: number
}

// ─── CUSTOMER ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  tenant_id: string
  email: string
  name: string | null
  phone: string | null
  is_banned: boolean
  created_at: string
  addresses?: Address[]
}

export interface Address {
  id?: string
  customer_id?: string
  name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  is_default?: boolean
}

// ─── DISCOUNT ─────────────────────────────────────────────────────────────────

export interface DiscountCode {
  id: string
  tenant_id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order: number | null
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export interface Admin {
  id: string
  tenant_id: string
  email: string
  name: string
  role: 'owner' | 'manager' | 'staff'
  created_at: string
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

export interface TenantContext {
  tenant: Tenant
  isLoaded: boolean
}
