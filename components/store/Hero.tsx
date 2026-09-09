import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      {/* Decorative baroque pattern overlay */}
      <div className="absolute inset-0 baroque-bg opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px] lg:min-h-[680px] py-12 lg:py-20">
          {/* Text column */}
          <div className="order-2 lg:order-1 text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-gold-dark" />
              <span className="text-xs tracking-[0.2em] uppercase text-gold-dark font-medium">
                Festive Collection 2026
              </span>
            </div>

            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl text-burgundy leading-[1.1] font-semibold text-balance">
              Where Heritage
              <br />
              Meets <span className="text-gold-shimmer">Couture</span>
            </h1>

            <p className="mt-6 text-base lg:text-lg text-brown/70 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
              Discover handcrafted sarees, lehengas, and bridal couture that
              celebrate the timeless artistry of Indian craftsmanship — reimagined
              for the modern woman.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="#catalogue">
                <Button
                  size="lg"
                  className="bg-burgundy hover:bg-burgundy-dark text-ivory font-medium tracking-wide rounded-sm px-8 h-12 group"
                >
                  Explore the Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-burgundy/30 text-burgundy hover:bg-burgundy/5 font-medium tracking-wide rounded-sm px-8 h-12"
                >
                  Shop by Category
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start">
              {[
                'Handwoven Craftsmanship',
                'Authentic Indian Textiles',
                'Made to Order',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-brown/60 tracking-wide"
                >
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div className="order-1 lg:order-2 relative animate-scale-in">
            <div className="relative grid grid-cols-2 gap-3 lg:gap-4">
              {/* Main image */}
              <div className="row-span-2 relative overflow-hidden rounded-sm shadow-2xl group">
                <img
                  src="https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg?auto=compress&cs=tinysrgb&h=900&w=600"
                  alt="Indian woman in elegant traditional saree"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy/20 to-transparent" />
              </div>

              {/* Top right image */}
              <div className="relative overflow-hidden rounded-sm shadow-xl group">
                <img
                  src="https://images.pexels.com/photos/25811178/pexels-photo-25811178.jpeg?auto=compress&cs=tinysrgb&h=450&w=450"
                  alt="Indian bride in red lehenga"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Bottom right image */}
              <div className="relative overflow-hidden rounded-sm shadow-xl group">
                <img
                  src="https://images.pexels.com/photos/2531734/pexels-photo-2531734.jpeg?auto=compress&cs=tinysrgb&h=450&w=450"
                  alt="Woman in maroon sari with traditional jewelry"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Floating accent badge */}
            <div className="absolute -bottom-4 -left-4 hidden lg:flex items-center gap-3 bg-burgundy text-ivory px-5 py-3 rounded-sm shadow-xl">
              <div className="text-center">
                <p className="font-serif-display text-2xl font-semibold leading-none">
                  200+
                </p>
                <p className="text-[10px] tracking-widest uppercase mt-1 text-gold-light">
                  Unique Pieces
                </p>
              </div>
              <div className="h-10 w-px bg-gold/30" />
              <div className="text-center">
                <p className="font-serif-display text-2xl font-semibold leading-none">
                  25+
                </p>
                <p className="text-[10px] tracking-widest uppercase mt-1 text-gold-light">
                  Master Weavers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
