"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderData } from "@/lib/store";
import { User, Smartphone, ArrowRight, Clock, UserCheck, Phone } from "lucide-react";
import { cleanDeviceName } from "@/lib/device";

export default function CustomerAccountPage() {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let phoneNum = "";
      const u = localStorage.getItem("cashall_user");
      if (u) {
        try {
          const parsedUser = JSON.parse(u);
          setUser(parsedUser);
          if (parsedUser.phone) phoneNum = parsedUser.phone;
        } catch (e) {
          console.error(e);
        }
      }

      // 1. Load local storage orders first for instant UI response (only this customer's orders)
      let localOrders: OrderData[] = [];
      const all = localStorage.getItem("cashall_all_orders");
      if (all) {
        try {
          const parsed = JSON.parse(all);
          if (Array.isArray(parsed)) {
            // Only include orders that match this customer's phone or have no phone attached
            localOrders = parsed.filter((o: OrderData) => {
              if (!phoneNum) return true;
              const cleanStored = (o.customerPhone || "").replace(/\D/g, "").slice(-10);
              const cleanCurrent = phoneNum.replace(/\D/g, "").slice(-10);
              return !cleanStored || cleanStored === cleanCurrent;
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Auto-sync any local storage orders to PostgreSQL database
      if (localOrders.length > 0) {
        fetch("/api/v1/orders/sync-local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: localOrders }),
        }).catch((err) => console.warn("Auto-sync error:", err));
      }

      // 3. Fetch central PostgreSQL database orders for this user's phone
      if (phoneNum) {
        fetch(`/api/v1/orders/user?phone=${encodeURIComponent(phoneNum)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
              // Merge db orders with local orders without duplicates
              const map = new Map<string, OrderData>();
              data.orders.forEach((o: OrderData) => map.set(o.orderNumber, o));
              localOrders.forEach((o: OrderData) => {
                if (!map.has(o.orderNumber)) map.set(o.orderNumber, o);
              });
              setOrders(Array.from(map.values()));
            } else if (localOrders.length > 0) {
              setOrders(localOrders);
            } else {
              setOrders([]); // Show empty state — never show another customer's order
            }
          })
          .catch(() => {
            if (localOrders.length > 0) setOrders(localOrders);
            else setOrders([]); // Show empty state
          });
      } else if (localOrders.length > 0) {
        setOrders(localOrders);
      } else {
        setOrders([]); // No user + no local data = empty state
      }
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
                        <span>{cleanDeviceName(ord.deviceName || "Apple iPhone 13 (128 GB)")}</span>
                      </div>

                      <div className="text-xs text-brand-muted flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Pickup: {ord.pickupDate} ({ord.pickupTimeSlot})</span>
                        </span>
                      </div>

                      {ord.assignedPartnerName && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-800 rounded-full text-xs font-bold">
                            <UserCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            <span>Executive: {ord.assignedPartnerName}</span>
                          </div>
                          {ord.assignedPartnerPhone && (
                            <a
                              href={`tel:${ord.assignedPartnerPhone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-yellow text-brand-black rounded-full text-xs font-black hover:bg-brand-yellowHover transition-colors shadow-xs"
                              title={`Call ${ord.assignedPartnerName}`}
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call ({ord.assignedPartnerPhone})</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-gray-400 uppercase">Valuation</span>
                        <div className="text-xl font-black text-brand-black font-price">
                          ₹{(ord.revisedPrice || ord.estimatedPrice || 32500).toLocaleString("en-IN")}
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
