'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { AnnouncementBar, Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatPrice } from '@/lib/queries';
import type { OrderRow, OrderItemRow } from '@/lib/types';

interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, setIsAuthModalOpen } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Protect route: redirect to homepage / auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setIsAuthModalOpen(true);
      router.push('/');
    }
  }, [authLoading, user, router, setIsAuthModalOpen]);

  // Fetch orders for current authenticated user
  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return;
      setLoadingOrders(true);

      try {
        // Query orders strictly filtered by user.id
        const { data: userOrders, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderErr) {
          console.error('Error fetching orders:', orderErr);
          setOrders([]);
        } else if (userOrders && userOrders.length > 0) {
          const ordersWithItems: OrderWithItems[] = [];

          for (const order of userOrders) {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);

            ordersWithItems.push({
              ...order,
              items: (items as OrderItemRow[]) ?? [],
            });
          }

          setOrders(ordersWithItems);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to load order history:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-burgundy border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-brown/60">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar searchQuery="" onSearchChange={() => {}} />

      <main className="bg-ivory min-h-screen py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-gold/20 mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-[0.25em] text-gold-dark font-medium">
                  Customer Portal
                </span>
                <Badge variant="outline" className="border-gold/30 text-burgundy text-[10px] uppercase">
                  {profile?.role || 'Customer'}
                </Badge>
              </div>
              <h1 className="font-serif-display text-4xl text-burgundy font-semibold">
                Welcome, {profile?.full_name || 'Valued Customer'}
              </h1>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                signOut();
                router.push('/');
              }}
              className="border-burgundy/30 text-burgundy hover:bg-burgundy/5 text-xs font-medium tracking-wide self-start md:self-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Sidebar: Profile Details */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-ivory-50 border border-gold/20 rounded-sm p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gold/15">
                  <div className="h-12 w-12 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-serif-display text-xl font-bold">
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif-display text-lg font-semibold text-brown leading-tight">
                      {profile?.full_name || 'Customer Profile'}
                    </h3>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-brown">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gold-dark" /> Email
                    </span>
                    <span className="font-medium text-brown">{user?.email}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-gold-dark" /> Account Role
                    </span>
                    <span className="font-medium capitalize text-burgundy">
                      {profile?.role || 'Customer'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gold-dark" /> Member Since
                    </span>
                    <span className="font-medium">
                      {new Date(user?.created_at || '').toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Policy Badge */}
              <div className="p-4 bg-gold/5 border border-gold/20 rounded-sm text-xs text-brown/70 space-y-1">
                <p className="font-semibold text-burgundy flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-gold-dark" /> Verified Security & Privacy
                </p>
                <p className="font-light leading-relaxed">
                  Your order history and customer details are protected with Supabase Row Level Security.
                </p>
              </div>
            </div>

            {/* Right Column: Order History */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gold/15">
                <h2 className="font-serif-display text-2xl text-burgundy font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order History ({orders.length})
                </h2>
              </div>

              {loadingOrders ? (
                <div className="text-center py-12 bg-ivory-50 border border-gold/15 rounded-sm">
                  <div className="animate-spin h-6 w-6 border-2 border-burgundy border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Loading your order history...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-ivory-50 border border-gold/15 rounded-sm p-6">
                  <ShoppingBag className="h-12 w-12 text-gold-dark/40 mx-auto mb-3" />
                  <h3 className="font-serif-display text-xl text-burgundy font-medium mb-1">
                    No Orders Placed Yet
                  </h3>
                  <p className="text-xs text-brown/60 max-w-xs mx-auto mb-4 font-light">
                    When you place an order, your purchase history and tracking details will appear here.
                  </p>
                  <Link href="/#catalogue">
                    <Button size="sm" className="bg-burgundy hover:bg-burgundy-dark text-ivory">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-ivory-50 border border-gold/20 rounded-sm overflow-hidden shadow-sm"
                    >
                      {/* Order Header */}
                      <div className="bg-burgundy/5 p-4 flex flex-wrap items-center justify-between gap-3 border-b border-gold/15 text-xs">
                        <div className="space-y-1">
                          <p className="font-mono text-sm font-bold text-burgundy">
                            {order.order_number}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              order.status === 'confirmed'
                                ? 'bg-emerald-700 text-ivory'
                                : 'bg-burgundy text-ivory'
                            }
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-bold text-burgundy">
                            {formatPrice(Number(order.total))}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-4 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-gold/10 last:border-0">
                            <div>
                              <p className="font-medium text-brown text-sm">
                                {item.product_name}
                              </p>
                              <p className="text-muted-foreground mt-0.5">
                                SKU: {item.variant_sku} • {item.variant_color} / {item.variant_size} • Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-semibold text-burgundy">
                              {formatPrice(Number(item.line_total))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className="bg-ivory p-3 px-4 border-t border-gold/15 flex flex-wrap justify-between items-center text-xs text-muted-foreground">
                        <span>
                          Shipping to: <strong className="text-brown font-normal">{order.customer_name}</strong> ({order.shipping_address?.city || ''})
                        </span>
                        {order.coupon_code && (
                          <span className="text-gold-dark font-medium">
                            Coupon Applied: {order.coupon_code} (-{formatPrice(Number(order.discount))})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
