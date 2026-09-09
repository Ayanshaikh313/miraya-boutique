'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import type {
  CartItem,
  CouponRow,
  ProductRow,
  VariantWithInventory,
} from '@/lib/types';

interface CartContextType {
  cartItems: CartItem[];
  cartId: string | null;
  sessionId: string | null;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  itemCount: number;
  couponCode: string;
  appliedCoupon: CouponRow | null;
  discount: number;
  shipping: number;
  total: number;
  addToCart: (
    variant: VariantWithInventory,
    product: ProductRow,
    quantity?: number
  ) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'miraya_session_id';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRow | null>(null);

  // Initialize session ID
  useEffect(() => {
    const sId = getOrCreateSessionId();
    setSessionId(sId);
  }, []);

  // Fetch or initialize cart from Supabase
  const initCart = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      // 1. Fetch active cart for session
      let { data: cart } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .maybeSingle();

      // 2. If no active cart exists, create one
      if (!cart) {
        const { data: newCart, error: createErr } = await supabase
          .from('carts')
          .insert({
            session_id: sessionId,
            status: 'active',
          })
          .select('*')
          .single();

        if (createErr) {
          console.error('Error creating cart:', createErr);
        } else {
          cart = newCart;
        }
      }

      if (cart) {
        setCartId(cart.id);

        // 3. Fetch cart items with variant and product details
        const { data: items, error: itemsErr } = await supabase
          .from('cart_items')
          .select(
            `
            id,
            cart_id,
            variant_id,
            quantity,
            product_variants (
              id,
              sku,
              color,
              size,
              price_adjustment,
              product_id,
              products (
                id,
                name,
                price,
                images
              ),
              variant_inventory (
                quantity
              )
            )
          `
          )
          .eq('cart_id', cart.id);

        if (itemsErr) {
          console.error('Error fetching cart items:', itemsErr);
        } else if (items) {
          const parsedItems: CartItem[] = items
            .map((item: any) => {
              const pv = item.product_variants;
              const prod = pv?.products;
              const inv = pv?.variant_inventory;
              if (!pv || !prod) return null;

              const effectivePrice =
                Number(prod.price) + Number(pv.price_adjustment ?? 0);
              const stockQty = Array.isArray(inv)
                ? Number(inv[0]?.quantity ?? 0)
                : Number(inv?.quantity ?? 0);

              return {
                id: item.id,
                cart_id: item.cart_id,
                product_id: prod.id,
                variant_id: pv.id,
                sku: pv.sku,
                product_name: prod.name,
                product_image: prod.images?.[0] ?? '',
                color: pv.color,
                size: pv.size,
                price: effectivePrice,
                quantity: item.quantity,
                stock_quantity: stockQty,
              };
            })
            .filter((i): i is CartItem => i !== null);

          setCartItems(parsedItems);
        }
      }
    } catch (err) {
      console.error('Cart initialization failed:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      initCart();
    }
  }, [sessionId, initCart]);

  // Subtotal & Item Count calculation
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Discount calculation
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < Number(appliedCoupon.min_order_value)) return 0;

    let d = 0;
    if (appliedCoupon.discount_type === 'percentage') {
      d = (subtotal * Number(appliedCoupon.discount_value)) / 100;
      if (appliedCoupon.max_discount_amount) {
        d = Math.min(d, Number(appliedCoupon.max_discount_amount));
      }
    } else {
      d = Number(appliedCoupon.discount_value);
    }
    return Math.min(d, subtotal);
  }, [appliedCoupon, subtotal]);

  // Shipping cost: Free if subtotal >= 5000, else 250 (unless cart empty)
  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 5000 ? 0 : 250;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping);
  }, [subtotal, discount, shipping]);

  // Add Item to Cart
  const addToCart = useCallback(
    async (
      variant: VariantWithInventory,
      product: ProductRow,
      quantity = 1
    ): Promise<boolean> => {
      const stock = variant.inventory?.quantity ?? 0;
      if (stock <= 0) {
        toast.error('This variant is currently out of stock.');
        return false;
      }

      const existingItem = cartItems.find((i) => i.variant_id === variant.id);
      const newQty = (existingItem?.quantity ?? 0) + quantity;

      if (newQty > stock) {
        toast.error(
          `Cannot add ${quantity} more. Only ${stock} units available in stock.`
        );
        return false;
      }

      const effectivePrice = product.price + (variant.price_adjustment ?? 0);

      // Optimistic UI update
      if (existingItem) {
        setCartItems((prev) =>
          prev.map((i) =>
            i.variant_id === variant.id ? { ...i, quantity: newQty } : i
          )
        );
      } else {
        const tempItem: CartItem = {
          id: `temp_${Date.now()}`,
          cart_id: cartId ?? '',
          product_id: product.id,
          variant_id: variant.id,
          sku: variant.sku,
          product_name: product.name,
          product_image: product.images[0] ?? '',
          color: variant.color,
          size: variant.size,
          price: effectivePrice,
          quantity: newQty,
          stock_quantity: stock,
        };
        setCartItems((prev) => [...prev, tempItem]);
      }

      toast.success(
        `Added to Bag: ${product.name} (${variant.color} / ${variant.size})`
      );

      // Sync with Supabase if cart ID exists
      if (cartId) {
        try {
          if (existingItem) {
            await supabase
              .from('cart_items')
              .update({ quantity: newQty })
              .eq('id', existingItem.id);
          } else {
            const { data } = await supabase
              .from('cart_items')
              .insert({
                cart_id: cartId,
                variant_id: variant.id,
                quantity: newQty,
              })
              .select('id')
              .single();

            if (data?.id) {
              setCartItems((prev) =>
                prev.map((i) =>
                  i.variant_id === variant.id ? { ...i, id: data.id } : i
                )
              );
            }
          }
        } catch (err) {
          console.error('Supabase cart sync error:', err);
        }
      }

      return true;
    },
    [cartId, cartItems]
  );

  // Update Quantity
  const updateQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      const targetItem = cartItems.find((i) => i.id === cartItemId);
      if (!targetItem) return;

      if (newQuantity > targetItem.stock_quantity) {
        toast.error(
          `Only ${targetItem.stock_quantity} units available in stock.`
        );
        return;
      }

      setCartItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQuantity } : i))
      );

      if (cartId && !cartItemId.startsWith('temp_')) {
        await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', cartItemId);
      }
    },
    [cartId, cartItems]
  );

  // Remove Item
  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      const targetItem = cartItems.find((i) => i.id === cartItemId);
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));

      if (targetItem) {
        toast.info(`Removed ${targetItem.product_name} from bag.`);
      }

      if (cartId && !cartItemId.startsWith('temp_')) {
        await supabase.from('cart_items').delete().eq('id', cartItemId);
      }
    },
    [cartId, cartItems]
  );

  // Apply Coupon
  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) {
        toast.error('Please enter a valid coupon code.');
        return false;
      }

      try {
        const { data: coupon, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle();

        if (error || !coupon) {
          toast.error('Invalid coupon code.');
          return false;
        }

        const couponRow = coupon as CouponRow;

        if (!couponRow.is_active) {
          toast.error('This coupon is no longer active.');
          return false;
        }

        const now = new Date();
        if (couponRow.starts_at && new Date(couponRow.starts_at) > now) {
          toast.error('This coupon is not active yet.');
          return false;
        }
        if (couponRow.ends_at && new Date(couponRow.ends_at) < now) {
          toast.error('This coupon has expired.');
          return false;
        }

        if (subtotal < Number(couponRow.min_order_value)) {
          toast.error(
            `Minimum order value of ₹${Number(couponRow.min_order_value).toLocaleString('en-IN')} required for coupon ${cleanCode}.`
          );
          return false;
        }

        setCouponCode(cleanCode);
        setAppliedCoupon(couponRow);
        toast.success(`Coupon ${cleanCode} applied successfully!`);
        return true;
      } catch (err) {
        console.error('Error applying coupon:', err);
        toast.error('Failed to validate coupon.');
        return false;
      }
    },
    [subtotal]
  );

  // Remove Coupon
  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCoupon(null);
    toast.info('Coupon removed.');
  }, []);

  // Clear Cart
  const clearCart = useCallback(async () => {
    setCartItems([]);
    setCouponCode('');
    setAppliedCoupon(null);

    if (cartId) {
      await supabase.from('cart_items').delete().eq('cart_id', cartId);
    }
  }, [cartId]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        sessionId,
        loading,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        itemCount,
        couponCode,
        appliedCoupon,
        discount,
        shipping,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
        refreshCart: initCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
