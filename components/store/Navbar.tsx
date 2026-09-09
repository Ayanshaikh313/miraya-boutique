'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase-client';
import type { CategoryRow } from '@/lib/types';

const navLinks = [
  { label: 'New Arrivals', href: '/#catalogue' },
  { label: 'Sarees', href: '/#catalogue' },
  { label: 'Lehengas', href: '/#catalogue' },
  { label: 'Bridal', href: '/#catalogue' },
  { label: 'Collections', href: '/#categories' },
];

export function AnnouncementBar() {
  return (
    <div className="bg-burgundy text-ivory text-center py-2 px-4 text-xs tracking-[0.2em] uppercase font-light">
      Complimentary shipping on orders above ₹5,000 — Festive Collection Now Live
    </div>
  );
}

export function Navbar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      setCategories((data as CategoryRow[]) ?? []);
    }
    fetchCategories();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-brown">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-ivory border-gold/20">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-6 border-b border-gold/20">
                    <span className="font-serif-display text-2xl text-burgundy tracking-wide">
                      MIRĀYA
                    </span>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="text-brown">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col gap-1 py-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.label}>
                        <Link
                          href={link.href}
                          className="px-4 py-3 text-sm text-brown hover:bg-gold/10 hover:text-burgundy transition-colors rounded-sm font-medium tracking-wide"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="border-t border-gold/20 pt-4 mt-auto">
                    <p className="px-4 text-xs text-muted-foreground uppercase tracking-widest mb-3">
                      Categories
                    </p>
                    {categories.map((cat) => (
                      <SheetClose asChild key={cat.id}>
                        <Link
                          href="/#catalogue"
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-burgundy transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex-1 lg:flex-none text-center lg:text-left">
            <span className="font-serif-display text-3xl lg:text-4xl text-burgundy tracking-[0.15em] font-semibold">
              MIRĀYA
            </span>
            <span className="hidden sm:block text-[10px] text-gold-dark tracking-[0.3em] uppercase font-light -mt-1">
              Indian Heritage Couture
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8 ml-12">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-brown hover:text-burgundy transition-colors font-medium tracking-wide relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 lg:flex-none justify-end">
            {/* Search - desktop */}
            <div className="hidden md:flex relative items-center mr-2">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search the collection..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-56 lg:w-64 pl-9 bg-ivory-100 border-gold/20 text-sm text-brown placeholder:text-muted-foreground focus-visible:ring-gold/40"
              />
            </div>

            {/* Search - mobile */}
            <Button variant="ghost" size="icon" className="md:hidden text-brown">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-brown hover:text-burgundy hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-brown hover:text-burgundy hidden sm:flex">
              <User className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-brown hover:text-burgundy relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-burgundy text-ivory text-[10px] font-medium flex items-center justify-center">
                0
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search the collection..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-ivory-100 border-gold/20 text-sm text-brown placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export { navLinks };
