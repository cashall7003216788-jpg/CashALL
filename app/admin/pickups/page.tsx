"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_PARTNERS } from "@/lib/store";
import { Truck, Loader2 } from "lucide-react";

interface PickupOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pincode: string;
  pickupDate: string;
  pickupTimeSlot: string;
  status: string;
  assignedPartnerId?: string;
}

export default function AdminPickupsPage() {
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await fetch("/api/v1/admin/orders?status=PICKUP_SCHEDULED,ON_THE_WAY,ASSIGNED");
        if (!res.ok) throw new Error("Failed to load pickups");
        const data = await res.json();
        const raw = data.data?.orders || data.orders || [];
        const mapped = raw.map((ord: any) => ({
          id: ord.id,
          orderNumber: ord.orderNumber,
          customerName: ord.user?.name || "—",
          customerPhone: ord.user?.phone || "—",
          pincode: ord.address?.pincode || "—",
          pickupDate: ord.pickupDate || "—",
          pickupTimeSlot: ord.pickupTimeSlot || "—",
          status: ord.status,
        }));
        setPickups(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to load pickup data");
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-brand-black">Pickup Dispatch & Agent Assignment</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Assign logistics agents, manage pickup date slots and track agent location
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium overflow-x-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-brand-yellow" />
              <span className="ml-2 text-xs text-brand-muted font-semibold">Loading pickups...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl font-semibold">
              {error}
            </div>
          )}

          {!loading && !error && pickups.length === 0 && (
            <div className="text-center py-16 text-brand-muted">
              <Truck className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-bold">No pickups scheduled</p>
              <p className="text-xs mt-1">Scheduled pickup orders will appear here for agent assignment.</p>
            </div>
          )}

          {!loading && !error && pickups.length > 0 && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Area / PIN</th>
                  <th className="p-3">Pickup Window</th>
                  <th className="p-3">Assigned CashALL Executive</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pickups.map((pk) => (
                  <tr key={pk.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-extrabold text-brand-black">{pk.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-brand-black">{pk.customerName}</div>
                      <div className="text-[11px] text-brand-muted">{pk.customerPhone}</div>
                    </td>
                    <td className="p-3 font-medium text-gray-500">{pk.pincode}</td>
                    <td className="p-3 font-semibold text-brand-black">{pk.pickupDate} ({pk.pickupTimeSlot})</td>
                    <td className="p-3">
                      <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none">
                        <option value="">— Unassigned —</option>
                        {INITIAL_PARTNERS.map((part) => (
                          <option key={part.id} value={part.id}>{part.name} ({part.businessName})</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <Badge variant="yellow">{pk.status.replace(/_/g, " ")}</Badge>
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
