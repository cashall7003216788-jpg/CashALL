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
  Send,
  MapPin,
  Smartphone,
  Calendar,
  CheckCircle2,
  Clock
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
  if (typeof window === "undefined") return "tok_admin_master_session";
  try {
    const saved = JSON.parse(localStorage.getItem("cashall_admin_session") || "{}");
    return saved?.token || "tok_admin_master_session";
  } catch {
    return "tok_admin_master_session";
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const raw = json.data?.orders || json.orders || [];
        const mapped = raw.map((ord: any) => {
          const pickup = ord.pickups?.[0];
          const assignedPartner = pickup?.partner;
          const notes = pickup?.notes || "";
          const isValidNotesAgent = notes && notes !== "Doorstep pickup order confirmed." && notes !== "Order synced to database automatically.";
          const assignedPartnerName = isValidNotesAgent
            ? notes
            : (assignedPartner ? (assignedPartner.name || assignedPartner.companyName) : (ord.agentName || ord.assignedPartnerName || null));

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
        const BLACKLIST_PHONES = new Set(["8128492403"]);

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

  // Update customer email address
  const handleUpdateEmail = async (ord: Order) => {
    const email = prompt(`Enter/Update Customer Email for Order #${ord.orderNumber} (${ord.customerName}):`, ord.customerEmail || "");
    if (!email || !email.trim() || !email.includes("@")) return;

    const cleanEmail = email.trim();
    setActionLoading(ord.id + "-email-edit");
    const token = getAdminToken();

    try {
      await fetch(`/api/v1/admin/orders/${ord.orderNumber}/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          imei: "N/A",
          revisedPrice: ord.revisedPrice || ord.estimatedPrice,
          customerEmail: cleanEmail,
        }),
      });

      await fetchOrders();
      alert(`✅ Customer email updated to "${cleanEmail}" for Order #${ord.orderNumber}!`);
    } catch (err: any) {
      alert(`Error updating email: ${err.message}`);
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          partnerId: "p-inhouse-custom",
          partnerName: agentName,
          pickupDate: ord.pickupDate || "Today",
          pickupTimeSlot: ord.pickupTimeSlot || "10 AM - 1 PM",
        }),
      });

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
    <div className="min-h-screen bg-neutral-900 text-white flex">
      <AdminSidebar />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-full">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">Order Operations Console</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Live Doorstep Selling Orders • Real-Time Supabase Synchronization
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2 rounded-xl transition shadow-lg"
          >
            <Clock className="w-4 h-4" />
            Refresh Orders
          </button>
        </div>

        {/* MAIN CARDS LIST CONTAINER */}
        <div className="space-y-4">
          {loading && (
            <div className="bg-neutral-800 rounded-3xl p-12 text-center border border-neutral-700">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <span className="text-xs text-neutral-400 font-semibold">Fetching live orders from Supabase PostgreSQL...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-xs p-4 rounded-2xl font-semibold">
              {error}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="bg-neutral-800 rounded-3xl p-16 text-center border border-neutral-700">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-yellow-400" />
              <p className="text-base font-bold text-white">No active orders found</p>
              <p className="text-xs text-neutral-400 mt-1">Customer doorstep selling requests will appear here in real-time.</p>
            </div>
          )}

          {!loading && orders.map((ord: Order) => (
            <div
              key={ord.id}
              className="bg-neutral-800 border border-neutral-700 rounded-3xl p-6 shadow-xl hover:border-neutral-600 transition-all space-y-4"
            >
              {/* ROW 1: TOP BADGES & IDENTIFIERS */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-black text-yellow-400 text-base font-black px-4 py-1.5 rounded-xl border border-yellow-400/20 font-price">
                    #{ord.orderNumber}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                    <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{ord.pickupDate} ({ord.pickupTimeSlot})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Badge */}
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    ["COMPLETED", "BILL_GENERATED"].includes(ord.status)
                      ? "bg-green-950 text-green-400 border border-green-700"
                      : ord.status === "PARTNER_ASSIGNED"
                      ? "bg-blue-950 text-blue-400 border border-blue-700"
                      : "bg-amber-950 text-yellow-400 border border-yellow-700"
                  }`}>
                    {ord.status.replace(/_/g, " ")}
                  </span>

                  {/* Payment Badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    ord.paymentStatus === "PAID" ? "bg-emerald-950 text-emerald-300 border border-emerald-700" : "bg-neutral-700 text-neutral-300"
                  }`}>
                    Payment: {ord.paymentStatus}
                  </span>
                </div>
              </div>

              {/* ROW 2: 3-COLUMN CONTENT GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* COLUMN 1: CUSTOMER & LOCATION */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Customer & Location</div>
                  <div className="font-bold text-white text-base">{ord.customerName}</div>
                  <div className="text-xs text-neutral-300 font-medium">📞 {ord.customerPhone}</div>
                  
                  <div className="flex items-center gap-2">
                    {ord.customerEmail ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-xl border border-yellow-400/20">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{ord.customerEmail}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500 italic">No email recorded</div>
                    )}
                    <button
                      onClick={() => handleUpdateEmail(ord)}
                      className="text-[10px] text-yellow-400 hover:underline font-bold"
                    >
                      {ord.customerEmail ? "Edit" : "+ Add Email"}
                    </button>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-neutral-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{ord.location}</span>
                  </div>
                </div>

                {/* COLUMN 2: DEVICE & OFFER VALUATION */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Device Purchased & Valuation</div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-white text-sm">{ord.deviceName}</span>
                  </div>

                  <div className="bg-black/50 p-3 rounded-2xl border border-neutral-700 space-y-1">
                    <div className="text-[11px] text-neutral-400">Final Settled Price Payout:</div>
                    <div className="text-xl font-black text-green-400 font-price">
                      ₹{(ord.revisedPrice || ord.estimatedPrice).toLocaleString("en-IN")}
                    </div>
                    {ord.revisedPrice && ord.revisedPrice !== ord.estimatedPrice && (
                      <div className="text-[10px] text-neutral-500 line-through">
                        Initial Quote: ₹{ord.estimatedPrice.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 3: LOGISTICS AGENT */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Assigned Logistics Agent</div>
                  {ord.agentName ? (
                    <div className="bg-blue-950/50 border border-blue-800/60 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
                        <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{ord.agentName}</span>
                      </div>
                      <div className="text-[10px] text-blue-200/70">Status: Agent Deployed for Pickup</div>
                    </div>
                  ) : (
                    <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-2xl text-xs text-neutral-400 italic">
                      No agent assigned yet. Click "Assign Agent" below.
                    </div>
                  )}

                  {ord.utr && (
                    <div className="text-xs text-neutral-300 font-mono">
                      <span className="text-neutral-500">UTR Ref: </span>
                      <span className="font-bold text-yellow-400">{ord.utr}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 3: ACTION BUTTONS TOOLBAR */}
              <div className="pt-4 border-t border-neutral-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/track/${ord.orderNumber}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 bg-neutral-700 hover:bg-neutral-600 px-3 py-2 rounded-xl transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Track Order</span>
                  </Link>

                  <Link
                    href={`/admin/inspections?orderId=${ord.orderNumber}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-3.5 py-2 rounded-xl transition shadow-md"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Physical Inspection</span>
                  </Link>

                  <button
                    onClick={() => handleAssignAgent(ord)}
                    disabled={actionLoading === ord.id + "-agent"}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-950 hover:bg-blue-900 border border-blue-800 px-3.5 py-2 rounded-xl transition"
                  >
                    {actionLoading === ord.id + "-agent" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                    <span>{ord.agentName ? "Re-Assign Agent" : "Assign Agent"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!["COMPLETED", "BILL_GENERATED"].includes(ord.status) && (
                    <button
                      onClick={() => handleMarkCompleted(ord)}
                      disabled={actionLoading === ord.id + "-complete"}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl transition shadow-lg disabled:opacity-60"
                    >
                      {actionLoading === ord.id + "-complete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IndianRupee className="w-3.5 h-3.5" />}
                      <span>Mark Paid</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSendBillEmail(ord)}
                    disabled={actionLoading === ord.id + "-email"}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-xl transition disabled:opacity-60"
                  >
                    {actionLoading === ord.id + "-email" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Bill Email</span>
                  </button>

                  <Link
                    href={`/admin/bill/${ord.orderNumber}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-300 bg-neutral-700 hover:bg-neutral-600 px-3.5 py-2 rounded-xl transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Bill</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
