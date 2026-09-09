'use client';

import { useState } from 'react';
import { ProductCatalogue } from './ProductCatalogue';

export function StorefrontClient() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ProductCatalogue
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  );
}
