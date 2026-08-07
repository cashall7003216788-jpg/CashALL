"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderData, INITIAL_ORDERS } from "@/lib/store";
import { User, Smartphone, ArrowRight, Clock, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";

export default function CustomerAccountPage() {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("cashall_user");
      if (u) {
        try {
          setUser(JSON.parse(u));
        } catch (e) {
          console.error(e);
        }
      }

      const all = localStorage.getItem("cashall_all_orders");
      if (all) {
        try {
          setOrders(JSON.parse(all));
          return;
        } catch (e) {
          console.error(e);
        }
      }

      // Default initial orders fallback
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* PROFILE WELCOME CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-yellow text-brand-black flex items-center justify-center font-extrabold shadow-yellowGlow shrink-0">
              <User className="w-7 h-7 text-brand-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-black">
                Hello, {user?.name || "CashALL Seller"}!
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                {user?.phone ? `Mobile: ${user.phone}` : "Manage your device sales, orders, and pickups"}
              </p>
            </div>
          </div>

          {/* ORDERS LIST */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-brand-black">
              My Device Orders
            </h2>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard hover:shadow-premium transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="yellow">ORDER #{ord.orderNumber}</Badge>
                        <Badge variant="neutral">{ord.status.replace(/_/g, " ")}</Badge>
                      </div>

                      <div className="text-base font-black text-brand-black flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-brand-yellow" />
                        <span>iPhone 15 (128GB)</span>
                      </div>

                      <div className="text-xs text-brand-muted flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Pickup: {ord.pickupDate} ({ord.pickupTimeSlot})</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-gray-400 uppercase">Valuation</span>
                        <div className="text-xl font-black text-brand-black font-price">
                          ₹{(ord.revisedPrice || 31400).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <Link href={`/track/${ord.orderNumber}`}>
                        <Button variant="primary" size="sm" className="font-extrabold gap-1.5 shadow-yellowGlow">
                          <span>Track Order</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-brand-border">
                <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-brand-black">You haven&apos;t sold a device yet.</h3>
                <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                  Find out what your old phone is worth and schedule a fast doorstep pickup in 3 simple steps.
                </p>
                <Link href="/sell/mobile" className="inline-block mt-4">
                  <Button variant="primary" size="md" className="font-extrabold shadow-yellowGlow">
                    Sell A Phone Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
