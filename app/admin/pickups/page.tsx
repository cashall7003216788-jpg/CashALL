"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DEFAULT_PARTNERS, OrderData } from "@/lib/store";
import { Truck, CheckCircle2, UserCheck, Phone, Building2, Loader2, ArrowRight } from "lucide-react";

function getAdminToken() {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(localStorage.getItem("cashall_admin_session") || "{}")?.token || "";
  } catch {
    return "";
  }
}

export default function AdminPickupsPage() {
  const [pickups, setPickups] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartnerMap, setSelectedPartnerMap] = useState<Record<string, string>>({});
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const loadAllOrders = useCallback(async () => {
    let initialList: OrderData[] = [];
    if (typeof window !== "undefined") {
      try {
        const rawLocal = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
        if (Array.isArray(rawLocal) && rawLocal.length > 0) {
          initialList = rawLocal;
        }
      } catch (e) {}
    }

    if (initialList.length > 0) {
      setPickups(initialList);
      setLoading(false);
    }

    // Database background sync
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/v1/admin/orders?t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data.data?.orders || data.orders || [];
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: OrderData[] = raw.map((ord: any) => {
            const assignedPartner = ord.pickups?.[0]?.partner;
            const assignedPartnerName = assignedPartner
              ? (assignedPartner.name || assignedPartner.companyName)
              : (ord.pickups?.[0]?.notes || ord.agentName || ord.assignedPartnerName);

            let status = ord.status || "PICKUP_SCHEDULED";
            if (status === "PICKUP_SCHEDULED" && assignedPartnerName) {
              status = "PARTNER_ASSIGNED";
            }

            return {
              id: ord.id,
              orderNumber: ord.orderNumber,
              quoteId: ord.quoteId || "",
              userId: ord.userId || "",
              customerName: ord.user?.name || ord.customerName || "Customer",
              customerPhone: ord.user?.phone || ord.customerPhone || "—",
              deviceName: ord.deviceName || "Mobile Device",
              addressSummary: ord.address
                ? `${ord.address.house || ""}, ${ord.address.city || ""}, ${ord.address.state || ""} - ${ord.address.pincode || ""}`
                : ord.addressSummary || "—",
              pincode: ord.address?.pincode || ord.pincode || "700001",
              pickupDate: ord.pickupDate || "Scheduled",
              pickupTimeSlot: ord.pickupTimeSlot || "Standard Slot",
              revisedPrice: ord.finalPrice || ord.revisedPrice || undefined,
              estimatedPrice: ord.quote?.estimatedPrice || ord.estimatedPrice || 0,
              status,
              assignedPartnerName,
              createdAt: ord.createdAt || new Date().toISOString(),
              updatedAt: ord.updatedAt || new Date().toISOString(),
            };
          });

          setPickups(mapped);
        }
      }
    } catch (e) {
      console.warn("Error loading pickup orders:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  const handleAssignInHouseAgent = async (order: OrderData) => {
    const currentAgent = order.assignedPartnerName || "";
    const name = prompt(`Enter In-House CashALL Agent Name for Order #${order.orderNumber}:`, currentAgent || "CashALL In-House Agent");
    if (!name || !name.trim()) return;

    const agentName = name.trim();
    const token = getAdminToken();

    // Call API to persist PARTNER_ASSIGNED in PostgreSQL database
    fetch(`/api/v1/admin/orders/${order.orderNumber}/assign-pickup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        partnerId: "p-inhouse-custom",
        partnerName: agentName,
        pickupDate: order.pickupDate || "Today",
        pickupTimeSlot: order.pickupTimeSlot || "10 AM - 1 PM",
      }),
    }).catch((e) => console.warn("Assign API call warning:", e));

    const updatedOrder: OrderData = {
      ...order,
      assignedPartnerId: "p-inhouse-custom",
      assignedPartnerName: `${agentName} (CashALL In-House Agent)`,
      assignedPartnerPhone: "+91 7604092333",
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
    setTimeout(() => loadAllOrders(), 300);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price flex items-center gap-2">
              <Truck className="w-6 h-6 text-yellow-400" />
              <span>Pickup Dispatch & Agent Assignment</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Assign logistics agents to customer orders. Assigned agent details immediately reflect across database & tracking.
            </p>
          </div>
          <button
            onClick={loadAllOrders}
            className="text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2 rounded-xl transition shadow-lg"
          >
            Refresh List
          </button>
        </div>

        {dispatchSuccess && (
          <div className="bg-green-950 border border-green-800 text-green-300 text-xs p-4 rounded-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>{dispatchSuccess}</span>
          </div>
        )}

        {/* PICKUP ORDERS CONSOLE LIST */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-6 shadow-xl space-y-4">
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <span className="text-xs text-neutral-400">Loading pickup orders...</span>
            </div>
          )}

          {!loading && pickups.length === 0 && (
            <div className="text-center py-12 text-neutral-400 text-xs font-bold">
              No pickup requests found.
            </div>
          )}

          {!loading && pickups.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-900 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-700">
                    <th className="p-3">Order ID & Device</th>
                    <th className="p-3">Customer & Address</th>
                    <th className="p-3">Scheduled Pickup Window</th>
                    <th className="p-3">Assigned Logistics Partner</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {pickups.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-750 transition">
                      <td className="p-3 font-extrabold text-white">
                        <div className="text-sm font-black text-yellow-400 font-price">#{order.orderNumber}</div>
                        <div className="text-xs text-neutral-300 font-semibold">{order.deviceName || "Mobile Device"}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white">{order.customerName}</div>
                        <div className="text-[11px] text-neutral-400">{order.customerPhone}</div>
                        <div className="text-[10px] text-neutral-500 line-clamp-1">{order.addressSummary}</div>
                      </td>

                      <td className="p-3 text-neutral-300 font-medium">
                        <div>{order.pickupDate}</div>
                        <div className="text-[11px] text-neutral-400">{order.pickupTimeSlot}</div>
                      </td>

                      <td className="p-3">
                        {order.assignedPartnerName ? (
                          <div className="bg-blue-950/70 border border-blue-800 p-2.5 rounded-xl space-y-0.5">
                            <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                              <span>{order.assignedPartnerName}</span>
                            </div>
                            <div className="text-[10px] text-blue-200/70">Status: Agent Deployed</div>
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-500 italic">Unassigned (Pending)</div>
                        )}
                      </td>

                      <td className="p-3">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          order.status === "PARTNER_ASSIGNED"
                            ? "bg-blue-950 text-blue-400 border border-blue-700"
                            : "bg-amber-950 text-yellow-400 border border-yellow-700"
                        }`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleAssignInHouseAgent(order)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-3.5 py-1.5 rounded-xl transition shadow-md"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{order.assignedPartnerName ? "Edit Agent" : "Assign Agent"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
