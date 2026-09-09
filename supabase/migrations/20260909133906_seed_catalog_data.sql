/*
# Seed MIRĀYA catalog: categories, products, variants, inventory

Populates the database with 6 categories and 12 products. Each product gets
multiple color/size variants with unique SKUs. Inventory rows are created per
variant with realistic stock levels (some variants deliberately have zero stock
to demonstrate out-of-stock behavior on the product detail page).

## What gets inserted
- 6 categories (Sarees, Lehengas, Anarkalis, Bridal Couture, Kurtis & Suits, Dupattas & Stoles)
- 12 products with images, tags, pricing, ratings
- ~35+ product variants across color/size combinations with unique SKUs
- 1 inventory row per variant (one-to-one), with some set to quantity 0

## Notes
- Uses ON CONFLICT DO NOTHING so re-running is safe
- Products with "Free Size" (sarees, dupattas) get a single variant per color
- Multi-size products (lehengas, anarkalis, kurtis) get variants per color+size
- A few variants deliberately have 0 stock to test the UI out-of-stock state
*/

-- ============================================================================
-- CATEGORIES
-- ============================================================================

INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
('Sarees', 'sarees', 'Handwoven drapes of timeless grace — from Banarasi silk to chiffon.', 'https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
('Lehengas', 'lehengas', 'Opulent skirts adorned with zardozi, mirror work, and resham embroidery.', 'https://images.pexels.com/photos/25811178/pexels-photo-25811178.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
('Anarkalis', 'anarkalis', 'Floor-length silhouettes that flow with regal fluidity.', 'https://images.pexels.com/photos/30703860/pexels-photo-30703860.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
('Bridal Couture', 'bridal-couture', 'Heirloom pieces crafted for the once-in-a-lifetime celebration.', 'https://images.pexels.com/photos/14840508/pexels-photo-14840508.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4),
('Kurtis & Suits', 'kurtis-suits', 'Everyday elegance with traditional craftsmanship.', 'https://images.pexels.com/photos/7176438/pexels-photo-7176438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5),
('Dupattas & Stoles', 'dupattas-stoles', 'The finishing flourish — Phulkari, Banarasi, and hand-painted.', 'https://images.pexels.com/photos/8886963/pexels-photo-8886963.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PRODUCTS
-- ============================================================================

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000001',
  'Rani Burgundy Banarasi Silk Saree',
  'rani-burgundy-banarasi-silk-saree',
  'A regal Banarasi silk saree in deep burgundy, woven with gold zari motifs. Each thread tells a story of Varanasi master weavers. Includes an unstitched blouse piece.',
  28900, 36000,
  (SELECT id FROM categories WHERE slug = 'sarees'),
  'Bridal', 'Silk', true, true, 4.9, 127,
  ARRAY['Bestseller', 'Handwoven'],
  ARRAY['https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/36951188/pexels-photo-36951188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-08-15T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000002',
  'Sindoor Red Bridal Lehenga',
  'sindoor-red-bridal-lehenga',
  'A breathtaking bridal lehenga in sindoor red, featuring intricate gold zardozi embroidery and a hand-embellished dupatta. The skirt flows with regal volume.',
  125000, 158000,
  (SELECT id FROM categories WHERE slug = 'bridal-couture'),
  'Bridal', 'Velvet', true, true, 5.0, 89,
  ARRAY['Bridal Exclusive', 'Custom Fit'],
  ARRAY['https://images.pexels.com/photos/25811178/pexels-photo-25811178.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/8596205/pexels-photo-8596205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-08-20T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000003',
  'Gulabo Teal Chiffon Saree',
  'gulabo-teal-chiffon-saree',
  'A flowing teal chiffon saree with delicate resham floral embroidery along the pallu. Effortless grace for festive gatherings.',
  14500, NULL,
  (SELECT id FROM categories WHERE slug = 'sarees'),
  'Festive', 'Chiffon', true, true, 4.7, 64,
  ARRAY['New Arrival'],
  ARRAY['https://images.pexels.com/photos/7176438/pexels-photo-7176438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-09-01T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000004',
  'Marigold Pink Lehenga with Mirror Work',
  'marigold-pink-lehenga-mirror-work',
  'A vibrant pink lehenga adorned with hand-stitched mirror work and gota patti detailing. A celebration in every fold.',
  67000, 82000,
  (SELECT id FROM categories WHERE slug = 'lehengas'),
  'Festive', 'Georgette', true, true, 4.8, 52,
  ARRAY['Festive Special'],
  ARRAY['https://images.pexels.com/photos/12411113/pexels-photo-12411113.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/13039870/pexels-photo-13039870.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-08-25T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000005',
  'Sahiba Maroon Anarkali Suit',
  'sahiba-maroon-anarkali-suit',
  'A floor-length maroon anarkali in premium velvet with gold sequin detailing. Regal silhouette for evening occasions.',
  38500, 45000,
  (SELECT id FROM categories WHERE slug = 'anarkalis'),
  'Heritage', 'Velvet', true, true, 4.6, 38,
  ARRAY['Heritage'],
  ARRAY['https://images.pexels.com/photos/2531734/pexels-photo-2531734.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/30703860/pexels-photo-30703860.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-08-10T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000006',
  'Gauri Ivory Organza Saree',
  'gauri-ivory-organza-saree',
  'A luminous ivory organza saree with hand-painted floral motifs and a scalloped gold border. Contemporary heritage.',
  22000, NULL,
  (SELECT id FROM categories WHERE slug = 'sarees'),
  'Contemporary', 'Organza', true, true, 4.8, 73,
  ARRAY['New Arrival', 'Bestseller'],
  ARRAY['https://images.pexels.com/photos/19567863/pexels-photo-19567863.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/30703860/pexels-photo-30703860.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-09-05T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000007',
  'Padmini Red Bridal Couture Gown',
  'padmini-red-bridal-couture-gown',
  'A masterpiece of bridal couture — deep red velvet with hand-embroidered gold zardozi, sequins, and pearl detailing.',
  185000, NULL,
  (SELECT id FROM categories WHERE slug = 'bridal-couture'),
  'Bridal', 'Velvet', true, true, 5.0, 41,
  ARRAY['Bridal Exclusive', 'Made to Order'],
  ARRAY['https://images.pexels.com/photos/14840508/pexels-photo-14840508.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/11746622/pexels-photo-11746622.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-08-18T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000008',
  'Chandni Gold Brocade Lehenga',
  'chandni-gold-brocade-lehenga',
  'A golden brocade lehenga with traditional buti motifs and a contrast burgundy border. Festive opulence redefined.',
  89000, 110000,
  (SELECT id FROM categories WHERE slug = 'lehengas'),
  'Heritage', 'Brocade', false, true, 4.7, 29,
  ARRAY['Heritage'],
  ARRAY['https://images.pexels.com/photos/13204677/pexels-photo-13204677.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/13124449/pexels-photo-13124449.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-07-28T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000009',
  'Meher Cotton Kurti with Chikankari',
  'meher-cotton-kurti-chikankari',
  'A breathable cotton kurti with authentic Lucknowi chikankari hand embroidery. Everyday elegance, elevated.',
  4800, 6500,
  (SELECT id FROM categories WHERE slug = 'kurtis-suits'),
  'Contemporary', 'Cotton', false, true, 4.5, 156,
  ARRAY['Bestseller', 'Hand Embroidered'],
  ARRAY['https://images.pexels.com/photos/30703860/pexels-photo-30703860.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/19567863/pexels-photo-19567863.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-09-03T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000010',
  'Roohi Maroon Net Dupatta',
  'roohi-maroon-net-dupatta',
  'A sheer net dupatta in deep maroon with scattered sequin work and a heavily embroidered border.',
  6500, NULL,
  (SELECT id FROM categories WHERE slug = 'dupattas-stoles'),
  'Festive', 'Net', false, true, 4.4, 22,
  ARRAY['New Arrival'],
  ARRAY['https://images.pexels.com/photos/8886963/pexels-photo-8886963.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/8886965/pexels-photo-8886965.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-09-07T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000011',
  'Amrita Georgette Anarkali in Emerald',
  'amrita-georgette-anarkali-emerald',
  'An emerald green georgette anarkali with silver zari floral embroidery. A versatile piece for celebrations.',
  32000, 40000,
  (SELECT id FROM categories WHERE slug = 'anarkalis'),
  'Festive', 'Georgette', false, true, 4.6, 34,
  ARRAY['Festive Special'],
  ARRAY['https://images.pexels.com/photos/28405815/pexels-photo-28405815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/7176438/pexels-photo-7176438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-08-22T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_at_price, category_id, collection, fabric, featured, in_stock, rating, review_count, tags, images, created_at) VALUES
(
  'a0000001-0000-0000-0000-000000000012',
  'Nargis Spring Chiffon Saree',
  'nargis-spring-chiffon-saree',
  'A breezy spring chiffon saree in blush pink with silver thread work along the pallu. Light, luminous, effortless.',
  12500, 16000,
  (SELECT id FROM categories WHERE slug = 'sarees'),
  'Spring-Summer', 'Chiffon', false, true, 4.5, 47,
  ARRAY['Spring-Summer'],
  ARRAY['https://images.pexels.com/photos/32982848/pexels-photo-32982848.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'https://images.pexels.com/photos/32982934/pexels-photo-32982934.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  '2026-09-08T10:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PRODUCT VARIANTS + INVENTORY
-- Uses a DO block to insert variants and inventory in one pass.
-- Some variants deliberately have 0 stock.
-- ============================================================================

DO $$
DECLARE
  p1 uuid := 'a0000001-0000-0000-0000-000000000001';
  p2 uuid := 'a0000001-0000-0000-0000-000000000002';
  p3 uuid := 'a0000001-0000-0000-0000-000000000003';
  p4 uuid := 'a0000001-0000-0000-0000-000000000004';
  p5 uuid := 'a0000001-0000-0000-0000-000000000005';
  p6 uuid := 'a0000001-0000-0000-0000-000000000006';
  p7 uuid := 'a0000001-0000-0000-0000-000000000007';
  p8 uuid := 'a0000001-0000-0000-0000-000000000008';
  p9 uuid := 'a0000001-0000-0000-0000-000000000009';
  p10 uuid := 'a0000001-0000-0000-0000-000000000010';
  p11 uuid := 'a0000001-0000-0000-0000-000000000011';
  p12 uuid := 'a0000001-0000-0000-0000-000000000012';
  v_id uuid;
BEGIN
  -- Helper: insert variant + inventory
  -- p1: Rani Burgundy Banarasi Silk Saree — Burgundy + Green colors, Free Size
  v_id := gen_random_uuid();
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (v_id, p1, 'MIR-RANI-BUR-FS', 'Burgundy', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity, low_stock_threshold) VALUES (v_id, 8, 3) ON CONFLICT (variant_id) DO NOTHING;

  v_id := gen_random_uuid();
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (v_id, p1, 'MIR-RANI-GRN-FS', 'Green', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity, low_stock_threshold) VALUES (v_id, 0, 3) ON CONFLICT (variant_id) DO NOTHING;

  -- p2: Sindoor Red Bridal Lehenga — Red color, sizes XS-XL
  FOREACH v_id IN ARRAY ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()] LOOP
  END LOOP;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p2, 'MIR-SIND-RED-XS', 'Red', 'XS') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p2, 'MIR-SIND-RED-S', 'Red', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p2, 'MIR-SIND-RED-M', 'Red', 'M') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p2, 'MIR-SIND-RED-L', 'Red', 'L') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p2, 'MIR-SIND-RED-XL', 'Red', 'XL') ON CONFLICT (sku) DO NOTHING;

  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 2 FROM product_variants WHERE sku = 'MIR-SIND-RED-XS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 5 FROM product_variants WHERE sku = 'MIR-SIND-RED-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 7 FROM product_variants WHERE sku = 'MIR-SIND-RED-M' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 3 FROM product_variants WHERE sku = 'MIR-SIND-RED-L' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-SIND-RED-XL' ON CONFLICT (variant_id) DO NOTHING;

  -- p3: Gulabo Teal Chiffon Saree — Teal + Pink, Free Size
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p3, 'MIR-GUL-TEA-FS', 'Teal', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p3, 'MIR-GUL-PNK-FS', 'Pink', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 12 FROM product_variants WHERE sku = 'MIR-GUL-TEA-FS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 6 FROM product_variants WHERE sku = 'MIR-GUL-PNK-FS' ON CONFLICT (variant_id) DO NOTHING;

  -- p4: Marigold Pink Lehenga — Pink + Blue, sizes XS-L
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p4, 'MIR-MARI-PNK-XS', 'Pink', 'XS') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p4, 'MIR-MARI-PNK-S', 'Pink', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p4, 'MIR-MARI-PNK-M', 'Pink', 'M') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p4, 'MIR-MARI-PNK-L', 'Pink', 'L') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p4, 'MIR-MARI-BLU-S', 'Blue', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p4, 'MIR-MARI-BLU-M', 'Blue', 'M') ON CONFLICT (sku) DO NOTHING;

  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 4 FROM product_variants WHERE sku = 'MIR-MARI-PNK-XS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 9 FROM product_variants WHERE sku = 'MIR-MARI-PNK-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-MARI-PNK-M' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 3 FROM product_variants WHERE sku = 'MIR-MARI-PNK-L' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 5 FROM product_variants WHERE sku = 'MIR-MARI-BLU-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-MARI-BLU-M' ON CONFLICT (variant_id) DO NOTHING;

  -- p5: Sahiba Maroon Anarkali — Maroon + Navy, sizes S-XL
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p5, 'MIR-SAH-MAR-S', 'Maroon', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p5, 'MIR-SAH-MAR-M', 'Maroon', 'M') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p5, 'MIR-SAH-MAR-L', 'Maroon', 'L') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p5, 'MIR-SAH-MAR-XL', 'Maroon', 'XL') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p5, 'MIR-SAH-NAV-M', 'Navy', 'M') ON CONFLICT (sku) DO NOTHING;

  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 6 FROM product_variants WHERE sku = 'MIR-SAH-MAR-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 10 FROM product_variants WHERE sku = 'MIR-SAH-MAR-M' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 4 FROM product_variants WHERE sku = 'MIR-SAH-MAR-L' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-SAH-MAR-XL' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 2 FROM product_variants WHERE sku = 'MIR-SAH-NAV-M' ON CONFLICT (variant_id) DO NOTHING;

  -- p6: Gauri Ivory Organza Saree — Ivory + Blush, Free Size
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p6, 'MIR-GAU-IVY-FS', 'Ivory', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p6, 'MIR-GAU-BLS-FS', 'Blush', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 15 FROM product_variants WHERE sku = 'MIR-GAU-IVY-FS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 8 FROM product_variants WHERE sku = 'MIR-GAU-BLS-FS' ON CONFLICT (variant_id) DO NOTHING;

  -- p7: Padmini Red Bridal Couture Gown — Red, sizes XS-XL
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p7, 'MIR-PAD-RED-XS', 'Red', 'XS') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p7, 'MIR-PAD-RED-S', 'Red', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p7, 'MIR-PAD-RED-M', 'Red', 'M') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p7, 'MIR-PAD-RED-L', 'Red', 'L') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p7, 'MIR-PAD-RED-XL', 'Red', 'XL') ON CONFLICT (sku) DO NOTHING;

  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 1 FROM product_variants WHERE sku = 'MIR-PAD-RED-XS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 3 FROM product_variants WHERE sku = 'MIR-PAD-RED-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 4 FROM product_variants WHERE sku = 'MIR-PAD-RED-M' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 2 FROM product_variants WHERE sku = 'MIR-PAD-RED-L' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-PAD-RED-XL' ON CONFLICT (variant_id) DO NOTHING;

  -- p8: Chandni Gold Brocade Lehenga — Gold + Burgundy, sizes S-XL
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p8, 'MIR-CHA-GLD-S', 'Gold', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p8, 'MIR-CHA-GLD-M', 'Gold', 'M') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p8, 'MIR-CHA-GLD-L', 'Gold', 'L') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p8, 'MIR-CHA-GLD-XL', 'Gold', 'XL') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p8, 'MIR-CHA-BUR-M', 'Burgundy', 'M') ON CONFLICT (sku) DO NOTHING;

  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 5 FROM product_variants WHERE sku = 'MIR-CHA-GLD-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 8 FROM product_variants WHERE sku = 'MIR-CHA-GLD-M' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 3 FROM product_variants WHERE sku = 'MIR-CHA-GLD-L' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-CHA-GLD-XL' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 4 FROM product_variants WHERE sku = 'MIR-CHA-BUR-M' ON CONFLICT (variant_id) DO NOTHING;

  -- p9: Meher Cotton Kurti — White + Black, sizes XS-XL
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p9, 'MIR-MEH-WHT-XS', 'White', 'XS') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p9, 'MIR-MEH-WHT-S', 'White', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p9, 'MIR-MEH-WHT-M', 'White', 'M') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p9, 'MIR-MEH-WHT-L', 'White', 'L') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p9, 'MIR-MEH-WHT-XL', 'White', 'XL') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p9, 'MIR-MEH-BLK-M', 'Black', 'M') ON CONFLICT (sku) DO NOTHING;

  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 20 FROM product_variants WHERE sku = 'MIR-MEH-WHT-XS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 25 FROM product_variants WHERE sku = 'MIR-MEH-WHT-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 30 FROM product_variants WHERE sku = 'MIR-MEH-WHT-M' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 15 FROM product_variants WHERE sku = 'MIR-MEH-WHT-L' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 8 FROM product_variants WHERE sku = 'MIR-MEH-WHT-XL' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-MEH-BLK-M' ON CONFLICT (variant_id) DO NOTHING;

  -- p10: Roohi Maroon Net Dupatta — Maroon + Teal, Free Size
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p10, 'MIR-ROO-MAR-FS', 'Maroon', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p10, 'MIR-ROO-TEA-FS', 'Teal', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 14 FROM product_variants WHERE sku = 'MIR-ROO-MAR-FS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-ROO-TEA-FS' ON CONFLICT (variant_id) DO NOTHING;

  -- p11: Amrita Georgette Anarkali — Green + Maroon, sizes S-XL
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p11, 'MIR-AMR-GRN-S', 'Green', 'S') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p11, 'MIR-AMR-GRN-M', 'Green', 'M') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p11, 'MIR-AMR-GRN-L', 'Green', 'L') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p11, 'MIR-AMR-GRN-XL', 'Green', 'XL') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p11, 'MIR-AMR-MAR-M', 'Maroon', 'M') ON CONFLICT (sku) DO NOTHING;

  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 7 FROM product_variants WHERE sku = 'MIR-AMR-GRN-S' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 11 FROM product_variants WHERE sku = 'MIR-AMR-GRN-M' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 5 FROM product_variants WHERE sku = 'MIR-AMR-GRN-L' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-AMR-GRN-XL' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 3 FROM product_variants WHERE sku = 'MIR-AMR-MAR-M' ON CONFLICT (variant_id) DO NOTHING;

  -- p12: Nargis Spring Chiffon Saree — Pink + Lavender, Free Size
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p12, 'MIR-NAR-PNK-FS', 'Pink', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO product_variants (id, product_id, sku, color, size) VALUES (gen_random_uuid(), p12, 'MIR-NAR-LAV-FS', 'Lavender', 'Free Size') ON CONFLICT (sku) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 0 FROM product_variants WHERE sku = 'MIR-NAR-PNK-FS' ON CONFLICT (variant_id) DO NOTHING;
  INSERT INTO variant_inventory (variant_id, quantity) SELECT id, 9 FROM product_variants WHERE sku = 'MIR-NAR-LAV-FS' ON CONFLICT (variant_id) DO NOTHING;
END $$;
