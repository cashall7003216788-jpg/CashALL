"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { OrderData, INITIAL_VARIANTS, INITIAL_MODELS, INITIAL_BRANDS, INITIAL_ORDERS } from "@/lib/store";
import { CheckCircle2, Calendar, MapPin, Smartphone, ArrowRight, ShieldCheck, Copy, Check } from "lucide-react";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "CA10482";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`cashall_order_${orderId}`) || localStorage.getItem("cashall_latest_order");
      if (stored) {
        try {
          setOrder(JSON.parse(stored));
          return;
        } catch (e) {
          console.error(e);
        }
      }

      if (INITIAL_ORDERS.length > 0) {
        setOrder(INITIAL_ORDERS[0]);
      } else {
        setOrder(null);
      }
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
        <Header />
        <main className="flex-grow py-16 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-4 text-center space-y-6 bg-white rounded-3xl p-8 border border-brand-border shadow-premium">
            <h1 className="text-xl font-black text-brand-black">Order Confirmation Not Available</h1>
            <p className="text-xs text-brand-muted leading-relaxed">
              No active order found for <strong className="text-brand-black">#{orderId}</strong>.
            </p>
            <Link href="/account">
              <Button variant="primary" size="md" fullWidth className="font-extrabold shadow-yellowGlow">
                Go to My Account
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* CONFIRMATION HERO CARD */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-premium text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto border-2 border-green-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 uppercase tracking-wider">
                Pickup Booked Successfully
              </span>
              <h1 className="text-3xl font-black text-brand-black mt-3">
                Doorstep Pickup Confirmed!
              </h1>
              <p className="text-xs text-brand-muted mt-1">
                We have assigned our nearest CashALL doorstep executive for your device inspection.
              </p>
            </div>

            {/* ORDER ID BADGE */}
            <div className="inline-flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-2xl border border-brand-border">
              <span className="text-xs font-bold text-gray-400 uppercase">ORDER ID:</span>
              <span className="text-base font-black text-brand-black">{order.orderNumber}</span>
              <button
                onClick={handleCopyOrderId}
                className="p-1 text-gray-400 hover:text-brand-black transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* SUMMARY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4 border-t border-gray-100">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
                  <Calendar className="w-4 h-4 text-brand-yellow" />
                  <span>Scheduled Pickup Time</span>
                </div>
                <div className="text-sm font-black text-brand-black">
                  {order.pickupDate} ({order.pickupTimeSlot})
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
                  <MapPin className="w-4 h-4 text-brand-yellow" />
                  <span>Pickup Location</span>
                </div>
                <div className="text-xs font-bold text-brand-black line-clamp-2">
                  {order.addressSummary || "Customer Address, New Delhi"}
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/track/${order.orderNumber}`} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full font-black px-8 gap-2 shadow-yellowGlow">
                  <span>TRACK ORDER STATUS</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/account" className="w-full sm:w-auto">
                <Button variant="tertiary" size="lg" className="w-full font-bold">
                  View My Orders
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
