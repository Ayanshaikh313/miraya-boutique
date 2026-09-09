'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { ProductCard } from '@/components/store/ProductCard';
import type { ProductRow } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  product_ids?: string[];
  suggested_questions?: string[];
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  'Find me a wedding outfit under ₹5,000',
  'Show me pastel outfits',
  'Something traditional but modern',
  'What should I wear to a festive dinner?',
];

export function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  // Map of loaded ProductRow data by ID
  const [productMap, setProductMap] = useState<Record<string, ProductRow>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for custom "open-ai-chat" event from product page or buttons
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.productId) {
        setCurrentProductId(e.detail.productId);
      }
      if (e.detail?.initialQuery) {
        handleSendMessage(e.detail.initialQuery, e.detail?.productId);
      }
    };

    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, [messages, currentProductId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch product data when new product_ids are received
  const fetchProductsForIds = async (ids: string[]) => {
    const missingIds = ids.filter((id) => !productMap[id]);
    if (missingIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (data) {
        setProductMap((prev) => {
          const updated = { ...prev };
          data.forEach((p) => {
            updated[p.id] = p;
          });
          return updated;
        });
      }
    } catch (err) {
      console.error('Error loading AI product cards:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string, productIdContext?: string | null) => {
    const queryText = (textToSend || inputMsg).trim();
    if (!queryText || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      // Build server request payload
      const payload = {
        message: queryText,
        history: messages.map((m) => ({
          role: m.sender,
          content: m.text,
          product_ids: m.product_ids,
        })),
        currentProductId: productIdContext ?? currentProductId,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await res.json();
      const productIds: string[] = data.product_ids ?? [];

      if (productIds.length > 0) {
        await fetchProductsForIds(productIds);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.message || "I found some recommendations for you.",
        product_ids: productIds,
        suggested_questions: data.suggested_questions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat request error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: "I'm sorry, I encountered an issue accessing the boutique database. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentProductId(null);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-burgundy border-2 border-gold text-ivory shadow-2xl flex items-center justify-center hover:scale-105 transition-transform group animate-bounce-short"
        aria-label="Open MIRĀYA Style Assistant"
      >
        <Sparkles className="h-6 w-6 text-gold group-hover:rotate-12 transition-transform" />
        <span className="sr-only">Open MIRĀYA Style Assistant</span>
      </button>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-brown-dark/60 backdrop-blur-sm flex items-end sm:items-center justify-end p-0 sm:p-4">
          <div className="bg-ivory border border-gold/30 w-full sm:max-w-md h-[92vh] sm:h-[620px] rounded-t-lg sm:rounded-sm flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-burgundy border-b border-gold/30 p-4 text-ivory flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-medium tracking-wide">
                    MIRĀYA Style Assistant
                  </h3>
                  <p className="text-[11px] text-ivory/80">Personal Couture & Fitting Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 text-ivory/70 hover:text-gold transition-colors text-xs"
                    title="Clear Conversation"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-ivory/70 hover:text-ivory transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-ivory-50">
              {/* Welcome Experience */}
              <div className="bg-ivory border border-gold/20 p-4 rounded-sm space-y-2">
                <p className="font-serif-display text-base text-burgundy font-semibold">
                  Namaste 🙏
                </p>
                <p className="text-brown/80 leading-relaxed">
                  I am Mirāya&apos;s personal style assistant. How may I assist your wardrobe search today?
                </p>
              </div>

              {/* Initial Suggestions */}
              {messages.length === 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-medium text-gold-dark uppercase tracking-wider">
                    Suggested Questions
                  </p>
                  <div className="flex flex-col gap-2">
                    {INITIAL_SUGGESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-left bg-ivory border border-gold/20 hover:border-gold/60 p-2.5 rounded-sm text-brown text-xs transition-colors flex items-center justify-between group"
                      >
                        <span>{sug}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gold-dark group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="h-7 w-7 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center shrink-0 border border-burgundy/20 mt-1">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3 rounded-sm leading-relaxed ${
                          isUser
                            ? 'bg-burgundy text-ivory font-light'
                            : 'bg-ivory border border-gold/20 text-brown shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Render Product Cards for Assistant Recommendations */}
                      {!isUser && msg.product_ids && msg.product_ids.length > 0 && (
                        <div className="space-y-2 pt-1 w-full">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-burgundy">
                            Recommended Pieces ({msg.product_ids.length})
                          </p>
                          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {msg.product_ids.map((id) => {
                              const prod = productMap[id];
                              if (!prod) {
                                return (
                                  <div
                                    key={id}
                                    className="p-3 bg-ivory-200 animate-pulse rounded-sm text-[11px] text-muted-foreground"
                                  >
                                    Loading product card...
                                  </div>
                                );
                              }
                              return <ProductCard key={id} product={prod} />;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Suggested Follow-up Questions */}
                      {!isUser && msg.suggested_questions && msg.suggested_questions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggested_questions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSendMessage(q)}
                              className="bg-ivory border border-gold/30 hover:bg-gold/10 px-2 py-1 rounded-sm text-[11px] text-brown-light transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-[10px] text-muted-foreground block px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Loading Dots Indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-gold-dark text-xs py-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Searching MIRĀYA database...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 bg-ivory border-t border-gold/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Ask Mirāya about outfits, sizes, or stock..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  disabled={loading}
                  className="bg-ivory-50 border-gold/30 text-brown text-xs placeholder:text-muted-foreground focus:border-burgundy"
                />
                <Button
                  type="submit"
                  disabled={loading || !inputMsg.trim()}
                  className="bg-burgundy hover:bg-burgundy-dark text-ivory shrink-0 h-9 w-9 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
