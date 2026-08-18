"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, ClipboardCheck, Eye, Loader2, Receipt, IndianRupee, UserCheck } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pincode: string;
  location: string;
  deviceName: string;
  pickupDate: string;
  pickupTimeSlot: string;
  estimatedPrice: number;
  revisedPrice: number | null;
  status: string;
  identityStatus: string;
  imeiStatus: string;
  esignStatus: string;
  paymentStatus: string;
  deviceStatus: string;
  agentName?: string;
}



function getAdminToken() {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(localStorage.getItem("cashall_admin_session") || "{}")?.token || "";
  } catch { return ""; }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    let combinedOrders: Order[] = [];

    // 1. Fetch from Database API (Bypass browser GET caching)
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/v1/admin/orders?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Prisma: "no-cache",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json.data?.orders || json.orders || [];
        const mapped = raw.map((ord: any) => ({
          id: ord.id,
          orderNumber: ord.orderNumber,
          customerName: ord.user?.name || "Customer",
          customerPhone: ord.user?.phone || "—",
          pincode: ord.address?.pincode || "—",
          location: ord.address ? `${ord.address.house}, ${ord.address.city}, ${ord.address.state} - ${ord.address.pincode}` : "—",
          // deviceName is pre-resolved by the API from breakdownJson → variant→model chain
          deviceName: ord.deviceName ||
            (ord.quote?.variant?.model
              ? `${ord.quote.variant.model.brand?.name || ""} ${ord.quote.variant.model.name}`.trim()
              : "Mobile Device"),
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
        combinedOrders.push(...mapped);
      }
    } catch (err: any) {
      console.warn("Could not fetch DB orders, falling back to local state:", err);
    }

    // 2. Add local storage orders if present & purge blacklisted test entries
    if (typeof window !== "undefined") {
      try {
        const BLACKLIST_NUMS = new Set(["CA25844", "CA97538", "CA80419"]);
        const BLACKLIST_PHONES = new Set(["6289477287", "8128492403"]);

        const rawLocal = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
        if (Array.isArray(rawLocal) && rawLocal.length > 0) {
          // Clean local storage from blacklisted test entries
          const cleanedLocal = rawLocal.filter(
            (o: any) =>
              !BLACKLIST_NUMS.has(o.orderNumber) &&
              !BLACKLIST_PHONES.has(String(o.customerPhone || "").replace(/\D/g, ""))
          );
          localStorage.setItem("cashall_all_orders", JSON.stringify(cleanedLocal));

          if (cleanedLocal.length > 0) {
            // Auto-push any valid unsynced local orders to PostgreSQL DB
            fetch("/api/v1/orders/sync-local", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orders: cleanedLocal }),
            }).catch((err) => console.warn("Admin auto-sync error:", err));

            cleanedLocal.forEach((item: any) => {
              if (item.orderNumber && !combinedOrders.some((o) => o.orderNumber === item.orderNumber)) {
                combinedOrders.push({
                  id: item.id || `ord-${item.orderNumber}`,
                  orderNumber: item.orderNumber,
                  customerName: item.customerName || "Customer",
                  customerPhone: item.customerPhone || "—",
                  pincode: item.pincode || "—",
                  location: item.addressSummary || "Doorstep Address",
                  deviceName: item.deviceName || "Mobile Device",
                  pickupDate: item.pickupDate || "Scheduled",
                  pickupTimeSlot: item.pickupTimeSlot || "Standard Slot",
                  estimatedPrice: item.revisedPrice || item.estimatedPrice || 0,
                  revisedPrice: item.revisedPrice || null,
                  status: item.status || "PICKUP_SCHEDULED",
                  identityStatus: "PENDING",
                  imeiStatus: "PENDING",
                  esignStatus: "PENDING",
                  paymentStatus: item.status === "COMPLETED" ? "PAID" : "PENDING",
                  deviceStatus: item.status === "COMPLETED" ? "RECEIVED" : "NOT RECEIVED",
                });
              }
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    setOrders(combinedOrders);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Mark order as COMPLETED
  const handleMarkCompleted = async (ord: Order) => {
    const finalPrice = ord.revisedPrice || ord.estimatedPrice;
    const utr = prompt(`Enter UTR / Transaction reference number for ₹${finalPrice.toLocaleString("en-IN")} paid to ${ord.customerName}:`);
    if (!utr) return;
    const upiId = prompt("Enter UPI ID / PhonePe handle used for payment:") || "—";

    setActionLoading(ord.id + "-complete");
    const token = getAdminToken();

    try {
      await fetch(`/api/v1/orders/${ord.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ amount: finalPrice, upiId, utrNumber: utr, isCorporateAccount: true }),
      }).catch(() => {});

      await fetch(`/api/v1/admin/orders/${ord.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ finalPrice, utr, upiId }),
      }).catch(() => {});

      // Local update
      if (typeof window !== "undefined") {
        const updated = orders.map((o) =>
          o.orderNumber === ord.orderNumber
            ? { ...o, status: "COMPLETED", paymentStatus: "PAID", deviceStatus: "RECEIVED", revisedPrice: finalPrice }
            : o
        );
        setOrders(updated);
        localStorage.setItem(`cashall_order_${ord.orderNumber}`, JSON.stringify({ ...ord, status: "COMPLETED" }));
      }

      alert(`✅ Order ${ord.orderNumber} marked COMPLETED! Bill generated.`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignAgent = (ord: Order) => {
    const currentAgent = ord.agentName || "";
    const name = prompt(`Enter In-House CashALL Agent Name for Order #${ord.orderNumber}:`, currentAgent);
    if (name === null) return;

    const trimmed = name.trim();
    const updatedOrders = orders.map((o) =>
      o.id === ord.id ? { ...o, agentName: trimmed } : o
    );
    setOrders(updatedOrders);

    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_agent_${ord.orderNumber}`, trimmed);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-black">Order Operations Repository</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Full view of all customer selling orders, pickup dates, identity verification, and payment controls
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="text-xs font-bold text-brand-muted bg-white border border-brand-border px-3 py-1.5 rounded-xl hover:bg-gray-50 transition"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium overflow-x-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-brand-yellow" />
              <span className="ml-2 text-xs text-brand-muted font-semibold">Loading orders...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl font-semibold mb-4">
              {error}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-16 text-brand-muted">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-bold">No orders yet</p>
              <p className="text-xs mt-1">Customer orders will appear here once they schedule a pickup.</p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer & Location</th>
                  <th className="p-3">Device & Offer</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-extrabold text-brand-black">
                      <div className="text-sm font-black">{ord.orderNumber}</div>
                      <div className="text-[10px] text-gray-400">{ord.pickupDate} ({ord.pickupTimeSlot})</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-brand-black">{ord.customerName}</div>
                      <div className="text-[11px] text-brand-muted">{ord.customerPhone}</div>
                      <div className="text-[10px] text-gray-500 max-w-xs truncate">{ord.location}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-brand-black">{ord.deviceName}</div>
                      <div className="font-bold font-price text-brand-black text-xs mt-0.5">
                        ₹{(ord.revisedPrice || ord.estimatedPrice).toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${ord.identityStatus === "VERIFIED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          ID: {ord.identityStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${ord.paymentStatus === "PAID" || ord.paymentStatus === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          Pay: {ord.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={["COMPLETED", "BILL_GENERATED"].includes(ord.status) ? "success" : "yellow"}>
                        {ord.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Assign In-House Agent (Only on Active/Pending Orders) */}
                        {!["COMPLETED", "BILL_GENERATED", "CANCELLED"].includes(ord.status) ? (
                          <button
                            onClick={() => handleAssignAgent(ord)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                            title="Click to write/edit In-House Agent Name"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                            <span>{ord.agentName ? `Agent: ${ord.agentName}` : "+ Assign Agent"}</span>
                          </button>
                        ) : ord.agentName ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                            <UserCheck className="w-3 h-3 text-gray-500" />
                            <span>Agent: {ord.agentName}</span>
                          </span>
                        ) : null}

                        <Link
                          href={`/track/${ord.orderNumber}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Track
                        </Link>

                        <Link
                          href={`/admin/inspections?orderId=${ord.orderNumber}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Inspect
                        </Link>

                        {/* Mark Paid + Complete */}
                        {!["COMPLETED", "BILL_GENERATED", "PAYMENT_CONFIRMED"].includes(ord.status) && (
                          <button
                            onClick={() => handleMarkCompleted(ord)}
                            disabled={actionLoading === ord.id + "-complete"}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-green-600 hover:bg-green-700 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60"
                          >
                            {actionLoading === ord.id + "-complete" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <IndianRupee className="w-3.5 h-3.5" />
                            )}
                            Mark Paid
                          </button>
                        )}

                        {/* Generate Bill */}
                        <Link
                          href={`/admin/bill/${ord.orderNumber}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Bill
                        </Link>
                      </div>
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
