import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnnouncementBar, Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { ProductDetail } from '@/components/store/ProductDetail';
import { ProductCard } from '@/components/store/ProductCard';
import { getProductBySlug, getFeaturedProducts } from '@/lib/queries';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Product Not Found — MIRĀYA' };
  }
  return {
    title: `${product.name} — MIRĀYA`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const related = (await getFeaturedProducts())
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <>
      <AnnouncementBar />
      <Navbar searchQuery="" onSearchChange={() => {}} />
      <main className="bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/#catalogue"
            className="inline-flex items-center gap-2 text-sm text-brown/60 hover:text-burgundy transition-colors tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collection
          </Link>
        </div>
        <ProductDetail product={product} />

        {related.length > 0 && (
          <section className="py-16 bg-ivory-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
                  You May Also Love
                </p>
                <h2 className="font-serif-display text-3xl lg:text-4xl text-burgundy font-semibold">
                  Complete the Look
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
