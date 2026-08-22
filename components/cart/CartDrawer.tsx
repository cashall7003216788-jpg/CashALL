"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  X,
  Trash2,
  ArrowRight,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  CartQuoteItem,
  getCartQuotes,
  removeQuoteFromCart,
  clearCart,
  CART_UPDATED_EVENT,
} from "@/lib/cart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartQuoteItem[]>([]);

  const refreshCart = () => {
    setItems(getCartQuotes());
  };

  useEffect(() => {
    refreshCart();
    if (typeof window !== "undefined") {
      window.addEventListener(CART_UPDATED_EVENT, refreshCart);
      window.addEventListener("storage", refreshCart);
      return () => {
        window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
        window.removeEventListener("storage", refreshCart);
      };
    }
  }, []);

  if (!isOpen) return null;

  const totalValue = items.reduce((acc, item) => acc + (item.estimatedPrice || 0), 0);

  const getDeviceIcon = (category?: string) => {
    const cat = (category || "").toUpperCase();
    if (cat.includes("TABLET") || cat.includes("IPAD")) {
      return <Tablet className="w-5 h-5 text-yellow-400" />;
    }
    if (cat.includes("LAPTOP")) {
      return <Laptop className="w-5 h-5 text-yellow-400" />;
    }
    return <Smartphone className="w-5 h-5 text-yellow-400" />;
  };

  const handleContinueOrder = (item: CartQuoteItem) => {
    onClose();
    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_active_quote", JSON.stringify(item));
    }
    router.push(`/checkout/pickup?quoteId=${item.quoteNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* DRAWER CONTAINER */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-800 text-white shadow-2xl flex flex-col">
          {/* HEADER */}
          <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Saved Quotes Cart</span>
                  <span className="bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Instant Cash Locked • Doorstep Pickup Ready
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CONTENT LIST */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-600">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Your Cart is Empty</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Evaluate any mobile, tablet, or laptop to generate a guaranteed quote ID and add it here.
                  </p>
                </div>
                <Link
                  href="/sell"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-6 py-3 rounded-xl transition shadow-yellowGlow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Device & Get Quote</span>
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.quoteNumber}
                  className="bg-neutral-900/90 rounded-2xl p-4 border border-neutral-800 hover:border-yellow-400/40 transition space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                        {getDeviceIcon(item.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                          {item.quoteNumber}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">
                          {item.brandName} {item.modelName}
                        </h4>
                        <div className="text-xs text-neutral-400">
                          {item.storage ? `Storage: ${item.storage}` : "Assessed Device"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeQuoteFromCart(item.quoteNumber)}
                      className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-neutral-800 transition"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">
                        Instant Valuation
                      </span>
                      <span className="text-lg font-black text-emerald-400 font-price">
                        ₹{item.estimatedPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleContinueOrder(item)}
                      className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-yellowGlow"
                    >
                      <span>Continue Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER TOTAL & ACTIONS */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-neutral-800 bg-neutral-900/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block">Total Locked Valuation</span>
                  <span className="text-2xl font-black text-yellow-400 font-price">
                    ₹{totalValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-right text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Free Doorstep Pickup</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sell"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 py-3 rounded-xl transition border border-neutral-700"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Add More</span>
                </Link>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all saved quotes?")) {
                      clearCart();
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 py-3 rounded-xl transition border border-red-900/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
