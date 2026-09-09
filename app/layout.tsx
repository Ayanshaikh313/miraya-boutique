import './globals.css';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { Toaster } from 'sonner';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MIRĀYA — Premium Indian Women's Fashion",
  description:
    "MIRĀYA is a premium boutique celebrating the artistry of Indian women's fashion — sarees, lehengas, anarkalis, and bridal couture crafted with timeless elegance.",
  keywords: [
    'Indian fashion',
    'sarees',
    'lehengas',
    'bridal wear',
    'anarkali',
    'premium boutique',
    'women fashion India',
  ],
  openGraph: {
    title: "MIRĀYA — Premium Indian Women's Fashion",
    description:
      "A premium boutique celebrating the artistry of Indian women's fashion.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


