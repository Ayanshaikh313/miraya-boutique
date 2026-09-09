import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cartId,
      sessionId,
      userId,
      customer,
      shippingAddress,
      couponCode,
      paymentSimulation,
    } = body;

    // 1. Basic payload validations
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: 'Customer details (Name, Email, Phone) are required.' },
        { status: 400 }
      );
    }

    if (
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return NextResponse.json(
        { error: 'Complete shipping address is required.' },
        { status: 400 }
      );
    }

    // 2. Simulated payment failure check
    if (paymentSimulation === 'failure') {
      return NextResponse.json(
        {
          error:
            'Simulated payment failed. Your card was not charged and inventory has not been deducted.',
        },
        { status: 400 }
      );
    }

    // 3. Fetch cart items from database (DO NOT trust frontend items or prices)
    if (!cartId && !sessionId) {
      return NextResponse.json(
        { error: 'Cart ID or Session ID is required.' },
        { status: 400 }
      );
    }

    let targetCartId = cartId;

    if (!targetCartId && sessionId) {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .maybeSingle();

      targetCartId = cart?.id;
    }

    if (!targetCartId) {
      return NextResponse.json(
        { error: 'Active cart not found.' },
        { status: 404 }
      );
    }

    const { data: rawCartItems, error: itemsErr } = await supabase
      .from('cart_items')
      .select('id, variant_id, quantity')
      .eq('cart_id', targetCartId);

    if (itemsErr || !rawCartItems || rawCartItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    // 4. Server-side product, variant & inventory validation and calculation
    const processedItems: Array<{
      variant_id: string;
      product_id: string;
      product_name: string;
      variant_sku: string;
      variant_color: string;
      variant_size: string;
      unit_price: number;
      quantity: number;
      line_total: number;
      stock_available: number;
    }> = [];

    let officialSubtotal = 0;

    for (const item of rawCartItems) {
      // Fetch variant with product and current inventory
      const { data: variant, error: vErr } = await supabase
        .from('product_variants')
        .select(
          `
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
            in_stock
          ),
          variant_inventory (
            quantity
          )
        `
        )
        .eq('id', item.variant_id)
        .single();

      if (vErr || !variant) {
        return NextResponse.json(
          { error: `Variant ID ${item.variant_id} not found.` },
          { status: 400 }
        );
      }

      const prod = (variant as any).products;
      const inv = (variant as any).variant_inventory;

      if (!prod || !prod.in_stock) {
        return NextResponse.json(
          { error: `Product "${prod?.name ?? 'Unknown'}" is unavailable.` },
          { status: 400 }
        );
      }

      const currentStock = Array.isArray(inv)
        ? Number(inv[0]?.quantity ?? 0)
        : Number(inv?.quantity ?? 0);

      if (item.quantity > currentStock) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${prod.name}" (${variant.color} / ${variant.size}). Available: ${currentStock}, Requested: ${item.quantity}.`,
          },
          { status: 409 }
        );
      }

      const unitPrice = Number(prod.price) + Number(variant.price_adjustment ?? 0);
      const lineTotal = unitPrice * item.quantity;
      officialSubtotal += lineTotal;

      processedItems.push({
        variant_id: variant.id,
        product_id: prod.id,
        product_name: prod.name,
        variant_sku: variant.sku,
        variant_color: variant.color,
        variant_size: variant.size,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: lineTotal,
        stock_available: currentStock,
      });
    }

    // 5. Server-side Coupon Validation & Discount Calculation
    let officialDiscount = 0;
    let validCouponCode: string | null = null;

    if (couponCode && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (coupon && coupon.is_active) {
        const now = new Date();
        const startsValid = !coupon.starts_at || new Date(coupon.starts_at) <= now;
        const endsValid = !coupon.ends_at || new Date(coupon.ends_at) >= now;
        const minOrderValid = officialSubtotal >= Number(coupon.min_order_value);

        if (startsValid && endsValid && minOrderValid) {
          validCouponCode = cleanCode;
          if (coupon.discount_type === 'percentage') {
            officialDiscount = (officialSubtotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount) {
              officialDiscount = Math.min(
                officialDiscount,
                Number(coupon.max_discount_amount)
              );
            }
          } else {
            officialDiscount = Number(coupon.discount_value);
          }
          officialDiscount = Math.min(officialDiscount, officialSubtotal);
        }
      }
    }

    // 6. Server-side Shipping & Final Total Calculation
    const officialShipping = officialSubtotal >= 5000 ? 0 : 250;
    const officialTotal = Math.max(0, officialSubtotal - officialDiscount + officialShipping);

    // 7. Atomic Concurrency-Safe Inventory Deduction
    const deductedVariants: Array<{ variant_id: string; quantity: number }> = [];

    for (const item of processedItems) {
      const { data: success, error: rpcErr } = await supabase.rpc(
        'deduct_inventory_atomic',
        {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        }
      );

      if (rpcErr || !success) {
        // Rollback any previously deducted inventory in this order request
        for (const prev of deductedVariants) {
          await supabase.rpc('restore_inventory_atomic', {
            p_variant_id: prev.variant_id,
            p_quantity: prev.quantity,
          });
        }

        return NextResponse.json(
          {
            error: `Stock reservation failed for ${item.product_name} (${item.variant_color} / ${item.variant_size}). Another customer may have just purchased the remaining stock.`,
          },
          { status: 409 }
        );
      }

      deductedVariants.push({
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
    }

    // 8. Generate Order Number & Insert Order
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `MIR-2026-${randomDigits}`;

    const { data: createdOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        order_number: orderNumber,
        status: 'confirmed',
        subtotal: officialSubtotal,
        discount: officialDiscount,
        shipping_cost: officialShipping,
        tax: 0,
        total: officialTotal,
        coupon_code: validCouponCode,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      })
      .select('*')
      .single();

    if (orderErr || !createdOrder) {
      // Rollback deducted inventory if order creation fails
      for (const prev of deductedVariants) {
        await supabase.rpc('restore_inventory_atomic', {
          p_variant_id: prev.variant_id,
          p_quantity: prev.quantity,
        });
      }

      console.error('Order creation failed:', orderErr);
      return NextResponse.json(
        { error: 'Failed to create order record.' },
        { status: 500 }
      );
    }

    // 9. Insert Order Items (preserving unit_price snapshot)
    const orderItemRows = processedItems.map((item) => ({
      order_id: createdOrder.id,
      variant_id: item.variant_id,
      product_id: item.product_id,
      product_name: item.product_name,
      variant_sku: item.variant_sku,
      variant_color: item.variant_color,
      variant_size: item.variant_size,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
    }));

    await supabase.from('order_items').insert(orderItemRows);

    // 10. Mark cart as converted & clear cart_items
    await supabase
      .from('carts')
      .update({ status: 'converted' })
      .eq('id', targetCartId);

    await supabase.from('cart_items').delete().eq('cart_id', targetCartId);

    // 11. Update coupon usage count if used
    if (validCouponCode) {
      const { data: cData } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('code', validCouponCode)
        .maybeSingle();

      if (cData) {
        await supabase
          .from('coupons')
          .update({ usage_count: (cData.usage_count || 0) + 1 })
          .eq('code', validCouponCode);
      }
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
      items: orderItemRows,
    });
  } catch (err: any) {
    console.error('Unhandled checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during checkout.' },
      { status: 500 }
    );
  }
}
