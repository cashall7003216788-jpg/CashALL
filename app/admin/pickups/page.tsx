"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { DEFAULT_PARTNERS, OrderData } from "@/lib/store";
import { Truck, CheckCircle2, UserCheck, Phone, Building2 } from "lucide-react";

const DEFAULT_PICKUP_ORDERS: OrderData[] = [
  {
    id: "ord-ca72512",
    orderNumber: "CA72512",
    quoteId: "q-caq725120",
    userId: "u-ca72512",
    customerName: "West Bengal Customer",
    customerPhone: "+91 7003216788",
    pincode: "711101",
    addressSummary: "6/6 Kings Road, Howrah, West Bengal - 711101",
    pickupDate: "Tomorrow",
    pickupTimeSlot: "1 PM - 4 PM",
    revisedPrice: undefined,
    status: "PICKUP_SCHEDULED",
    assignedPartnerId: "p-inhouse-kol",
    assignedPartnerName: "CashALL Logistics Team (Kolkata Hub)",
    assignedPartnerPhone: "+91 7003216788",
    assignedPartnerBusiness: "In-House CashALL Logistics",
    declaredConditionSummary: "Apple iPhone 13 128 GB",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ord-ca36738",
    orderNumber: "CA36738",
    quoteId: "q-caq367384",
    userId: "u-ca36738",
    customerName: "Kundan Kumar Singh",
    customerPhone: "+91 9876543210",
    pincode: "834001",
    addressSummary: "Ranchi, Jharkhand",
    pickupDate: "16 Aug 2026",
    pickupTimeSlot: "9:16 PM",
    revisedPrice: 2700,
    status: "COMPLETED",
    assignedPartnerId: "p-rajesh",
    assignedPartnerName: "Rajesh Kumar (CashALL In-House Agent)",
    assignedPartnerPhone: "+91 9876543210",
    assignedPartnerBusiness: "In-House CashALL Agent",
    declaredConditionSummary: "OPPO A33 64 GB - Device Received & Paid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function AdminPickupsPage() {
  const [pickups, setPickups] = useState<OrderData[]>([]);
  const [selectedPartnerMap, setSelectedPartnerMap] = useState<Record<string, string>>({});
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const loadAllOrders = async () => {
    if (typeof window !== "undefined") {
      const ordersList: OrderData[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch DB orders
      try {
        const res = await fetch("/api/v1/admin/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            data.orders.forEach((ord: any) => {
              if (ord.orderNumber && !seenIds.has(ord.orderNumber)) {
                ordersList.push(ord);
                seenIds.add(ord.orderNumber);
              }
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch DB orders in pickups:", e);
      }

      // 2. Check localStorage
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
            } catch (e) {}
          }
        }
      }

      DEFAULT_PICKUP_ORDERS.forEach((def) => {
        if (!seenIds.has(def.orderNumber)) {
          ordersList.push(def);
          seenIds.add(def.orderNumber);
        }
      });

      setPickups(ordersList);
    }
  };

  useEffect(() => {
    loadAllOrders();
  }, []);

  const handleAssignInHouseAgent = (order: OrderData) => {
    const currentAgent = order.assignedPartnerName || "";
    const name = prompt(`Enter In-House CashALL Agent Name for Order #${order.orderNumber}:`, currentAgent || "CashALL In-House Agent");
    if (!name || !name.trim()) return;

    const agentName = name.trim();
    const updatedOrder: OrderData = {
      ...order,
      assignedPartnerId: "p-inhouse-custom",
      assignedPartnerName: `${agentName} (CashALL In-House Agent)`,
      assignedPartnerPhone: "+91 7003216788",
      assignedPartnerBusiness: "In-House CashALL Logistics Agent",
      status: "PARTNER_ASSIGNED",
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_order_${order.id}`, JSON.stringify(updatedOrder));
      localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updatedOrder));
      localStorage.setItem("cashall_latest_order", JSON.stringify(updatedOrder));
      localStorage.setItem(`cashall_agent_${order.orderNumber}`, agentName);
    }

    setDispatchSuccess(`In-House Agent "${agentName}" assigned to Order #${order.orderNumber}!`);
    setTimeout(() => setDispatchSuccess(null), 4000);
    loadAllOrders();
  };

  const handlePartnerSelect = (orderId: string, partnerId: string) => {
    setSelectedPartnerMap((prev) => ({ ...prev, [orderId]: partnerId }));
  };

  const handleAssignPartner = (order: OrderData) => {
    const partnerId = selectedPartnerMap[order.id] || order.assignedPartnerId;
    
    if (!partnerId || partnerId === "inhouse_write_custom") {
      handleAssignInHouseAgent(order);
      return;
    }

    const partner = DEFAULT_PARTNERS.find((p) => p.id === partnerId);
    if (!partner) {
      handleAssignInHouseAgent(order);
      return;
    }

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
                            onChange={(e) => {
                              if (e.target.value === "inhouse_write_custom") {
                                handleAssignInHouseAgent(pk);
                              } else {
                                handlePartnerSelect(pk.id, e.target.value);
                              }
                            }}
                            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-black focus:outline-none focus:border-brand-yellow w-full max-w-xs"
                          >
                            <option value="">— Unassigned (Pending Agent) —</option>
                            <option value="inhouse_write_custom">✏️ In-House Agent (Type Custom Name)</option>
                            {DEFAULT_PARTNERS.map((part) => (
                              <option key={part.id} value={part.id}>
                                {part.name} ({part.businessName} • {part.city})
                              </option>
                            ))}
                          </select>

                          {pk.assignedPartnerName && (
                            <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5 pt-0.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{pk.assignedPartnerName}</span>
                              <button
                                onClick={() => handleAssignInHouseAgent(pk)}
                                className="text-[10px] text-blue-600 underline font-semibold ml-1"
                              >
                                Edit Name
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={pk.status === "PARTNER_ASSIGNED" || pk.status === "COMPLETED" ? "success" : "yellow"}>
                          {pk.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleAssignPartner(pk)}
                          className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all border shadow-sm bg-brand-yellow text-black border-black hover:bg-yellow-400 cursor-pointer shadow-yellowGlow"
                        >
                          {pk.assignedPartnerName ? "Edit / Re-Assign" : "+ Assign Agent"}
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
