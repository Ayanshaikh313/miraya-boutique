'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { type ProductRow } from '@/lib/types';
import { formatPrice } from '@/lib/queries';
import { cn } from '@/lib/utils';

export function ProductCard({
  product,
  index = 0,
}: {
  product: ProductRow;
  index?: number;
}) {
  const [imgSrc, setImgSrc] = useState(
    product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
  );

  const discount = product.compare_at_price
    ? Math.round(
        ((Number(product.compare_at_price) - Number(product.price)) /
          Number(product.compare_at_price)) *
          100
      )
    : 0;

  return (
    <div
      className={cn(
        'group relative bg-card rounded-sm overflow-hidden border border-gold/15 hover:border-gold/40 transition-all duration-500 hover:shadow-xl animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-[3/4] overflow-hidden bg-ivory-200"
      >
        <img
          src={imgSrc}
          alt={product.name}
          onError={() =>
            setImgSrc(
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
            )
          }
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
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
          {!product.in_stock && (
            <span className="bg-brown text-ivory text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-ivory/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-ivory"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-burgundy" />
        </button>

        {/* Quick view bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-burgundy/95 text-ivory text-center py-2.5 text-xs font-medium tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          View Details
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="h-3 w-3 fill-gold text-gold" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.review_count})
          </span>
          {product.fabric && (
            <span className="text-xs text-muted-foreground ml-auto text-gold-dark tracking-wide uppercase">
              {product.fabric}
            </span>
          )}
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif-display text-lg text-brown font-medium leading-snug hover:text-burgundy transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.collection && (
          <p className="text-xs text-muted-foreground mt-1 tracking-wide">
            {product.collection}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-burgundy">
            {formatPrice(Number(product.price))}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(Number(product.compare_at_price))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
