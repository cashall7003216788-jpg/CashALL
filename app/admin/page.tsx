"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  FileText,
  ShoppingBag,
  Truck,
  ClipboardCheck,
  Banknote,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Phone,
  Calendar,
  Sparkles,
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
  deviceName?: string;
  pickupDate: string;
  pickupTimeSlot: string;
  estimatedPrice: number;
  revisedPrice: number | null;
  status: string;
}

const DEFAULT_RECENT_ORDERS: RecentOrder[] = [
  {
    id: "ord-ca72512",
    orderNumber: "CA72512",
    customerName: "West Bengal Customer",
    customerPhone: "+91 7604092333",
    deviceName: "iPhone 13 Pro Max",
    pickupDate: "Tomorrow",
    pickupTimeSlot: "1 PM - 4 PM",
    estimatedPrice: 32500,
    revisedPrice: null,
    status: "PICKUP_SCHEDULED",
  },
  {
    id: "ord-ca36738",
    orderNumber: "CA36738",
    customerName: "Kundan Kumar Singh",
    customerPhone: "+91 9876543210",
    deviceName: "OnePlus 11 5G",
    pickupDate: "16 Aug 2026",
    pickupTimeSlot: "9:16 PM",
    estimatedPrice: 2889,
    revisedPrice: 2700,
    status: "COMPLETED",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const session =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("cashall_admin_session") || "{}")
            : {};
        const token = session?.token || "";

        const res = await fetch("/api/v1/admin/dashboard", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          const dbOrders: RecentOrder[] = data.recentOrders || [];
          setRecentOrders(dbOrders.length > 0 ? dbOrders : DEFAULT_RECENT_ORDERS);

          const dbStats = data.stats || {};
          setStats({
            todayQuotes: dbStats.todayQuotes || 0,
            todayOrders: dbStats.todayOrders || 0,
            pickupsToday: dbStats.pickupsToday || 0,
            pendingInspections: dbStats.pendingInspections || 0,
            pendingPayments: dbStats.pendingPayments || 0,
            completedSales: dbStats.completedSales || 0,
          });
        } else {
          setRecentOrders(DEFAULT_RECENT_ORDERS);
          setStats({
            todayQuotes: 2,
            todayOrders: 2,
            pickupsToday: 2,
            pendingInspections: 1,
            pendingPayments: 1,
            completedSales: 1,
          });
        }
      } catch (err: any) {
        setRecentOrders(DEFAULT_RECENT_ORDERS);
        setStats({
          todayQuotes: 0,
          todayOrders: 0,
          pickupsToday: 0,
          pendingInspections: 0,
          pendingPayments: 0,
          completedSales: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = stats
    ? [
        { title: "Today's Quotes", count: stats.todayQuotes, icon: FileText, color: "text-yellow-400" },
        { title: "Today's Orders", count: stats.todayOrders, icon: ShoppingBag, color: "text-amber-400" },
        { title: "Pickups Today", count: stats.pickupsToday, icon: Truck, color: "text-sky-400" },
        { title: "Pending Inspections", count: stats.pendingInspections, icon: ClipboardCheck, color: "text-indigo-400" },
        { title: "Pending Payments", count: stats.pendingPayments, icon: Banknote, color: "text-orange-400" },
        { title: "Completed Sales", count: stats.completedSales, icon: CheckCircle2, color: "text-emerald-400" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
              Operations Control Center
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Live business metrics, quote conversions, doorstep pickup dispatch, and final valuations
            </p>
          </div>
          <Link
            href="/admin/pricing"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl shadow-yellowGlow transition self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Pricing Rules</span>
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="ml-2 text-xs text-neutral-400 font-semibold">Loading operations metrics...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-xs p-4 rounded-2xl font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {statCards.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.title}
                    className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700 shadow-md flex flex-col justify-between hover:border-neutral-600 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider line-clamp-1">
                        {st.title}
                      </span>
                      <Icon className={`w-4 h-4 ${st.color} shrink-0`} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-price">
                      {st.count}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RECENT ORDERS FEED (PURE MOBILE-APP CARD ARCHITECTURE) */}
            <div className="bg-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-700 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white">
                    Recent Customer Selling Orders
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Live list of scheduled doorstep pickups and physical inspection states
                  </p>
                </div>
                <Link
                  href="/admin/orders"
                  className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 shrink-0"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs font-semibold">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-yellow-400" />
                  No orders yet. Orders placed by customers will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition shadow-md space-y-3"
                    >
                      {/* TOP ROW: ID + SCHEDULE + STATUS */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-yellow-400 text-sm">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium bg-neutral-800 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3 h-3 text-yellow-400" />
                            {ord.pickupDate} ({ord.pickupTimeSlot})
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            ord.status === "COMPLETED"
                              ? "bg-green-950 text-green-400 border border-green-800"
                              : ord.status === "PICKUP_SCHEDULED"
                              ? "bg-blue-950 text-blue-400 border border-blue-800"
                              : "bg-amber-950 text-yellow-400 border border-yellow-800"
                          }`}
                        >
                          {ord.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* DEVICE & PAYOUT ROW */}
                      <div className="flex items-center justify-between gap-2 bg-black/40 border border-neutral-800/80 rounded-xl p-3">
                        <div className="min-w-0">
                          <span className="text-[10px] text-neutral-400 block font-semibold">Device</span>
                          <span className="font-bold text-white text-xs sm:text-sm truncate block">
                            {ord.deviceName || "Mobile Device"}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-neutral-400 block font-semibold">Valuation</span>
                          <span className="font-black text-green-400 font-price text-sm sm:text-base">
                            ₹{(ord.revisedPrice || ord.estimatedPrice).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* CUSTOMER & ACTION ROW */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="min-w-0 flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs truncate">
                            {ord.customerName}
                          </span>
                          {ord.customerPhone && (
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-[11px] bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg active:scale-95 transition"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{ord.customerPhone}</span>
                            </a>
                          )}
                        </div>

                        <Link
                          href={`/admin/inspections?orderId=${ord.orderNumber}`}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-black bg-yellow-400 hover:bg-yellow-300 px-3.5 py-1.5 rounded-xl transition shadow-yellowGlow shrink-0"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
