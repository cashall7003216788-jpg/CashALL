"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_ORDERS, OrderData } from "@/lib/store";
import { ShoppingBag, ClipboardCheck, Eye } from "lucide-react";

export default function AdminOrdersPage() {
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

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-brand-black">
            Order Operations Repository
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Full view of all customer selling orders, pickup dates, and payment states
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium overflow-x-auto">
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
                    ₹{(ord.revisedPrice || 31400).toLocaleString("en-IN")}
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
        </div>

      </main>
    </div>
  );
}
