import { supabase } from './supabase-client';
import type { ProductRow } from './types';

export interface ProductSearchParams {
  query?: string;
  category?: string;
  color?: string;
  size?: string;
  maxPrice?: number;
  minPrice?: number;
  availableOnly?: boolean;
  saleStatus?: boolean;
  limit?: number;
}

/**
 * Server-side Product Search Query connected directly to Supabase as Source of Truth.
 * Enforces strict database filtering. Does NOT invent or fall back to non-matching items.
 */
export async function searchProducts(params: ProductSearchParams): Promise<ProductRow[]> {
  try {
    let query = supabase.from('products').select('*');

    // 1. Availability filter at product level
    if (params.availableOnly) {
      query = query.eq('in_stock', true);
    }

    // 2. Price filters
    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      query = query.lte('price', params.maxPrice);
    }
    if (params.minPrice !== undefined && params.minPrice > 0) {
      query = query.gte('price', params.minPrice);
    }

    // 3. Category Filter
    if (params.category) {
      const catName = params.category.trim();
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .or(`name.ilike.%${catName}%,slug.ilike.%${catName}%`)
        .maybeSingle();

      if (catData?.id) {
        query = query.eq('category_id', catData.id);
      } else {
        // If category specified does not exist in DB, no matches can exist
        return [];
      }
    }

    // 4. Text Search Query (Matches name, description, fabric, collection, tags)
    if (params.query) {
      const q = params.query.trim();
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,fabric.ilike.%${q}%,collection.ilike.%${q}%`);
    }

    // Order by newest
    query = query.order('created_at', { ascending: false }).limit(params.limit || 8);

    const { data: products, error } = await query;
    if (error) throw error;
    let results: ProductRow[] = products ?? [];

    // 5. Variant Level Filter (Color / Size / Inventory)
    if ((params.color || params.size) && results.length > 0) {
      const productIds = results.map((p) => p.id);
      let variantQuery = supabase
        .from('product_variants')
        .select('product_id, color, size, id, inventory:variant_inventory(quantity)')
        .in('product_id', productIds);

      if (params.color) {
        variantQuery = variantQuery.ilike('color', `%${params.color}%`);
      }
      if (params.size) {
        variantQuery = variantQuery.ilike('size', `%${params.size}%`);
      }

      const { data: variants } = await variantQuery;
      if (variants) {
        const matchingProductIds = new Set<string>();
        variants.forEach((v: any) => {
          if (!params.availableOnly) {
            matchingProductIds.add(v.product_id);
          } else {
            const invQty = Array.isArray(v.inventory) ? v.inventory[0]?.quantity : v.inventory?.quantity;
            if (invQty && invQty > 0) {
              matchingProductIds.add(v.product_id);
            }
          }
        });

        results = results.filter((p) => matchingProductIds.has(p.id));
      }
    }

    return results;
  } catch (err) {
    console.error('Error executing backend product search:', err);
    return [];
  }
}

/**
 * Fetch detailed product info including real-time inventory for variants.
 */
export async function getProductInventoryDetails(productId: string) {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (!product) return null;

    const { data: variants } = await supabase
      .from('product_variants')
      .select('*, inventory:variant_inventory(quantity)')
      .eq('product_id', productId);

    return {
      product: product as ProductRow,
      variants: (variants ?? []).map((v: any) => ({
        id: v.id,
        sku: v.sku,
        color: v.color,
        size: v.size,
        price_adjustment: v.price_adjustment,
        quantity: Array.isArray(v.inventory) ? (v.inventory[0]?.quantity ?? 0) : (v.inventory?.quantity ?? 0),
      })),
    };
  } catch (err) {
    console.error('Error fetching inventory details:', err);
    return null;
  }
}

/**
 * Match static store policy queries accurately.
 */
export function getStorePolicyAnswer(text: string): string | null {
  const lower = text.toLowerCase();
  
  // Prioritize COD / Cash on Delivery check before general "delivery" term
  if (lower.includes('cod') || lower.includes('cash on delivery') || lower.includes('pay on delivery')) {
    return 'Yes, Cash on Delivery (COD) is available for orders up to ₹10,000 across serviceable PIN codes in India.';
  }
  if (lower.includes('return') || lower.includes('exchange') || lower.includes('refund')) {
    return 'MIRĀYA offers a 7-day hassle-free return and exchange policy for unworn items with original tags intact.';
  }
  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('freight')) {
    return 'We offer complimentary standard shipping across India on all orders over ₹2,000. Standard delivery takes 3 to 5 business days.';
  }
  return null;
}
