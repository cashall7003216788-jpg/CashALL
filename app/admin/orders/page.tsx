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
        const res = await fetch("/api/v1/admin/orders");
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
          }));
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
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
            Full view of all customer selling orders, pickup dates, and payment states
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
                  <th className="p-3">Pickup Window</th>
                  <th className="p-3">Valuation</th>
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
                    <td className="p-3 font-semibold text-brand-black">{ord.pincode}</td>
                    <td className="p-3 text-gray-500 font-medium">{ord.pickupDate} ({ord.pickupTimeSlot})</td>
                    <td className="p-3 font-bold font-price text-brand-black">
                      ₹{(ord.revisedPrice || ord.estimatedPrice).toLocaleString("en-IN")}
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
