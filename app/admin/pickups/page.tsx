"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { DEFAULT_PARTNERS, OrderData } from "@/lib/store";
import { Truck, CheckCircle2, UserCheck, Phone, Building2 } from "lucide-react";

export default function AdminPickupsPage() {
  const [pickups, setPickups] = useState<OrderData[]>([]);
  const [selectedPartnerMap, setSelectedPartnerMap] = useState<Record<string, string>>({});
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const loadAllOrders = () => {
    if (typeof window !== "undefined") {
      const ordersList: OrderData[] = [];
      const seenIds = new Set<string>();

      // Check cashall_latest_order
      const latestRaw = localStorage.getItem("cashall_latest_order");
      if (latestRaw) {
        try {
          const parsed = JSON.parse(latestRaw);
          if (parsed && parsed.orderNumber && parsed.customerName !== "Ananya Roy") {
            ordersList.push(parsed);
            seenIds.add(parsed.orderNumber);
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Scan all localStorage keys for cashall_order_*
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("cashall_order_")) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              const parsed = JSON.parse(val);
              if (parsed && parsed.orderNumber && parsed.customerName !== "Ananya Roy" && !seenIds.has(parsed.orderNumber)) {
                ordersList.push(parsed);
                seenIds.add(parsed.orderNumber);
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      }

      setPickups(ordersList);
    }
  };

  useEffect(() => {
    loadAllOrders();
  }, []);

  const handlePartnerSelect = (orderId: string, partnerId: string) => {
    setSelectedPartnerMap((prev) => ({ ...prev, [orderId]: partnerId }));
  };

  const handleAssignPartner = (order: OrderData) => {
    const partnerId = selectedPartnerMap[order.id] || order.assignedPartnerId;
    if (!partnerId) return;

    const partner = DEFAULT_PARTNERS.find((p) => p.id === partnerId);
    if (!partner) return;

    const updatedOrder: OrderData = {
      ...order,
      assignedPartnerId: partner.id,
      assignedPartnerName: partner.name,
      assignedPartnerPhone: partner.phone,
      assignedPartnerBusiness: partner.businessName,
      status: "PARTNER_ASSIGNED",
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_order_${order.id}`, JSON.stringify(updatedOrder));
      localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updatedOrder));
      localStorage.setItem("cashall_latest_order", JSON.stringify(updatedOrder));
    }

    setDispatchSuccess(`Order #${order.orderNumber} successfully assigned to ${partner.name} (${partner.businessName})!`);
    setTimeout(() => setDispatchSuccess(null), 4000);

    loadAllOrders();
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black flex items-center gap-2">
              <Truck className="w-6 h-6 text-brand-black" />
              <span>Pickup Dispatch & Agent Assignment</span>
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Assign logistics agents to customer orders. Assigned agent details immediately reflect on customer tracking pages.
            </p>
          </div>
        </div>

        {dispatchSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs p-4 rounded-2xl flex items-center gap-2 font-bold shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dispatchSuccess}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium overflow-x-auto">
          {pickups.length === 0 ? (
            <div className="text-center py-16 text-brand-muted">
              <Truck className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-bold">No active customer pickup bookings found</p>
              <p className="text-xs mt-1">Book a buyback order on the website and it will appear here for agent dispatch.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer & Location</th>
                  <th className="p-3">Scheduled Pickup Window</th>
                  <th className="p-3">Assigned Logistics Partner</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pickups.map((pk) => {
                  const currentSelected = selectedPartnerMap[pk.id] || pk.assignedPartnerId || "";
                  const assignedPartnerObj = DEFAULT_PARTNERS.find((p) => p.id === pk.assignedPartnerId);

                  return (
                    <tr key={pk.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-brand-black">
                        <div className="text-sm">{pk.orderNumber}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{pk.declaredConditionSummary}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-brand-black">{pk.customerName}</div>
                        <div className="text-[11px] text-brand-muted">{pk.customerPhone}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">PIN: {pk.pincode}</div>
                      </td>
                      <td className="p-3 font-semibold text-brand-black">
                        <div>{pk.pickupDate}</div>
                        <div className="text-[11px] text-brand-muted">{pk.pickupTimeSlot}</div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <select
                            value={currentSelected}
                            onChange={(e) => handlePartnerSelect(pk.id, e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-black focus:outline-none focus:border-brand-yellow w-full max-w-xs"
                          >
                            <option value="">— Unassigned (Pending Agent) —</option>
                            {DEFAULT_PARTNERS.map((part) => (
                              <option key={part.id} value={part.id}>
                                {part.name} ({part.businessName} • {part.city})
                              </option>
                            ))}
                          </select>

                          {pk.assignedPartnerName && (
                            <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5 pt-0.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{pk.assignedPartnerName} ({pk.assignedPartnerPhone || "+91 9876543210"})</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={pk.status === "PARTNER_ASSIGNED" ? "yellow" : "neutral"}>
                          {pk.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleAssignPartner(pk)}
                          disabled={!currentSelected}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border shadow-sm ${
                            currentSelected
                              ? "bg-brand-yellow text-black border-black hover:bg-yellow-400"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          Assign & Dispatch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
