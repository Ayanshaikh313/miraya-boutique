'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
  Tag,
  Truck,
  CreditCard,
  XIcon,
} from 'lucide-react';
import { AnnouncementBar, Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/queries';
import type { OrderRow } from '@/lib/types';

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const {
    cartItems,
    cartId,
    sessionId,
    subtotal,
    couponCode,
    appliedCoupon,
    discount,
    shipping,
    total,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  // Form State
  const [customer, setCustomer] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
  });

  // Auto-fill when auth finishes loading
  useEffect(() => {
    if (user || profile) {
      setCustomer((prev) => ({
        name: prev.name || profile?.full_name || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [user, profile]);

  const [address, setAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentOption, setPaymentOption] = useState<'success' | 'failure'>('success');
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderRow | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setErrorMsg(null);
    const ok = await applyCoupon(couponInput);
    if (ok) setCouponInput('');
    setApplyingCoupon(false);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setErrorMsg('Please fill in all customer contact details.');
      return;
    }

    if (!address.address.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          sessionId,
          userId: user?.id || null,
          customer,
          shippingAddress: address,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          paymentSimulation: paymentOption,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Checkout process failed. Please try again.');
        setSubmitting(false);
        return;
      }

      // Successful order creation
      setCreatedOrder(data.order);
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // ORDER CONFIRMATION SCREEN
  // --------------------------------------------------------------------------
  if (createdOrder) {
    return (
      <>
        <AnnouncementBar />
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <main className="bg-ivory min-h-screen py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
            <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <p className="text-xs tracking-[0.3em] uppercase text-gold-dark font-medium mb-2">
              Order Confirmed
            </p>
            <h1 className="font-serif-display text-4xl sm:text-5xl text-burgundy font-semibold mb-4">
              Thank You for Your Order
            </h1>
            <p className="text-brown/70 text-base max-w-md mx-auto mb-8 font-light leading-relaxed">
              We have received your order{' '}
              <strong className="text-burgundy font-semibold">
                {createdOrder.order_number}
              </strong>
              . A confirmation receipt has been sent to{' '}
              <strong className="text-brown">{createdOrder.customer_email}</strong>.
            </p>

            <div className="bg-ivory-50 border border-gold/20 rounded-sm p-6 sm:p-8 text-left mb-10 max-w-xl mx-auto space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gold/15">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  Order Number
                </span>
                <span className="font-mono text-sm font-semibold text-burgundy">
                  {createdOrder.order_number}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gold/15">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  Order Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burgundy/10 text-burgundy uppercase tracking-wider">
                  {createdOrder.status}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gold/15">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  Shipping Address
                </span>
                <span className="text-sm text-brown text-right">
                  {createdOrder.shipping_address?.address},{' '}
                  {createdOrder.shipping_address?.city},{' '}
                  {createdOrder.shipping_address?.state} -{' '}
                  {createdOrder.shipping_address?.pincode}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-semibold text-burgundy">
                  Total Paid
                </span>
                <span className="text-lg font-bold text-burgundy">
                  {formatPrice(Number(createdOrder.total))}
                </span>
              </div>
            </div>

            <Link href="/#catalogue">
              <Button size="lg" className="bg-burgundy hover:bg-burgundy-dark text-ivory px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // --------------------------------------------------------------------------
  // EMPTY BAG SCREEN
  // --------------------------------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <>
        <AnnouncementBar />
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <main className="bg-ivory min-h-screen py-20">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="font-serif-display text-3xl text-burgundy font-semibold mb-2">
              Your Bag is Empty
            </h2>
            <p className="text-brown/70 text-sm mb-6 font-light">
              Add handcrafted pieces to your shopping bag before proceeding to checkout.
            </p>
            <Link href="/#catalogue">
              <Button className="bg-burgundy hover:bg-burgundy-dark text-ivory px-6">
                Explore Collection
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // --------------------------------------------------------------------------
  // CHECKOUT FORM SCREEN
  // --------------------------------------------------------------------------
  return (
    <>
      <AnnouncementBar />
      <Navbar searchQuery="" onSearchChange={() => {}} />
      <main className="bg-ivory min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/#catalogue"
              className="inline-flex items-center gap-2 text-xs text-brown/60 hover:text-burgundy transition-colors tracking-wide uppercase"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Collection
            </Link>
            <h1 className="font-serif-display text-3xl lg:text-4xl text-burgundy font-semibold mt-2">
              Checkout & Payment
            </h1>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm flex items-start gap-3 text-red-800 text-sm animate-fade-in-up">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Checkout Error</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleCheckout} className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-7 space-y-8">
              {/* Section 1: Customer Info */}
              <div className="bg-ivory-50 border border-gold/20 rounded-sm p-6 space-y-4">
                <h2 className="font-serif-display text-xl text-burgundy font-semibold border-b border-gold/15 pb-3">
                  1. Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wide text-brown">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="bg-ivory border-gold/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wide text-brown">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="bg-ivory border-gold/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wide text-brown">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="bg-ivory border-gold/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="bg-ivory-50 border border-gold/20 rounded-sm p-6 space-y-4">
                <h2 className="font-serif-display text-xl text-burgundy font-semibold border-b border-gold/15 pb-3">
                  2. Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs uppercase tracking-wide text-brown">
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      required
                      placeholder="House/Flat No., Street, Area"
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      className="bg-ivory border-gold/20"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs uppercase tracking-wide text-brown">
                        City *
                      </Label>
                      <Input
                        id="city"
                        required
                        placeholder="Mumbai"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="bg-ivory border-gold/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs uppercase tracking-wide text-brown">
                        State *
                      </Label>
                      <Input
                        id="state"
                        required
                        placeholder="Maharashtra"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="bg-ivory border-gold/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs uppercase tracking-wide text-brown">
                        Pincode *
                      </Label>
                      <Input
                        id="pincode"
                        required
                        placeholder="400001"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        className="bg-ivory border-gold/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Simulation Option */}
              <div className="bg-ivory-50 border border-gold/20 rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                  <h2 className="font-serif-display text-xl text-burgundy font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    3. Payment Simulation
                  </h2>
                  <span className="text-[11px] bg-gold/10 text-gold-dark px-2.5 py-1 rounded-sm uppercase tracking-wider font-medium">
                    Test Mode
                  </span>
                </div>

                <RadioGroup
                  value={paymentOption}
                  onValueChange={(val) => setPaymentOption(val as 'success' | 'failure')}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-sm border border-gold/30 bg-ivory hover:border-gold/60 cursor-pointer">
                    <RadioGroupItem value="success" id="pay-success" className="text-burgundy" />
                    <Label htmlFor="pay-success" className="cursor-pointer text-sm text-brown font-medium flex-1">
                      💳 Simulated Online Payment (Success)
                      <span className="block text-xs text-muted-foreground font-light">
                        Simulates successful card authorization and creates an order.
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-sm border border-red-200 bg-red-50/50 hover:border-red-300 cursor-pointer">
                    <RadioGroupItem value="failure" id="pay-failure" className="text-red-600" />
                    <Label htmlFor="pay-failure" className="cursor-pointer text-sm text-red-900 font-medium flex-1">
                      ❌ Simulated Payment Failure (Test Error Handling)
                      <span className="block text-xs text-red-700/70 font-light">
                        Simulates card decline. Verifies that cart remains intact and stock is not deducted.
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-ivory-50 border border-gold/20 rounded-sm p-6 space-y-6">
                <h2 className="font-serif-display text-xl text-burgundy font-semibold border-b border-gold/15 pb-3">
                  Order Summary ({cartItems.length} items)
                </h2>

                {/* Items List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-16 w-14 object-cover rounded-sm border border-gold/15 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-brown leading-tight line-clamp-1">
                          {item.product_name}
                        </h4>
                        <p className="text-muted-foreground mt-0.5">
                          {item.color} / {item.size} • Qty: {item.quantity}
                        </p>
                        <p className="font-medium text-burgundy mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-gold/15" />

                {/* Coupon Code Section */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-gold/10 border border-gold/30 px-3 py-2 rounded-sm text-xs">
                      <div className="flex items-center gap-2 text-gold-dark font-medium">
                        <Tag className="h-3.5 w-3.5" />
                        <span>Applied: {appliedCoupon.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-brown/60 hover:text-burgundy"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Promo Code (e.g. WELCOME10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="h-9 text-xs bg-ivory border-gold/20 uppercase"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="h-9 text-xs bg-burgundy hover:bg-burgundy-dark text-ivory px-3"
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="bg-gold/15" />

                {/* Pricing totals */}
                <div className="space-y-2 text-xs text-brown">
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
                    <span>
                      {shipping === 0 ? (
                        <strong className="text-emerald-700 font-medium">FREE</strong>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-burgundy pt-3 border-t border-gold/15">
                    <span>Total Amount</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <Button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full bg-burgundy hover:bg-burgundy-dark text-ivory h-12 font-medium tracking-wide rounded-sm group flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>
                    {submitting
                      ? 'Processing Order...'
                      : `Place Order • ${formatPrice(total)}`}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
