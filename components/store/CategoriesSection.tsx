import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '@/lib/queries';

export async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <section id="categories" className="py-16 lg:py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
            Browse by Type
          </p>
          <h2 className="font-serif-display text-4xl lg:text-5xl text-burgundy font-semibold">
            Shop by Category
          </h2>
          <div className="ornament-divider mt-4">
            <span className="text-gold text-lg">&#10086;</span>
          </div>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/?category=${encodeURIComponent(cat.name)}#catalogue`}
              className="group relative overflow-hidden rounded-sm aspect-[4/5] bg-brown animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={cat.image_url ?? ''}
                alt={cat.name}
                className="h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:opacity-50 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/90 via-brown/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6 text-ivory">
                <h3 className="font-serif-display text-2xl lg:text-3xl font-semibold leading-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-ivory/70 mt-1.5 line-clamp-2 font-light leading-relaxed">
                  {cat.description}
                </p>
                <div className="flex items-center gap-2 mt-3 text-gold-light">
                  <span className="text-xs tracking-widest uppercase font-medium">
                    Explore
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                </div>
              </div>

              {/* Gold border on hover */}
              <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/50 transition-colors duration-500 pointer-events-none rounded-sm" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
