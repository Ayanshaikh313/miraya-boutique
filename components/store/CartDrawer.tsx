'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/queries';

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    itemCount,
    couponCode,
    appliedCoupon,
    discount,
    shipping,
    total,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setApplying(true);
    const success = await applyCoupon(inputCode);
    if (success) {
      setInputCode('');
    }
    setApplying(false);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-brown hover:text-burgundy relative"
          aria-label="Shopping Bag"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-burgundy text-ivory text-[10px] font-medium flex items-center justify-center animate-scale-in">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-ivory border-l border-gold/20 p-0 flex flex-col h-full"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b border-gold/20 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-burgundy" />
            <SheetTitle className="font-serif-display text-xl text-burgundy font-semibold tracking-wide">
              Your Shopping Bag ({itemCount})
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Cart items list or Empty state */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 text-gold-dark">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-serif-display text-2xl text-burgundy font-medium mb-2">
                Your Bag is Empty
              </h3>
              <p className="text-sm text-brown/60 max-w-xs mb-6 font-light">
                Explore our handcrafted drapes, lehengas, and couture to curate your dream outfit.
              </p>
              <SheetClose asChild>
                <Link href="/#catalogue">
                  <Button className="bg-burgundy hover:bg-burgundy-dark text-ivory rounded-sm px-6">
                    Explore Collection
                  </Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            cartItems.map((item) => {
              const isOverStock = item.quantity > item.stock_quantity;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-sm border border-gold/15 bg-ivory-50 relative group"
                >
                  {/* Thumbnail */}
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-ivory-200">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif-display text-sm font-medium text-brown leading-snug line-clamp-1">
                          {item.product_name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-brown/40 hover:text-burgundy transition-colors ml-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Attributes */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Color: <strong className="text-brown font-normal">{item.color}</strong>
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Size: <strong className="text-brown font-normal">{item.size}</strong>
                        </span>
                      </div>

                      {/* Low stock/over stock warning */}
                      {isOverStock && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1 font-medium">
                          <AlertCircle className="h-3 w-3" /> Only {item.stock_quantity} available in stock
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gold/30 rounded-sm bg-ivory">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-brown hover:text-burgundy transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-brown">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          className="px-2 py-1 text-brown hover:text-burgundy disabled:opacity-30 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-medium text-sm text-burgundy">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with totals & Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="border-t border-gold/20 p-6 bg-ivory-50 space-y-4">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-gold/10 border border-gold/30 px-3 py-2 rounded-sm text-xs">
                  <div className="flex items-center gap-2 text-gold-dark font-medium">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Coupon: {appliedCoupon.code}</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-brown/60 hover:text-burgundy"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Promo / Coupon Code (e.g. WELCOME10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="pl-8 h-9 text-xs border-gold/20 bg-ivory uppercase"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={applying || !inputCode.trim()}
                    className="border-gold/30 text-burgundy hover:bg-gold/10 h-9 text-xs px-3"
                  >
                    {applying ? '...' : 'Apply'}
                  </Button>
                </form>
              )}
            </div>

            <Separator className="bg-gold/15" />

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-brown">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-burgundy font-medium">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? <strong className="text-emerald-700 font-medium">FREE</strong> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-burgundy pt-2 border-t border-gold/15">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout CTA Button */}
            <SheetClose asChild>
              <Link href="/checkout" className="block w-full">
                <Button className="w-full bg-burgundy hover:bg-burgundy-dark text-ivory h-11 font-medium tracking-wide rounded-sm group flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
