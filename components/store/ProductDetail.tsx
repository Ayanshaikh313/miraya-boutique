'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Truck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { ProductWithRelations, VariantWithInventory } from '@/lib/types';
import { formatPrice } from '@/lib/queries';
import { cn } from '@/lib/utils';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];

const COLOR_SWATCHES: Record<string, string> = {
  Burgundy: 'hsl(350 56% 27%)',
  Red: 'hsl(0 72% 45%)',
  Maroon: 'hsl(350 56% 20%)',
  Pink: 'hsl(340 65% 70%)',
  Teal: 'hsl(173 45% 40%)',
  Green: 'hsl(140 45% 35%)',
  Ivory: 'hsl(40 33% 95%)',
  Gold: 'hsl(41 42% 56%)',
  White: 'hsl(0 0% 98%)',
  Black: 'hsl(0 0% 12%)',
  Navy: 'hsl(222 45% 20%)',
  Blue: 'hsl(210 55% 50%)',
  Blush: 'hsl(340 40% 80%)',
  Lavender: 'hsl(270 40% 75%)',
};

export function ProductDetail({
  product,
}: {
  product: ProductWithRelations;
}) {
  const variants = product.variants;

  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants]
  );

  const sizes = useMemo(
    () =>
      Array.from(new Set(variants.map((v) => v.size))).sort(
        (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)
      ),
    [variants]
  );

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const images = product.images.length > 0 ? product.images : [''];

  const availableSizes = useMemo(() => {
    return sizes.filter((size) => {
      const variant = variants.find(
        (v) => v.color === selectedColor && v.size === size
      );
      return variant;
    });
  }, [sizes, variants, selectedColor]);

  const selectedVariant: VariantWithInventory | null = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return (
      variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) ?? null
    );
  }, [variants, selectedColor, selectedSize]);

  const stockQuantity = selectedVariant?.inventory?.quantity ?? 0;
  const isInStock = stockQuantity > 0;
  const isLowStock = isInStock && stockQuantity <= 5;

  const effectivePrice = product.price + (selectedVariant?.price_adjustment ?? 0);
  const discount = product.compare_at_price
    ? Math.round(
        ((Number(product.compare_at_price) - effectivePrice) /
          Number(product.compare_at_price)) *
          100
      )
    : 0;

  const canAddToCart = selectedColor && selectedSize && isInStock;
  const maxQuantity = Math.min(stockQuantity, 99);

  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    }
    if (!isInStock) {
      setQuantity(0);
    } else if (quantity === 0 && isInStock) {
      setQuantity(1);
    }
  }, [maxQuantity, isInStock, quantity]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize('');
    setQuantity(1);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* ================================================================
            IMAGE GALLERY
        ================================================================ */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'flex-shrink-0 w-20 h-24 lg:w-24 lg:h-28 rounded-sm overflow-hidden border-2 transition-all',
                    activeImage === i
                      ? 'border-gold shadow-md'
                      : 'border-gold/15 hover:border-gold/40'
                  )}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 relative overflow-hidden rounded-sm bg-ivory-200 border border-gold/15 group">
            <div className="aspect-[3/4] relative">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.tags.includes('New Arrival') && (
                  <span className="bg-gold text-brown-dark text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-sm">
                    New
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-burgundy text-ivory text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-sm">
                    {discount}% Off
                  </span>
                )}
              </div>
              <button
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-ivory/90 backdrop-blur-sm flex items-center justify-center hover:bg-ivory transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className="h-4 w-4 text-burgundy" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================
            PRODUCT INFO + SELECTORS
        ================================================================ */}
        <div className="flex flex-col">
          {/* Category + Collection */}
          <div className="flex items-center gap-3 mb-3">
            {product.category && (
              <span className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium">
                {product.category.name}
              </span>
            )}
            {product.collection && (
              <>
                <span className="h-3 w-px bg-gold/30" />
                <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {product.collection}
                </span>
              </>
            )}
          </div>

          {/* Name */}
          <h1 className="font-serif-display text-4xl lg:text-5xl text-burgundy font-semibold leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= Math.round(product.rating)
                      ? 'fill-gold text-gold'
                      : 'text-gold/30'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} · {product.review_count} reviews
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-3xl font-semibold text-burgundy">
              {formatPrice(effectivePrice)}
            </span>
            {product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(Number(product.compare_at_price))}
              </span>
            )}
            {discount > 0 && (
              <Badge className="bg-burgundy/10 text-burgundy border-burgundy/20 rounded-sm">
                Save {discount}%
              </Badge>
            )}
          </div>

          <Separator className="my-6 bg-gold/15" />

          {/* Description */}
          <p className="text-sm text-brown/70 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Fabric */}
          {product.fabric && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground tracking-wide uppercase">
                Fabric
              </span>
              <span className="text-sm text-brown font-medium">
                {product.fabric}
              </span>
            </div>
          )}

          {/* ============================================================
              COLOR SELECTION
          ============================================================ */}
          {colors.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium">
                  Color
                </span>
                <span className="text-sm text-brown font-medium">
                  {selectedColor || 'Select a color'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      'group relative h-11 w-11 rounded-full border-2 transition-all flex items-center justify-center',
                      selectedColor === color
                        ? 'border-gold ring-2 ring-gold/30 ring-offset-2 ring-offset-ivory'
                        : 'border-gold/20 hover:border-gold/50'
                    )}
                    aria-label={`Select color ${color}`}
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-brown/10"
                      style={{
                        backgroundColor:
                          COLOR_SWATCHES[color] ?? 'hsl(0 0% 50%)',
                      }}
                    />
                    {selectedColor === color && (
                      <Check
                        className={cn(
                          'absolute h-4 w-4',
                          isLightColor(color) ? 'text-brown' : 'text-ivory'
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              SIZE SELECTION
          ============================================================ */}
          {sizes.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium">
                  Size
                </span>
                {selectedColor && (
                  <span className="text-xs text-muted-foreground">
                    {availableSizes.length} available in {selectedColor}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => {
                  const variant = variants.find(
                    (v) => v.color === selectedColor && v.size === size
                  );
                  const hasVariant = !!variant;
                  const variantStock =
                    variant?.inventory?.quantity ?? 0;
                  const sizeInStock = variantStock > 0;

                  return (
                    <button
                      key={size}
                      onClick={() => hasVariant && sizeInStock && handleSizeChange(size)}
                      disabled={!hasVariant || !sizeInStock}
                      className={cn(
                        'relative h-11 min-w-[3rem] px-3 rounded-sm border text-sm font-medium tracking-wide transition-all',
                        selectedSize === size
                          ? 'border-burgundy bg-burgundy text-ivory'
                          : hasVariant && sizeInStock
                            ? 'border-gold/25 text-brown hover:border-burgundy/50 hover:bg-burgundy/5'
                            : 'border-gold/10 text-muted-foreground/40 cursor-not-allowed bg-ivory-100'
                      )}
                    >
                      {size}
                      {hasVariant && !sizeInStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-px bg-muted-foreground/30 rotate-[-20deg]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {!selectedColor && (
                <p className="text-xs text-muted-foreground mt-2">
                  Select a color first to see available sizes
                </p>
              )}
            </div>
          )}

          {/* ============================================================
              STOCK STATUS + SKU
          ============================================================ */}
          {selectedVariant && (
            <div className="mt-5 p-4 rounded-sm bg-ivory-100 border border-gold/15">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {isInStock ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        In Stock
                      </span>
                      {isLowStock && (
                        <span className="text-xs text-destructive ml-1">
                          Only {stockQuantity} left!
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
                <span className="text-xs text-muted-foreground tracking-wide">
                  SKU: {selectedVariant.sku}
                </span>
              </div>
            </div>
          )}

          {/* ============================================================
              QUANTITY SELECTOR
          ============================================================ */}
          {isInStock && selectedVariant && (
            <div className="mt-6">
              <span className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium block mb-3">
                Quantity
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gold/25 rounded-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-11 w-11 flex items-center justify-center text-brown hover:bg-burgundy/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-sm"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    max={maxQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) {
                        setQuantity(1);
                      } else {
                        setQuantity(Math.min(Math.max(1, val), maxQuantity));
                      }
                    }}
                    className="w-12 h-11 text-center text-sm font-medium text-brown bg-transparent border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(maxQuantity, q + 1))
                    }
                    disabled={quantity >= maxQuantity}
                    className="h-11 w-11 flex items-center justify-center text-brown hover:bg-burgundy/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-sm"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Max {maxQuantity} per order
                </span>
              </div>
            </div>
          )}

          {/* ============================================================
              ADD TO CART
          ============================================================ */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={cn(
                'flex-1 h-12 font-medium tracking-wide rounded-sm transition-all',
                canAddToCart
                  ? addedToCart
                    ? 'bg-green-700 hover:bg-green-700 text-ivory'
                    : 'bg-burgundy hover:bg-burgundy-dark text-ivory'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {addedToCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Added to Bag
                </>
              ) : !selectedColor ? (
                'Select a Color'
              ) : !selectedSize ? (
                'Select a Size'
              ) : !isInStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Bag — {formatPrice(effectivePrice * quantity)}
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-burgundy/30 text-burgundy hover:bg-burgundy/5 h-12 px-6 rounded-sm"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Selection prompt */}
          {!selectedColor && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Please select a color and size to continue
            </p>
          )}
          {selectedColor && !selectedSize && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Please select a size
            </p>
          )}

          <Separator className="my-7 bg-gold/15" />

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-gold-dark" />
              </div>
              <div>
                <p className="text-xs font-medium text-brown">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders above ₹5,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-gold-dark" />
              </div>
              <div>
                <p className="text-xs font-medium text-brown">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-gold-dark" />
              </div>
              <div>
                <p className="text-xs font-medium text-brown">Handcrafted</p>
                <p className="text-xs text-muted-foreground">By master artisans</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-gold/5 border-gold/30 text-gold-dark rounded-sm tracking-wide"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function isLightColor(color: string): boolean {
  const lightColors = ['Ivory', 'White', 'Gold', 'Blush', 'Lavender'];
  return lightColors.includes(color);
}
