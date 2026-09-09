'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { ProductCatalogue } from './ProductCatalogue';

export function StorefrontClient({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        {children}
        <ProductCatalogue
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </main>
    </>
  );
}

