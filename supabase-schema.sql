-- ═══════════════════════════════════════════════════════════════════
-- FASHN — Multi-tenant Fashion Ecommerce Platform
-- Run this entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── TENANTS ───────────────────────────────────────────────────────

CREATE TABLE tenants (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subdomain             TEXT UNIQUE NOT NULL,          -- e.g. "zara" → zara.yourdomain.com
  custom_domain         TEXT UNIQUE,                  -- e.g. "zara.com"
  brand_name            TEXT NOT NULL,
  logo_url              TEXT,
  favicon_url           TEXT,

  -- Theme
  primary_color         TEXT NOT NULL DEFAULT '#000000',
  secondary_color       TEXT NOT NULL DEFAULT '#ffffff',
  accent_color          TEXT NOT NULL DEFAULT '#ff4d4d',
  background_color      TEXT NOT NULL DEFAULT '#ffffff',
  text_color            TEXT NOT NULL DEFAULT '#111111',
  font_heading          TEXT NOT NULL DEFAULT 'Playfair Display',
  font_body             TEXT NOT NULL DEFAULT 'Inter',

  -- Currency & Payments
  currency              TEXT NOT NULL DEFAULT 'BOTH' CHECK (currency IN ('INR', 'USD', 'BOTH')),
  razorpay_key_id       TEXT,
  razorpay_key_secret   TEXT,
  stripe_publishable_key TEXT,
  stripe_secret_key     TEXT,
  paypal_client_id      TEXT,
  paypal_client_secret  TEXT,
  cod_enabled           BOOLEAN DEFAULT true,

  -- Store info
  tagline               TEXT,
  about                 TEXT,
  contact_email         TEXT,
  instagram_url         TEXT,
  facebook_url          TEXT,
  return_policy         TEXT,
  shipping_policy       TEXT,

  active                BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ─── ADMINS ────────────────────────────────────────────────────────

CREATE TABLE admins (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);


-- ─── CUSTOMERS ─────────────────────────────────────────────────────

CREATE TABLE customers (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  phone       TEXT,
  is_banned   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE TABLE addresses (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  line1         TEXT NOT NULL,
  line2         TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  pincode       TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT 'India',
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ─── PRODUCTS ──────────────────────────────────────────────────────

CREATE TABLE products (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL,
  tags            TEXT[] DEFAULT '{}',
  images          TEXT[] DEFAULT '{}',    -- Cloudinary URLs
  base_price      NUMERIC(10,2) NOT NULL,
  compare_price   NUMERIC(10,2),          -- MRP / strikethrough price
  currency        TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  is_active       BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE TABLE product_variants (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size            TEXT NOT NULL,
  color           TEXT NOT NULL,
  color_hex       TEXT,
  stock           INTEGER NOT NULL DEFAULT 0,
  sku             TEXT,
  price_override  NUMERIC(10,2),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ─── DISCOUNT CODES ────────────────────────────────────────────────

CREATE TABLE discount_codes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value       NUMERIC(10,2) NOT NULL,
  min_order   NUMERIC(10,2),
  max_uses    INTEGER,
  used_count  INTEGER DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);


-- ─── ORDERS ────────────────────────────────────────────────────────

CREATE TABLE orders (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number      TEXT NOT NULL,
  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          NUMERIC(10,2) NOT NULL,
  discount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'stripe', 'paypal', 'cod')),
  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id        TEXT,
  order_status      TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address  JSONB NOT NULL,
  discount_code     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, order_number)
);


-- ─── SUPER ADMINS (you only) ───────────────────────────────────────

CREATE TABLE super_admins (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ─── INDEXES ───────────────────────────────────────────────────────

CREATE INDEX idx_products_tenant     ON products(tenant_id);
CREATE INDEX idx_products_category   ON products(tenant_id, category);
CREATE INDEX idx_products_featured   ON products(tenant_id, is_featured);
CREATE INDEX idx_variants_product    ON product_variants(product_id);
CREATE INDEX idx_orders_tenant       ON orders(tenant_id);
CREATE INDEX idx_orders_customer     ON orders(customer_id);
CREATE INDEX idx_orders_status       ON orders(tenant_id, order_status);
CREATE INDEX idx_customers_tenant    ON customers(tenant_id);
CREATE INDEX idx_customers_email     ON customers(tenant_id, email);
CREATE INDEX idx_tenants_subdomain   ON tenants(subdomain);
CREATE INDEX idx_tenants_domain      ON tenants(custom_domain);


-- ─── UPDATED_AT TRIGGER ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── ORDER NUMBER GENERATOR ────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_order_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_prefix TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count FROM orders WHERE tenant_id = p_tenant_id;
  v_prefix := UPPER(SUBSTRING(p_tenant_id::TEXT, 1, 4));
  RETURN v_prefix || '-' || LPAD(v_count::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;


-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────

ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;

-- Public can read active tenants (needed for domain resolution)
CREATE POLICY "tenants_public_read" ON tenants
  FOR SELECT USING (active = true);

-- Public can read active products
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

-- Public can read product variants
CREATE POLICY "variants_public_read" ON product_variants
  FOR SELECT USING (true);

-- Service role has full access (used server-side only)
-- All writes go through server-side API routes using service_role key


-- ─── SEED: YOUR SUPER ADMIN ────────────────────────────────────────
-- Replace with your actual email before running

INSERT INTO super_admins (email, name)
VALUES ('your@email.com', 'Jagjeet');


-- ─── SEED: DEMO TENANT ─────────────────────────────────────────────

INSERT INTO tenants (
  subdomain, brand_name, tagline,
  primary_color, secondary_color, accent_color,
  currency, cod_enabled,
  contact_email
) VALUES (
  'demo',
  'NOIR',
  'Wear the silence.',
  '#0f0f0f', '#f5f5f5', '#c8a96e',
  'BOTH', true,
  'hello@noir.store'
);
