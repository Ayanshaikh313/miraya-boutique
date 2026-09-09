-- ============================================================================
-- AUTHENTICATION, USER PROFILES, ROLES, AND CART MERGE MIGRATION
-- ============================================================================

-- 1. Add email and role columns to users table if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'customer';

-- Add check constraint for role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_role'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('customer', 'admin'));
  END IF;
END $$;

-- 2. Trigger Function: Automatically create profile in public.users when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Anonymous Cart Merge Function
CREATE OR REPLACE FUNCTION public.merge_anonymous_cart(
  p_session_id text,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_anon_cart_id uuid;
  v_user_cart_id uuid;
  v_item record;
  v_stock int;
  v_existing_qty int;
  v_new_qty int;
BEGIN
  IF p_session_id IS NULL OR p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Find active anonymous cart
  SELECT id INTO v_anon_cart_id
  FROM carts
  WHERE session_id = p_session_id AND status = 'active'
  LIMIT 1;

  -- Find active user cart
  SELECT id INTO v_user_cart_id
  FROM carts
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  IF v_anon_cart_id IS NULL THEN
    IF v_user_cart_id IS NULL THEN
      INSERT INTO carts (user_id, status) VALUES (p_user_id, 'active') RETURNING id INTO v_user_cart_id;
    END IF;
    RETURN v_user_cart_id;
  END IF;

  IF v_user_cart_id IS NULL THEN
    UPDATE carts
    SET user_id = p_user_id, session_id = NULL
    WHERE id = v_anon_cart_id;
    RETURN v_anon_cart_id;
  END IF;

  -- Merge items
  FOR v_item IN SELECT * FROM cart_items WHERE cart_id = v_anon_cart_id LOOP
    SELECT quantity INTO v_stock FROM variant_inventory WHERE variant_id = v_item.variant_id;
    v_stock := COALESCE(v_stock, 0);

    SELECT quantity INTO v_existing_qty FROM cart_items WHERE cart_id = v_user_cart_id AND variant_id = v_item.variant_id;

    IF v_existing_qty IS NOT NULL THEN
      v_new_qty := LEAST(v_existing_qty + v_item.quantity, v_stock);
      UPDATE cart_items SET quantity = v_new_qty, updated_at = now() WHERE cart_id = v_user_cart_id AND variant_id = v_item.variant_id;
    ELSE
      v_new_qty := LEAST(v_item.quantity, v_stock);
      IF v_new_qty > 0 THEN
        INSERT INTO cart_items (cart_id, variant_id, quantity)
        VALUES (v_user_cart_id, v_item.variant_id, v_new_qty)
        ON CONFLICT (cart_id, variant_id) DO UPDATE SET quantity = EXCLUDED.quantity;
      END IF;
    END IF;
  END LOOP;

  DELETE FROM cart_items WHERE cart_id = v_anon_cart_id;
  UPDATE carts SET status = 'abandoned' WHERE id = v_anon_cart_id;

  RETURN v_user_cart_id;
END;
$$;

GRANT EXECUTE ON FUNCTION merge_anonymous_cart(text, uuid) TO anon, authenticated, service_role;

-- 4. Secure RLS Policy Enhancements for Orders
-- Allow authenticated users to view only their own orders
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders"
ON orders FOR SELECT
TO authenticated USING (auth.uid() = user_id);

-- Allow authenticated users to view only their own order items
DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items"
ON order_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
