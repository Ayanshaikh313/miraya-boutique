import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { getFeaturedProducts } from '@/lib/queries';

export async function FeaturedProducts() {
  const featured = await getFeaturedProducts();

  return (
    <section className="py-16 lg:py-24 bg-ivory-50 relative overflow-hidden">
      <div className="absolute inset-0 baroque-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
            Curated Selection
          </p>
          <h2 className="font-serif-display text-4xl lg:text-5xl text-burgundy font-semibold">
            Featured Pieces
          </h2>
          <div className="ornament-divider mt-4">
            <span className="text-gold text-lg">&#10086;</span>
          </div>
          <p className="mt-4 text-sm text-brown/60 max-w-lg mx-auto font-light">
            Handpicked treasures from our master artisans — each piece a
            celebration of India living textile heritage.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-12">
          <Link href="/#catalogue">
            <Button
              variant="outline"
              className="border-burgundy/30 text-burgundy hover:bg-burgundy/5 font-medium tracking-wide rounded-sm px-8 h-11 group"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
