-- ============================================================================
-- RPC & Atomic Inventory Management for Checkout
-- ============================================================================

-- 1. Seed Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount_amount, starts_at, is_active)
VALUES 
  ('WELCOME10', '10% off on orders above ₹2,000', 'percentage', 10.00, 2000.00, 5000.00, now(), true),
  ('FESTIVE2000', '₹2,000 flat discount on orders above ₹10,000', 'fixed', 2000.00, 10000.00, NULL, now(), true),
  ('BRIDAL15', '15% off on orders above ₹25,000', 'percentage', 15.00, 25000.00, 10000.00, now(), true)
ON CONFLICT (code) DO NOTHING;

-- 2. Atomic Inventory Deduction Function
-- Guarantees race-condition safety by using a single atomic UPDATE statement with a row-level write lock.
CREATE OR REPLACE FUNCTION deduct_inventory_atomic(
  p_variant_id uuid,
  p_quantity int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows int;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN false;
  END IF;

  UPDATE variant_inventory
  SET quantity = quantity - p_quantity,
      updated_at = now()
  WHERE variant_id = p_variant_id
    AND quantity >= p_quantity;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN (v_rows = 1);
END;
$$;

-- 3. Atomic Inventory Restock/Rollback Function
CREATE OR REPLACE FUNCTION restore_inventory_atomic(
  p_variant_id uuid,
  p_quantity int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_quantity <= 0 THEN
    RETURN false;
  END IF;

  UPDATE variant_inventory
  SET quantity = quantity + p_quantity,
      updated_at = now()
  WHERE variant_id = p_variant_id;

  RETURN true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION deduct_inventory_atomic(uuid, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION restore_inventory_atomic(uuid, int) TO anon, authenticated, service_role;
