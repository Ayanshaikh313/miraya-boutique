import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const footerLinks = {
  Shop: ['New Arrivals', 'Sarees', 'Lehengas', 'Bridal Couture', 'Gift Cards'],
  About: ['Our Story', 'Craftsmanship', 'Sustainability', 'Press', 'Careers'],
  Support: ['Contact Us', 'Shipping & Returns', 'Size Guide', 'FAQ', 'Track Order'],
};

export function Footer() {
  return (
    <footer className="bg-brown text-ivory relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Newsletter */}
      <div className="border-b border-ivory/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-serif-display text-3xl lg:text-4xl text-ivory font-semibold">
                Join the MIRĀYA Circle
              </h3>
              <p className="mt-3 text-sm text-ivory/60 font-light max-w-md">
                Be the first to discover new collections, private trunk shows,
                and stories from our artisan workshops.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-ivory/5 border-gold/30 text-ivory placeholder:text-ivory/40 focus-visible:ring-gold/40 h-12"
              />
              <Button className="bg-gold hover:bg-gold-dark text-brown-dark font-medium tracking-wide rounded-sm h-12 px-8 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <span className="font-serif-display text-3xl text-gold tracking-[0.15em] font-semibold">
              MIRĀYA
            </span>
            <p className="text-[10px] text-gold-light tracking-[0.3em] uppercase mt-1 font-light">
              Indian Heritage Couture
            </p>
            <p className="mt-4 text-sm text-ivory/50 font-light leading-relaxed max-w-xs">
              A premium boutique celebrating the timeless artistry of Indian
              women's fashion — handcrafted with devotion by master artisans.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-ivory/60">
                <MapPin className="h-4 w-4 text-gold/70 flex-shrink-0" />
                <span>12 Heritage Lane, Mumbai 400001, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ivory/60">
                <Phone className="h-4 w-4 text-gold/70 flex-shrink-0" />
                <span>+91 22 6789 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ivory/60">
                <Mail className="h-4 w-4 text-gold/70 flex-shrink-0" />
                <span>atelier@miraya.in</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-ivory/50 hover:text-gold-light transition-colors font-light"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="h-9 w-9 rounded-full border border-ivory/15 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/40 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="h-9 w-9 rounded-full border border-ivory/15 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/40 transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="h-9 w-9 rounded-full border border-ivory/15 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/40 transition-colors"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>

          <p className="text-xs text-ivory/40 text-center sm:text-right">
            © 2026 MIRĀYA. Crafted with devotion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
