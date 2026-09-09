import { AnnouncementBar, Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { FeaturedProducts } from '@/components/store/FeaturedProducts';
import { CategoriesSection } from '@/components/store/CategoriesSection';
import { StorefrontClient } from '@/components/store/StorefrontClient';
import { Footer } from '@/components/store/Footer';

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar searchQuery="" onSearchChange={() => {}} />
      <main>
        <Hero />
        <FeaturedProducts />
        <CategoriesSection />
        <StorefrontClient />
      </main>
      <Footer />
    </>
  );
}
