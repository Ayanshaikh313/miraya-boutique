'use client';

import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductCard } from './ProductCard';
import { supabase } from '@/lib/supabase-client';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_COLLECTIONS,
  PRODUCT_FABRICS,
  SORT_OPTIONS,
  type SortValue,
  type ProductRow,
} from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProductCatalogue({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortValue>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching products:', error);
      }
      setProducts((data as ProductRow[]) ?? []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCollection = (col: string) => {
    setSelectedCollections((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const toggleFabric = (fab: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fab) ? prev.filter((f) => f !== fab) : [...prev, fab]
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedCollections([]);
    setSelectedFabrics([]);
    setInStockOnly(false);
    onSearchChange('');
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedCollections.length +
    selectedFabrics.length +
    (inStockOnly ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.collection ?? '').toLowerCase().includes(q) ||
          (p.fabric ?? '').toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (
        selectedCollections.length > 0 &&
        p.collection &&
        !selectedCollections.includes(p.collection)
      )
        return false;
      if (
        selectedFabrics.length > 0 &&
        p.fabric &&
        !selectedFabrics.includes(p.fabric)
      )
        return false;
      if (inStockOnly && !p.in_stock) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
        result = [...result].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result = [...result].sort(
          (a, b) => Number(b.featured) - Number(a.featured)
        );
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCollections,
    selectedFabrics,
    inStockOnly,
    sortBy,
  ]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Collections */}
      <div>
        <h4 className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium mb-3">
          Collection
        </h4>
        <div className="space-y-2.5">
          {PRODUCT_COLLECTIONS.map((col) => (
            <div key={col} className="flex items-center gap-2.5">
              <Checkbox
                id={`col-${col}`}
                checked={selectedCollections.includes(col)}
                onCheckedChange={() => toggleCollection(col)}
                className="border-gold/40 data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
              />
              <Label
                htmlFor={`col-${col}`}
                className="text-sm text-brown cursor-pointer font-normal hover:text-burgundy transition-colors"
              >
                {col}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-gold/15" />

      {/* Fabrics */}
      <div>
        <h4 className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium mb-3">
          Fabric
        </h4>
        <div className="space-y-2.5">
          {PRODUCT_FABRICS.map((fab) => (
            <div key={fab} className="flex items-center gap-2.5">
              <Checkbox
                id={`fab-${fab}`}
                checked={selectedFabrics.includes(fab)}
                onCheckedChange={() => toggleFabric(fab)}
                className="border-gold/40 data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
              />
              <Label
                htmlFor={`fab-${fab}`}
                className="text-sm text-brown cursor-pointer font-normal hover:text-burgundy transition-colors"
              >
                {fab}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-gold/15" />

      {/* Availability */}
      <div>
        <h4 className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium mb-3">
          Availability
        </h4>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked === true)}
            className="border-gold/40 data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
          />
          <Label
            htmlFor="in-stock"
            className="text-sm text-brown cursor-pointer font-normal hover:text-burgundy transition-colors"
          >
            In Stock Only
          </Label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={clearAll}
          className="w-full border-burgundy/20 text-burgundy hover:bg-burgundy/5 text-sm tracking-wide"
        >
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <section id="catalogue" className="py-16 lg:py-24 bg-ivory-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
            The Full Collection
          </p>
          <h2 className="font-serif-display text-4xl lg:text-5xl text-burgundy font-semibold">
            Product Catalogue
          </h2>
          <div className="ornament-divider mt-4">
            <span className="text-gold text-lg">&#10086;</span>
          </div>
        </div>

        {/* Search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name, fabric, collection..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-ivory border-gold/20 text-sm text-brown placeholder:text-muted-foreground focus-visible:ring-gold/40 h-11"
            />
          </div>

          <div className="flex gap-3">
            {/* Mobile filter trigger */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden border-gold/30 text-brown hover:bg-gold/5 h-11 font-medium tracking-wide relative"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 h-5 w-5 rounded-full bg-burgundy text-ivory text-xs font-medium flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 bg-ivory border-gold/20 overflow-y-auto"
              >
                <SheetHeader className="mb-4">
                  <SheetTitle className="font-serif-display text-2xl text-burgundy text-left">
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <FilterContent />
                <SheetClose asChild>
                  <Button className="w-full mt-6 bg-burgundy hover:bg-burgundy-dark text-ivory font-medium tracking-wide">
                    Show {filteredProducts.length} Results
                  </Button>
                </SheetClose>
              </SheetContent>
            </Sheet>

            {/* Sort dropdown */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
              <SelectTrigger className="w-full sm:w-52 h-11 bg-ivory border-gold/20 text-brown text-sm font-medium focus-visible:ring-gold/40">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-gold-dark" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-ivory border-gold/20">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-brown focus:bg-gold/10 focus:text-burgundy"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCollections.map((col) => (
              <Badge
                key={col}
                variant="outline"
                className="bg-burgundy/5 border-burgundy/20 text-burgundy gap-1.5 pr-1.5 rounded-sm"
              >
                {col}
                <button
                  onClick={() => toggleCollection(col)}
                  className="hover:bg-burgundy/10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedFabrics.map((fab) => (
              <Badge
                key={fab}
                variant="outline"
                className="bg-burgundy/5 border-burgundy/20 text-burgundy gap-1.5 pr-1.5 rounded-sm"
              >
                {fab}
                <button
                  onClick={() => toggleFabric(fab)}
                  className="hover:bg-burgundy/10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {inStockOnly && (
              <Badge
                variant="outline"
                className="bg-burgundy/5 border-burgundy/20 text-burgundy gap-1.5 pr-1.5 rounded-sm"
              >
                In Stock
                <button
                  onClick={() => setInStockOnly(false)}
                  className="hover:bg-burgundy/10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-burgundy underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Layout: sidebar + grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif-display text-xl text-burgundy font-medium">
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing{' '}
                    <span className="text-brown font-medium">
                      {filteredProducts.length}
                    </span>{' '}
                    {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                  </>
                )}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-ivory-200 rounded-sm animate-pulse border border-gold/10"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-ivory rounded-sm border border-gold/15">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 mb-4">
                  <Search className="h-7 w-7 text-gold-dark" />
                </div>
                <h3 className="font-serif-display text-2xl text-burgundy font-medium mb-2">
                  No pieces found
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  We could not find anything matching your search. Try adjusting
                  your filters or search terms.
                </p>
                <Button
                  onClick={clearAll}
                  className="bg-burgundy hover:bg-burgundy-dark text-ivory font-medium tracking-wide rounded-sm"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
