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

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Top Rated' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];
