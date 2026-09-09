import { supabase } from './supabase-client';
import type {
  ProductRow,
  CategoryRow,
  ProductWithRelations,
  VariantWithInventory,
} from './types';

export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data ?? [];
}

export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data ?? [];
}

export async function getFeaturedProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  return data ?? [];
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  if (!product) return null;

  const { data: variants, error: vError } = await supabase
    .from('product_variants')
    .select(
      `
        *,
        inventory:variant_inventory(*)
      `
    )
    .eq('product_id', product.id);

  if (vError) {
    console.error('Error fetching variants:', vError);
  }

  const category = product.category_id
    ? await getCategoryById(product.category_id)
    : null;

  return {
    ...product,
    category,
    variants: (variants ?? []) as unknown as VariantWithInventory[],
  };
}

export async function getCategoryById(
  id: string
): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  return data;
}

export function formatPrice(price: number): string {
  return `₹${Number(price).toLocaleString('en-IN')}`;
}
