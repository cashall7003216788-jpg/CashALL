"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, ClipboardCheck, Eye, Loader2 } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pincode: string;
  pickupDate: string;
  pickupTimeSlot: string;
  estimatedPrice: number;
  revisedPrice: number | null;
  status: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const session = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("cashall_admin_session") || "{}")
          : {};
        const token = session?.token || "";

        const res = await fetch("/api/v1/admin/orders", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          const raw = json.data?.orders || json.orders || [];
          const mapped = raw.map((ord: any) => ({
            id: ord.id,
            orderNumber: ord.orderNumber,
            customerName: ord.user?.name || "—",
            customerPhone: ord.user?.phone || "—",
            pincode: ord.address?.pincode || "—",
            pickupDate: ord.pickupDate || "—",
            pickupTimeSlot: ord.pickupTimeSlot || "—",
            estimatedPrice: ord.quote?.estimatedPrice ?? 0,
            revisedPrice: ord.finalPrice ?? null,
            status: ord.status,
            identityStatus: ord.identityVerifications?.[0]?.status || "PENDING",
            imeiStatus: ord.imeiVerifications?.[0]?.status || "PENDING",
            esignStatus: ord.signatures?.some((s: any) => s.status === "ESIGNED") ? "SIGNED" : "PENDING",
            paymentStatus: ord.payments?.[0]?.status || "PENDING",
            deviceStatus: ["DEVICE_RECEIVED", "BILL_GENERATED", "COMPLETED"].includes(ord.status) ? "RECEIVED" : "NOT RECEIVED",
          }));
          setOrders(mapped);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData?.error || `Failed to load orders (${res.status})`);
          setOrders([]);
        }
      } catch (err: any) {
        setError(err?.message || "Network error loading orders.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-brand-black">Order Operations Repository</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Full view of all customer selling orders, pickup dates, identity verification, and payment controls
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium overflow-x-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-brand-yellow" />
              <span className="ml-2 text-xs text-brand-muted font-semibold">Loading orders...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl font-semibold">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-16 text-brand-muted">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-bold">No orders yet</p>
              <p className="text-xs mt-1">Customer orders will appear here once they schedule a pickup.</p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Valuation</th>
                  <th className="p-3">Verification Breakdown</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-extrabold text-brand-black">{ord.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-brand-black">{ord.customerName}</div>
                      <div className="text-[11px] text-brand-muted">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3 font-semibold text-brand-black">{ord.pincode}</td>
                    <td className="p-3 font-bold font-price text-brand-black">
                      ₹{(ord.revisedPrice || ord.estimatedPrice).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${ord.identityStatus === "VERIFIED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          ID: {ord.identityStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${ord.imeiStatus === "CLEAR" || ord.imeiStatus === "VERIFIED" ? "bg-green-100 text-green-800" : ord.imeiStatus === "FLAGGED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                          IMEI: {ord.imeiStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${ord.esignStatus === "SIGNED" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                          eSign: {ord.esignStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${ord.paymentStatus === "PAID" || ord.paymentStatus === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          Payment: {ord.paymentStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${ord.deviceStatus === "RECEIVED" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                          Device: {ord.deviceStatus}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="yellow">{ord.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/track/${ord.orderNumber}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </Link>
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
          )}
        </div>
      </main>
    </div>
  );
}
