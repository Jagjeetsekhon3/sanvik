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
  instagram_username: string | null
  instagram_access_token: string | null
  instagram_show_feed: boolean
  instagram_feed_title: string | null
  cloudinary_cloud_name: string | null
  cloudinary_api_key: string | null
  cloudinary_api_secret: string | null
  cloudinary_upload_preset: string | null
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

// ─── MENU ─────────────────────────────────────────────────────────

export interface MenuItem {
  id: string
  label: string
  href: string
  target?: '_blank' | '_self'
  children?: MenuItem[]   // dropdown items
}

export interface MenuConfig {
  id?: string
  tenant_id: string
  items: MenuItem[]
}

// ─── HEADER ───────────────────────────────────────────────────────

export interface HeaderConfig {
  id?: string
  tenant_id: string
  logo_type: 'text' | 'image'
  logo_text: string | null
  logo_image_url: string | null
  logo_size: number
  sticky: boolean
  show_search: boolean
  show_announcement: boolean
  announcement_text: string | null
  announcement_bg: string
  announcement_color: string
  bg_color: string
  bg_scrolled: string
  text_color: string
  border_bottom: boolean
  height: number
}

// ─── FOOTER ───────────────────────────────────────────────────────

export interface FooterColumn {
  id: string
  title: string
  links: { label: string; href: string }[]
}

export interface FooterConfig {
  id?: string
  tenant_id: string
  bg_color: string
  text_color: string
  show_logo: boolean
  show_tagline: boolean
  show_socials: boolean
  show_newsletter: boolean
  newsletter_text: string
  columns: FooterColumn[]
  bottom_text: string | null
  show_payments: boolean
}

// ─── BANNER ───────────────────────────────────────────────────────

export interface BannerConfig {
  id?: string
  tenant_id: string
  enabled: boolean
  layout: 'full' | 'split' | 'minimal'
  bg_color: string
  bg_image_url: string | null
  bg_overlay: number
  heading: string
  subheading: string | null
  body_text: string | null
  badge_text: string | null
  cta_label: string
  cta_href: string
  cta_color: string
  cta2_label: string | null
  cta2_href: string | null
  text_color: string
  text_align: 'left' | 'center' | 'right'
  min_height: number
}

// ─── HOMEPAGE SECTIONS ────────────────────────────────────────────

export type SectionType =
  | 'banner'
  | 'featured_products'
  | 'new_arrivals'
  | 'category_grid'
  | 'instagram_feed'
  | 'brand_story'
  | 'text_block'
  | 'image_banner'
  | 'video_banner'

export interface HomeSection {
  id: string
  type: SectionType
  enabled: boolean
  title?: string
  subtitle?: string
  // Featured/New arrivals
  limit?: number
  category?: string
  // Image/Video banner
  image_url?: string
  video_url?: string
  bg_color?: string
  text_color?: string
  heading?: string
  body?: string
  cta_label?: string
  cta_href?: string
  min_height?: number
  // Text block
  content?: string
  align?: 'left' | 'center' | 'right'
}

// ─── WISHLIST ─────────────────────────────────────────────────────

export interface WishlistItem {
  id: string
  tenant_id: string
  customer_id: string | null
  session_id: string | null
  product_id: string
  created_at: string
  product?: Product
}

// ─── SIZE GUIDE ───────────────────────────────────────────────────

export interface SizeGuide {
  id: string
  tenant_id: string
  name: string
  headers: string[]
  rows: string[][]
  description: string | null
  created_at: string
}
