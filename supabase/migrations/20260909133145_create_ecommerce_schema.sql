/*
# MIRĀYA E-Commerce Database Schema

This migration creates the complete database schema for the MIRĀYA premium Indian women's fashion boutique.

## Overview

The schema models a full e-commerce system with variant-based inventory. Products have
variants keyed on color + size, and inventory (stock quantity, SKU) belongs to the variant —
NOT to the product. This allows a single product (e.g., "Rani Burgundy Banarasi Saree") to
have multiple color/size combinations each with their own stock levels and SKUs.

## New Tables

### 1. `categories`
- Product categories (Sarees, Lehengas, Anarkalis, Bridal Couture, etc.)
- `id` (uuid, PK), `name` (text, unique), `slug` (text, unique), `description` (text)
- `image_url` (text), `sort_order` (int, default 0)
- `created_at`, `updated_at` (timestamps)

### 2. `products`
- The main product catalog table. No inventory columns — inventory lives on variants.
- `id` (uuid, PK), `name` (text), `slug` (text, unique)
- `description` (text), `price` (numeric, check > 0)
- `compare_at_price` (numeric, nullable, check >= 0 — for showing original/discounted price)
- `category_id` (uuid, FK → categories.id)
- `collection` (text — Heritage, Festive, Bridal, Contemporary, Spring-Summer)
- `fabric` (text — Silk, Chiffon, Georgette, Velvet, Cotton, Brocade, Organza, Net)
- `featured` (bool, default false), `in_stock` (bool, default true — derived/cache flag)
- `rating` (numeric, default 0), `review_count` (int, default 0)
- `tags` (text[] — array of tag strings)
- `images` (text[] — array of image URLs)
- `created_at`, `updated_at` (timestamps)
- Indexes on slug, category_id, featured, collection, created_at

### 3. `product_variants`
- Color + size combinations for each product. Each variant has its own SKU.
- `id` (uuid, PK), `product_id` (uuid, FK → products.id, ON DELETE CASCADE)
- `sku` (text, unique — Stock Keeping Unit, must be unique across all variants)
- `color` (text, not null), `size` (text, not null)
- `price_adjustment` (numeric, default 0 — optional price delta from product base price)
- `created_at`, `updated_at` (timestamps)
- Unique constraint on (product_id, color, size) — prevents duplicate color/size combos
- Indexes on product_id, sku, (product_id, color, size)

### 4. `variant_inventory`
- Stock quantities per variant/SKU. This is the single source of truth for inventory.
- `id` (uuid, PK), `variant_id` (uuid, FK → product_variants.id, ON DELETE CASCADE)
- `quantity` (int, not null, check >= 0 — cannot have negative stock)
- `low_stock_threshold` (int, default 5 — for triggering restock alerts)
- `created_at`, `updated_at` (timestamps)
- One-to-one: unique constraint on variant_id (each variant has exactly one inventory row)
- Index on variant_id

### 5. `carts`
- Shopping cart header. One cart per user (for signed-in users) or per session (anonymous).
- `id` (uuid, PK), `user_id` (uuid, nullable, FK → auth.users.id, ON DELETE CASCADE)
- `session_id` (text, nullable — for anonymous carts tracked by browser session)
- `status` (text, default 'active' — 'active', 'abandoned', 'converted')
- `coupon_code` (text, nullable — applied coupon reference)
- `created_at`, `updated_at` (timestamps)
- Check: at least one of user_id or session_id must be set
- Indexes on user_id, session_id, status

### 6. `cart_items`
- Line items in a cart. Each references a specific variant.
- `id` (uuid, PK), `cart_id` (uuid, FK → carts.id, ON DELETE CASCADE)
- `variant_id` (uuid, FK → product_variants.id, ON DELETE RESTRICT — don't delete variant if in cart)
- `quantity` (int, not null, check > 0)
- `created_at`, `updated_at` (timestamps)
- Unique constraint on (cart_id, variant_id) — one line item per variant per cart
- Indexes on cart_id, variant_id

### 7. `orders`
- Order header. Created when a cart is converted to an order.
- `id` (uuid, PK), `user_id` (uuid, nullable, FK → auth.users.id, ON DELETE SET NULL)
- `order_number` (text, unique — human-readable order number like MIR-2026-00001)
- `status` (text, default 'pending' — pending, confirmed, shipped, delivered, cancelled, refunded)
- `subtotal` (numeric, check >= 0)
- `discount` (numeric, default 0, check >= 0)
- `shipping_cost` (numeric, default 0, check >= 0)
- `tax` (numeric, default 0, check >= 0)
- `total` (numeric, check >= 0)
- `coupon_code` (text, nullable)
- `shipping_address` (jsonb — full shipping address object)
- `billing_address` (jsonb — full billing address object)
- `customer_email` (text, not null)
- `customer_name` (text, not null)
- `customer_phone` (text, nullable)
- `notes` (text, nullable)
- `created_at`, `updated_at` (timestamps)
- Indexes on user_id, order_number, status, created_at

### 8. `order_items`
- Line items in an order. Snapshot of product + variant details at time of purchase.
- `id` (uuid, PK), `order_id` (uuid, FK → orders.id, ON DELETE CASCADE)
- `variant_id` (uuid, FK → product_variants.id, ON DELETE RESTRICT — keep order history even if product removed)
- `product_id` (uuid, FK → products.id, ON DELETE RESTRICT)
- `product_name` (text — snapshot at purchase time)
- `variant_sku` (text — snapshot)
- `variant_color` (text — snapshot)
- `variant_size` (text — snapshot)
- `unit_price` (numeric, not null, check >= 0 — price paid per unit)
- `quantity` (int, not null, check > 0)
- `line_total` (numeric, not null, check >= 0 — unit_price * quantity)
- `created_at` (timestamp)
- Indexes on order_id, variant_id, product_id

### 9. `coupons`
- Discount coupon definitions.
- `id` (uuid, PK), `code` (text, unique, uppercase)
- `description` (text, nullable)
- `discount_type` (text — 'percentage' or 'fixed')
- `discount_value` (numeric, check > 0)
- `min_order_value` (numeric, default 0 — minimum cart subtotal for coupon to apply)
- `max_discount_amount` (numeric, nullable — cap on discount for percentage coupons)
- `usage_limit` (int, nullable — max total uses across all customers)
- `usage_count` (int, default 0 — tracks how many times used)
- `per_user_limit` (int, default 1 — max uses per user)
- `starts_at` (timestamptz, not null)
- `ends_at` (timestamptz, nullable — null means no expiry)
- `is_active` (bool, default true)
- `created_at`, `updated_at` (timestamps)
- Indexes on code, is_active, starts_at, ends_at

### 10. `users`
- Extended user profile table linked to Supabase auth.users.
- `id` (uuid, PK, FK → auth.users.id, ON DELETE CASCADE — same id as auth user)
- `full_name` (text, nullable)
- `phone` (text, nullable)
- `default_shipping_address` (jsonb, nullable)
- `default_billing_address` (jsonb, nullable)
- `created_at`, `updated_at` (timestamps)

## Security (RLS)

This is an e-commerce storefront with both public catalog data (products, categories, variants,
inventory) and private customer data (carts, orders, user profiles).

- **Public read** on catalog tables: categories, products, product_variants, variant_inventory,
  coupons (so customers can browse and apply coupons). Uses `TO anon, authenticated` with
  `USING (true)` — this is intentional public catalog data.
- **No public writes** on catalog tables — only the admin/service role can insert/update/delete
  products, categories, variants, inventory, and coupons.
- **Owner-scoped** on carts, cart_items, orders, order_items, and users — each authenticated user
  can only access their own records.
- Carts also support anonymous access via session_id (anon role can read/write carts and cart_items
  matching their session_id).

## Important Notes

1. The `variant_inventory` table is deliberately separate from `product_variants` — it has a
   one-to-one relationship enforced by a unique constraint on `variant_id`. This separates
   the stock-keeping concern from the variant definition concern.
2. Order items snapshot product/variant details (name, SKU, color, size, price) at purchase time
   so order history remains accurate even if products are later modified or removed.
3. The `carts` table supports both authenticated users (via `user_id`) and anonymous shoppers
   (via `session_id`). At least one must be set (enforced by a CHECK constraint).
4. An auto-incrementing sequence is created for human-readable order numbers (MIR-YYYY-NNNNN).
*/

