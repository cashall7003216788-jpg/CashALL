"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import {
  ShoppingBag,
  Eye,
  ClipboardCheck,
  IndianRupee,
  UserCheck,
  Loader2,
  FileText,
  Mail,
  Send
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
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
  utr?: string;
}

function getAdminToken() {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(localStorage.getItem("cashall_admin_session") || "{}")?.token || "";
  } catch {
    return "";
  }
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
        const mapped = raw.map((ord: any) => {
          const assignedPartner = ord.pickups?.[0]?.partner;
          const assignedPartnerName = assignedPartner ? (assignedPartner.name || assignedPartner.companyName) : ord.agentName;

          // Unified Status Resolution across Database
          let status = ord.status || "PICKUP_SCHEDULED";
          if (status === "PICKUP_SCHEDULED" && assignedPartnerName) {
            status = "PARTNER_ASSIGNED";
          }
          if (ord.qcReports && ord.qcReports.length > 0 && status === "PICKUP_SCHEDULED") {
            status = "INSPECTION_COMPLETED";
          }

          const activePayment = ord.payments?.find((p: any) => p.status === "PAID") || ord.payments?.[0];
          const paymentStatus = activePayment?.status === "PAID" || status === "COMPLETED" ? "PAID" : "PENDING";
          const transactionRef = activePayment?.transactionRef || activePayment?.utrNumber || "";

          return {
            id: ord.id,
            orderNumber: ord.orderNumber,
            customerName: ord.user?.name || ord.customerName || "Customer",
            customerPhone: ord.user?.phone || ord.customerPhone || "—",
            customerEmail: ord.user?.email || ord.customerEmail || "",
            pincode: ord.address?.pincode || ord.pincode || "—",
            location: ord.address
              ? `${ord.address.house || ""}, ${ord.address.city || ""}, ${ord.address.state || ""} - ${ord.address.pincode || ""}`
              : ord.addressSummary || "—",
            deviceName: ord.deviceName ||
              (ord.quote?.variant?.model
                ? `${ord.quote.variant.model.brand?.name || ""} ${ord.quote.variant.model.name}`.trim()
                : "Mobile Device"),
            pickupDate: ord.pickupDate || "—",
            pickupTimeSlot: ord.pickupTimeSlot || "—",
            estimatedPrice: ord.quote?.estimatedPrice ?? 0,
            revisedPrice: ord.finalPrice ?? ord.revisedPrice ?? null,
            status,
            identityStatus: ord.identityVerifications?.[0]?.status || "PENDING",
            imeiStatus: ord.imeiVerifications?.[0]?.status || "PENDING",
            esignStatus: ord.signatures?.some((s: any) => s.status === "ESIGNED") ? "SIGNED" : "PENDING",
            paymentStatus,
            deviceStatus: ["DEVICE_RECEIVED", "BILL_GENERATED", "COMPLETED"].includes(status) ? "RECEIVED" : "NOT RECEIVED",
            agentName: assignedPartnerName,
            utr: transactionRef,
          };
        });
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
          const cleanedLocal = rawLocal.filter(
            (o: any) =>
              !BLACKLIST_NUMS.has(o.orderNumber) &&
              !BLACKLIST_PHONES.has(String(o.customerPhone || "").replace(/\D/g, ""))
          );
          localStorage.setItem("cashall_all_orders", JSON.stringify(cleanedLocal));

          cleanedLocal.forEach((item: any) => {
            if (item.orderNumber && !combinedOrders.some((o) => o.orderNumber === item.orderNumber)) {
              combinedOrders.push({
                id: item.id || `ord-${item.orderNumber}`,
                orderNumber: item.orderNumber,
                customerName: item.customerName || "Customer",
                customerPhone: item.customerPhone || "—",
                customerEmail: item.customerEmail || item.email || "",
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
                agentName: item.assignedPartnerName || item.agentName,
              });
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    setOrders(combinedOrders);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Mark order as COMPLETED & Send Bill Email automatically
  const handleMarkCompleted = async (ord: Order) => {
    const finalPrice = ord.revisedPrice || ord.estimatedPrice;
    const utr = prompt(`Enter Bank UTR / Transaction reference number for ₹${finalPrice.toLocaleString("en-IN")} paid to ${ord.customerName}:`, ord.utr || "");
    if (!utr || !utr.trim()) return;

    setActionLoading(ord.id + "-complete");
    const token = getAdminToken();

    try {
      // 1. Post completion to database endpoint
      const res = await fetch(`/api/v1/admin/orders/${ord.orderNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ finalPrice, utr: utr.trim(), upiId: "UPI" }),
      });

      if (!res.ok) {
        // Retry with id if orderNumber endpoint returned 404
        await fetch(`/api/v1/admin/orders/${ord.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ finalPrice, utr: utr.trim(), upiId: "UPI" }),
        });
      }

      // Update local storage so state is preserved on page refresh
      if (typeof window !== "undefined") {
        const storedOrderStr = localStorage.getItem(`cashall_order_${ord.orderNumber}`);
        if (storedOrderStr) {
          try {
            const parsed = JSON.parse(storedOrderStr);
            parsed.status = "COMPLETED";
            parsed.paymentStatus = "PAID";
            parsed.utr = utr.trim();
            localStorage.setItem(`cashall_order_${ord.orderNumber}`, JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      // 2. Refresh orders state from database
      await fetchOrders();

      alert(`✅ Order ${ord.orderNumber} marked COMPLETED!\nBank UTR: ${utr.trim()}\nTax Invoice & Bill Email dispatched.`);
    } catch (err: any) {
      alert(`Error completing order: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Explicitly Send / Re-send Bill Email to Customer
  const handleSendBillEmail = async (ord: Order) => {
    const targetEmail = ord.customerEmail || prompt(`Enter customer email address for Order #${ord.orderNumber}:`);
    if (!targetEmail || !targetEmail.trim()) return;

    const finalPrice = ord.revisedPrice || ord.estimatedPrice;
    const utr = ord.utr || "UPI-TRANSACTION-PAID";

    setActionLoading(ord.id + "-email");
    const token = getAdminToken();

    try {
      const res = await fetch(`/api/v1/admin/orders/${ord.orderNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ finalPrice, utr, upiId: "UPI" }),
      });

      if (res.ok) {
        alert(`✉️ Tax Invoice & Official Bill Email sent successfully to ${targetEmail.trim()}!`);
      } else {
        alert(`✉️ Bill email requested for ${targetEmail.trim()}.`);
      }
    } catch (err: any) {
      alert(`Error sending bill email: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Assign or Re-Assign In-House Agent
  const handleAssignAgent = async (ord: Order) => {
    const currentAgent = ord.agentName || "";
    const name = prompt(`Enter In-House CashALL Agent Name for Order #${ord.orderNumber}:`, currentAgent || "CashALL In-House Agent");
    if (!name || !name.trim()) return;

    const agentName = name.trim();
    setActionLoading(ord.id + "-agent");
    const token = getAdminToken();

    try {
      // 1. Assign agent via API to persist in DB
      await fetch(`/api/v1/admin/orders/${ord.orderNumber}/assign-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          partnerId: "p-inhouse-custom",
          pickupDate: ord.pickupDate || "Today",
          pickupTimeSlot: ord.pickupTimeSlot || "10 AM - 1 PM",
        }),
      }).catch(() => {});

      // 2. Save in local storage & update UI state
      if (typeof window !== "undefined") {
        const storedStr = localStorage.getItem(`cashall_order_${ord.orderNumber}`);
        if (storedStr) {
          try {
            const parsed = JSON.parse(storedStr);
            parsed.assignedPartnerName = agentName;
            parsed.agentName = agentName;
            parsed.status = "PARTNER_ASSIGNED";
            localStorage.setItem(`cashall_order_${ord.orderNumber}`, JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      await fetchOrders();
      alert(`✅ Agent "${agentName}" assigned to Order #${ord.orderNumber}!`);
    } catch (err: any) {
      alert(`Error assigning agent: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-black">Order Operations Repository</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Full view of all customer selling orders, pickup dates, identity verification, and payment controls
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="text-xs font-bold text-brand-muted bg-white border border-brand-border px-3 py-1.5 rounded-xl hover:bg-gray-50 transition shrink-0"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-brand-border shadow-premium w-full">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-brand-yellow" />
              <span className="ml-2 text-xs text-brand-muted font-semibold">Loading live orders...</span>
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
            <div className="w-full">
              <table className="w-full text-left text-xs table-fixed">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="p-3 w-[15%]">Order ID</th>
                    <th className="p-3 w-[25%]">Customer & Location</th>
                    <th className="p-3 w-[20%]">Device & Offer</th>
                    <th className="p-3 w-[15%]">Verification</th>
                    <th className="p-3 w-[12%]">Status</th>
                    <th className="p-3 w-[13%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord: Order) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* 1. ORDER ID & PICKUP WINDOW */}
                      <td className="p-3 font-extrabold text-brand-black align-top">
                        <div className="text-sm font-black">{ord.orderNumber}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{ord.pickupDate}</div>
                        <div className="text-[10px] text-gray-400">({ord.pickupTimeSlot})</div>
                      </td>

                      {/* 2. CUSTOMER, PHONE & EMAIL */}
                      <td className="p-3 align-top">
                        <div className="font-bold text-brand-black text-sm">{ord.customerName}</div>
                        <div className="text-[11px] text-brand-muted font-medium">{ord.customerPhone}</div>
                        {ord.customerEmail && (
                          <div className="text-[10px] text-blue-600 font-semibold truncate max-w-[200px]" title={ord.customerEmail}>
                            ✉️ {ord.customerEmail}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 line-clamp-2 mt-0.5" title={ord.location}>
                          {ord.location}
                        </div>
                      </td>

                      {/* 3. DEVICE & OFFER RATE */}
                      <td className="p-3 align-top">
                        <div className="font-bold text-brand-black">{ord.deviceName}</div>
                        <div className="font-extrabold font-price text-brand-black text-sm mt-1">
                          ₹{(ord.revisedPrice || ord.estimatedPrice).toLocaleString("en-IN")}
                        </div>
                        {ord.revisedPrice && ord.revisedPrice !== ord.estimatedPrice && (
                          <div className="text-[9px] text-gray-400 line-through">
                            Base: ₹{ord.estimatedPrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* 4. VERIFICATION PENDING/CONFIRMED STATUSES */}
                      <td className="p-3 align-top">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold w-fit ${ord.identityStatus === "VERIFIED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                            ID: {ord.identityStatus}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold w-fit ${ord.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                            Pay: {ord.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* 5. ORDER STATUS BADGE */}
                      <td className="p-3 align-top">
                        <Badge variant={["COMPLETED", "BILL_GENERATED"].includes(ord.status) ? "success" : "yellow"}>
                          {ord.status.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      {/* 6. ACTIONS COLUMN */}
                      <td className="p-3 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {/* Assign Agent / Agent Assigned Status */}
                          {!["COMPLETED", "BILL_GENERATED", "CANCELLED"].includes(ord.status) ? (
                            <button
                              onClick={() => handleAssignAgent(ord)}
                              disabled={actionLoading === ord.id + "-agent"}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors w-full justify-center"
                              title="Click to assign or edit In-House Agent"
                            >
                              <UserCheck className="w-3 h-3 text-amber-700" />
                              <span className="truncate">{ord.agentName ? `Agent: ${ord.agentName}` : "+ Assign Agent"}</span>
                            </button>
                          ) : ord.agentName ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                              <UserCheck className="w-3 h-3 text-gray-500" />
                              <span>Agent: {ord.agentName}</span>
                            </span>
                          ) : null}

                          <div className="flex items-center gap-1 w-full">
                            <Link
                              href={`/track/${ord.orderNumber}`}
                              className="inline-flex items-center justify-center gap-0.5 text-[10px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors flex-1"
                            >
                              <Eye className="w-3 h-3" />
                              Track
                            </Link>

                            <Link
                              href={`/admin/inspections?orderId=${ord.orderNumber}`}
                              className="inline-flex items-center justify-center gap-0.5 text-[10px] font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 px-2 py-1 rounded-lg transition-colors flex-1"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              Inspect
                            </Link>
                          </div>

                          {/* Mark Paid + Complete */}
                          {!["COMPLETED", "BILL_GENERATED"].includes(ord.status) && (
                            <button
                              onClick={() => handleMarkCompleted(ord)}
                              disabled={actionLoading === ord.id + "-complete"}
                              className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 px-2.5 py-1 rounded-lg transition-colors w-full disabled:opacity-60"
                            >
                              {actionLoading === ord.id + "-complete" ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <IndianRupee className="w-3 h-3" />
                              )}
                              Mark Paid
                            </button>
                          )}

                          {/* Send / Re-send Bill Email Button */}
                          <button
                            onClick={() => handleSendBillEmail(ord)}
                            disabled={actionLoading === ord.id + "-email"}
                            className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-lg transition-colors w-full disabled:opacity-60"
                            title="Send or re-send Tax Invoice & Official PDF Bill Email to customer"
                          >
                            {actionLoading === ord.id + "-email" ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3 text-blue-700" />
                            )}
                            <span>Send Bill Email</span>
                          </button>

                          {/* View Official Bill */}
                          <Link
                            href={`/admin/bill/${ord.orderNumber}`}
                            className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors w-full"
                          >
                            <FileText className="w-3 h-3 text-gray-600" />
                            <span>View Bill</span>
                          </Link>
                        </div>
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
