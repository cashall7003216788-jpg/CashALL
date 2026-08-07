"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_ORDERS, OrderData } from "@/lib/store";
import {
  FileText,
  ShoppingBag,
  Truck,
  ClipboardCheck,
  Banknote,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const all = localStorage.getItem("cashall_all_orders");
      if (all) {
        try {
          setOrders(JSON.parse(all));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  const stats = [
    { title: "Today's Quotes", count: 48, icon: FileText, change: "+14%" },
    { title: "Today's Orders", count: orders.length || 12, icon: ShoppingBag, change: "+8%" },
    { title: "Pickups Today", count: 8, icon: Truck, change: "On Schedule" },
    { title: "Pending Inspections", count: 4, icon: ClipboardCheck, change: "Requires Action" },
    { title: "Pending Payments", count: 2, icon: Banknote, change: "Instant UPI" },
    { title: "Completed Sales", count: 184, icon: CheckCircle2, change: "Total Disbursed" },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Operations Control Center
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Live recommerce metrics, quote conversions, doorstep pickup dispatch, and final valuations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/pricing"
              className="px-4 py-2 bg-brand-yellow text-brand-black text-xs font-extrabold rounded-xl hover:bg-brand-yellowHover shadow-yellowGlow transition-all"
            >
              Manage Pricing Rules
            </Link>
          </div>
        </div>

        {/* KPI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.title}
                className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    {st.title}
                  </span>
                  <div className="text-3xl font-black text-brand-black mt-1 font-price">
                    {st.count}
                  </div>
                  <span className="text-[11px] font-semibold text-green-600 mt-1 inline-block">
                    {st.change}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 text-brand-black flex items-center justify-center">
                  <Icon className="w-6 h-6 text-brand-black" />
                </div>
              </div>
            );
          })}
        </div>

        {/* RECENT ORDERS TABLE & QUICK ACTIONS */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-brand-black">
                Recent Customer Selling Orders
              </h2>
              <p className="text-xs text-brand-muted">
                Live list of scheduled doorstep pickups and physical inspection states
              </p>
            </div>

            <Link href="/admin/orders" className="text-xs font-bold text-brand-black hover:underline flex items-center gap-1">
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Device / Storage</th>
                  <th className="p-3">Declared / Revised</th>
                  <th className="p-3">Pickup Window</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-extrabold text-brand-black">{ord.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-brand-black">{ord.customerName}</div>
                      <div className="text-[11px] text-brand-muted">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3 font-semibold text-brand-black">iPhone 15 (128GB)</td>
                    <td className="p-3 font-bold font-price text-brand-black">
                      ₹{(ord.revisedPrice || 31400).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-gray-500 font-medium">
                      {ord.pickupDate} ({ord.pickupTimeSlot})
                    </td>
                    <td className="p-3">
                      <Badge variant="yellow">{ord.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/inspections?orderId=${ord.orderNumber}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-black bg-brand-yellow hover:bg-brand-yellowHover px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