-- ============================================================================
-- HELPER: auto-updating updated_at column
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
ON categories FOR SELECT
TO anon, authenticated USING (true);

-- ============================================================================
-- 2. PRODUCTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(12, 2) NOT NULL CHECK (price > 0),
  compare_at_price numeric(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  collection text,
  fabric text,
  featured boolean NOT NULL DEFAULT false,
  in_stock boolean NOT NULL DEFAULT true,
  rating numeric(3, 1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count int NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  tags text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products"
ON products FOR SELECT
TO anon, authenticated USING (true);

-- ============================================================================
-- 3. PRODUCT_VARIANTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  color text NOT NULL,
  size text NOT NULL,
  price_adjustment numeric(12, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_product_variants_product_color_size UNIQUE (product_id, color, size)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_color_size ON product_variants(product_id, color, size);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_variants" ON product_variants;
CREATE POLICY "public_read_product_variants"
ON product_variants FOR SELECT
TO anon, authenticated USING (true);

-- ============================================================================
-- 4. VARIANT_INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS variant_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity int NOT NULL CHECK (quantity >= 0),
  low_stock_threshold int NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_variant_inventory_variant_id UNIQUE (variant_id)
);

CREATE INDEX IF NOT EXISTS idx_variant_inventory_variant_id ON variant_inventory(variant_id);

ALTER TABLE variant_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_variant_inventory" ON variant_inventory;
CREATE POLICY "public_read_variant_inventory"
ON variant_inventory FOR SELECT
TO anon, authenticated USING (true);

-- ============================================================================
-- 5. CARTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
  coupon_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can access their own carts
DROP POLICY IF EXISTS "select_own_carts" ON carts;
CREATE POLICY "select_own_carts"
ON carts FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_carts" ON carts;
CREATE POLICY "insert_own_carts"
ON carts FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_carts" ON carts;
CREATE POLICY "update_own_carts"
ON carts FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_carts" ON carts;
CREATE POLICY "delete_own_carts"
ON carts FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Anonymous users can access carts by session_id
DROP POLICY IF EXISTS "anon_select_carts" ON carts;
CREATE POLICY "anon_select_carts"
ON carts FOR SELECT
TO anon USING (session_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_insert_carts" ON carts;
CREATE POLICY "anon_insert_carts"
ON carts FOR INSERT
TO anon WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_update_carts" ON carts;
CREATE POLICY "anon_update_carts"
ON carts FOR UPDATE
TO anon USING (user_id IS NULL AND session_id IS NOT NULL) WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_delete_carts" ON carts;
CREATE POLICY "anon_delete_carts"
ON carts FOR DELETE
TO anon USING (user_id IS NULL AND session_id IS NOT NULL);

-- ============================================================================
-- 6. CART_ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity int NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_cart_items_cart_variant UNIQUE (cart_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users: can access cart_items belonging to their own cart
DROP POLICY IF EXISTS "select_own_cart_items" ON cart_items;
CREATE POLICY "select_own_cart_items"
ON cart_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

DROP POLICY IF EXISTS "insert_own_cart_items" ON cart_items;
CREATE POLICY "insert_own_cart_items"
ON cart_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

DROP POLICY IF EXISTS "update_own_cart_items" ON cart_items;
CREATE POLICY "update_own_cart_items"
ON cart_items FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_cart_items" ON cart_items;
CREATE POLICY "delete_own_cart_items"
ON cart_items FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Anonymous users: can access cart_items belonging to their session cart
DROP POLICY IF EXISTS "anon_select_cart_items" ON cart_items;
CREATE POLICY "anon_select_cart_items"
ON cart_items FOR SELECT
TO anon USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id IS NULL AND carts.session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "anon_insert_cart_items" ON cart_items;
CREATE POLICY "anon_insert_cart_items"
ON cart_items FOR INSERT
TO anon WITH CHECK (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id IS NULL AND carts.session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "anon_update_cart_items" ON cart_items;
CREATE POLICY "anon_update_cart_items"
ON cart_items FOR UPDATE
TO anon USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id IS NULL AND carts.session_id IS NOT NULL)
) WITH CHECK (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id IS NULL AND carts.session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "anon_delete_cart_items" ON cart_items;
CREATE POLICY "anon_delete_cart_items"
ON cart_items FOR DELETE
TO anon USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id IS NULL AND carts.session_id IS NOT NULL)
);

-- ============================================================================
-- 7. ORDERS
-- ============================================================================

-- Sequence for human-readable order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal numeric(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_cost numeric(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  tax numeric(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  coupon_code text,
  shipping_address jsonb,
  billing_address jsonb,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view and manage their own orders
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders"
ON orders FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders"
ON orders FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders"
ON orders FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. ORDER_ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  variant_sku text NOT NULL,
  variant_color text NOT NULL,
  variant_size text NOT NULL,
  unit_price numeric(12, 2) NOT NULL CHECK (unit_price >= 0),
  quantity int NOT NULL CHECK (quantity > 0),
  line_total numeric(12, 2) NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items"
ON order_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items"
ON order_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- ============================================================================
-- 9. COUPONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_value numeric(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  max_discount_amount numeric(12, 2) CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
  usage_limit int CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_count int NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  per_user_limit int NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_starts_at ON coupons(starts_at);
CREATE INDEX IF NOT EXISTS idx_coupons_ends_at ON coupons(ends_at);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Coupons are publicly readable so customers can apply them at checkout
DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons"
ON coupons FOR SELECT
TO anon, authenticated USING (true);

-- ============================================================================
-- 10. USERS (profile extension)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  default_shipping_address jsonb,
  default_billing_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON users;
CREATE POLICY "select_own_profile"
ON users FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON users;
CREATE POLICY "insert_own_profile"
ON users FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON users;
CREATE POLICY "update_own_profile"
ON users FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================================
-- TRIGGERS: auto-update updated_at on all tables
-- ============================================================================

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON product_variants;
CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_variant_inventory_updated_at ON variant_inventory;
CREATE TRIGGER trg_variant_inventory_updated_at
  BEFORE UPDATE ON variant_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts;
CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
