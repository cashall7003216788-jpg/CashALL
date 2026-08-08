"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  ShoppingBag,
  Truck,
  ClipboardCheck,
  Banknote,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  todayQuotes: number;
  todayOrders: number;
  pickupsToday: number;
  pendingInspections: number;
  pendingPayments: number;
  completedSales: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  pickupTimeSlot: string;
  estimatedPrice: number;
  revisedPrice: number | null;
  status: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/v1/admin/dashboard", {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const data = await res.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = stats
    ? [
        { title: "Today's Quotes", count: stats.todayQuotes, icon: FileText },
        { title: "Today's Orders", count: stats.todayOrders, icon: ShoppingBag },
        { title: "Pickups Today", count: stats.pickupsToday, icon: Truck },
        { title: "Pending Inspections", count: stats.pendingInspections, icon: ClipboardCheck },
        { title: "Pending Payments", count: stats.pendingPayments, icon: Banknote },
        { title: "Completed Sales", count: stats.completedSales, icon: CheckCircle2 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black">Operations Control Center</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Live recommerce metrics, quote conversions, doorstep pickup dispatch, and final valuations
            </p>
          </div>
          <Link
            href="/admin/pricing"
            className="px-4 py-2 bg-brand-yellow text-brand-black text-xs font-extrabold rounded-xl hover:bg-brand-yellowHover shadow-yellowGlow transition-all"
          >
            Manage Pricing Rules
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand-yellow" />
            <span className="ml-2 text-sm text-brand-muted font-semibold">Loading dashboard...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((st) => {
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
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-brand-black" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RECENT ORDERS */}
            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-brand-black">Recent Customer Selling Orders</h2>
                  <p className="text-xs text-brand-muted">Live list of scheduled doorstep pickups and physical inspection states</p>
                </div>
                <Link href="/admin/orders" className="text-xs font-bold text-brand-black hover:underline flex items-center gap-1">
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-12 text-brand-muted text-xs font-semibold">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No orders yet. Orders placed by customers will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Pickup Window</th>
                        <th className="p-3">Valuation</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-brand-black">{ord.orderNumber}</td>
                          <td className="p-3">
                            <div className="font-bold text-brand-black">{ord.customerName}</div>
                            <div className="text-[11px] text-brand-muted">{ord.customerPhone}</div>
                          </td>
                          <td className="p-3 text-gray-500 font-medium">{ord.pickupDate} ({ord.pickupTimeSlot})</td>
                          <td className="p-3 font-bold font-price text-brand-black">
                            ₹{(ord.revisedPrice || ord.estimatedPrice).toLocaleString("en-IN")}
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
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
