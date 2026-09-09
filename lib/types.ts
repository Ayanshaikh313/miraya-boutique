export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  collection: string | null;
  fabric: string | null;
  featured: boolean;
  in_stock: boolean;
  rating: number;
  review_count: number;
  tags: string[];
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  sku: string;
  color: string;
  size: string;
  price_adjustment: number;
  created_at: string;
  updated_at: string;
}

export interface VariantInventoryRow {
  id: string;
  variant_id: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface VariantWithInventory extends ProductVariantRow {
  inventory: VariantInventoryRow | null;
}

export interface ProductWithRelations extends ProductRow {
  category: CategoryRow | null;
  variants: VariantWithInventory[];
}

export const PRODUCT_CATEGORIES = [
  'Sarees',
  'Lehengas',
  'Anarkalis',
  'Bridal Couture',
  'Kurtis & Suits',
  'Dupattas & Stoles',
] as const;

export const PRODUCT_COLLECTIONS = [
  'Heritage',
  'Festive',
  'Bridal',
  'Contemporary',
  'Spring-Summer',
] as const;

export const PRODUCT_FABRICS = [
  'Silk',
  'Chiffon',
  'Georgette',
  'Velvet',
  'Cotton',
  'Brocade',
  'Organza',
  'Net',
] as const;

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'] as const;

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  sku: string;
  product_name: string;
  product_image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  stock_quantity: number;
}

export interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  coupon_code: string | null;
  shipping_address: Record<string, any>;
  billing_address: Record<string, any> | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_sku: string;
  variant_color: string;
  variant_size: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Top Rated' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

