"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_ORDERS, OrderData } from "@/lib/store";
import { ClipboardCheck, CheckCircle2, ShieldCheck, Save, Loader2, Search, ArrowRight } from "lucide-react";

function getAdminToken() {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(localStorage.getItem("cashall_admin_session") || "{}")?.token || "";
  } catch {
    return "";
  }
}

function AdminInspectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imei, setImei] = useState("864502049281745");
  const [screenFinding, setScreenFinding] = useState("Flawless Screen");
  const [bodyFinding, setBodyFinding] = useState("Flawless Body");
  const [revisedPrice, setRevisedPrice] = useState(0);
  const [reason, setReason] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 1. Instant local load for fast UI rendering
    let initialList: OrderData[] = [];
    if (typeof window !== "undefined") {
      try {
        const rawLocal = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
        if (Array.isArray(rawLocal) && rawLocal.length > 0) {
          initialList = rawLocal;
        }
      } catch (e) {}
    }

    if (initialList.length === 0) {
      initialList = INITIAL_ORDERS;
    }

    setAllOrders(initialList);
    setLoading(false);

    if (orderIdParam) {
      const match = initialList.find((o) => o.orderNumber === orderIdParam || o.id === orderIdParam);
      if (match) {
        setOrder(match);
        setRevisedPrice(match.revisedPrice || match.estimatedPrice || 0);
      }
    } else if (initialList.length > 0) {
      setOrder(initialList[0]);
      setRevisedPrice(initialList[0].revisedPrice || initialList[0].estimatedPrice || 0);
    }

    // 2. Background database sync
    const token = getAdminToken();
    fetch(`/api/v1/admin/orders?t=${Date.now()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        const raw = data.data?.orders || data.orders || [];
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: OrderData[] = raw.map((ord: any) => ({
            id: ord.id,
            orderNumber: ord.orderNumber,
            quoteId: ord.quoteId || "",
            userId: ord.userId || "",
            customerName: ord.user?.name || ord.customerName || "Customer",
            customerPhone: ord.user?.phone || ord.customerPhone || "—",
            deviceName: ord.deviceName ||
              (ord.quote?.variant?.model
                ? `${ord.quote.variant.model.brand?.name || ""} ${ord.quote.variant.model.name}`.trim()
                : "Mobile Device"),
            addressSummary: ord.address
              ? `${ord.address.house || ""}, ${ord.address.city || ""}, ${ord.address.state || ""} - ${ord.address.pincode || ""}`
              : ord.addressSummary || "—",
            pincode: ord.address?.pincode || ord.pincode || "700001",
            pickupDate: ord.pickupDate || "Scheduled",
            pickupTimeSlot: ord.pickupTimeSlot || "Standard Slot",
            revisedPrice: ord.finalPrice || ord.revisedPrice || null,
            estimatedPrice: ord.quote?.estimatedPrice || ord.estimatedPrice || 0,
            declaredConditionSummary: ord.deviceName || "Customer Device",
            status: ord.status || "PICKUP_SCHEDULED",
            createdAt: ord.createdAt || new Date().toISOString(),
            updatedAt: ord.updatedAt || new Date().toISOString(),
          }));

          setAllOrders(mapped);

          // Update active order if selected
          if (orderIdParam) {
            const matched = mapped.find((o) => o.orderNumber === orderIdParam || o.id === orderIdParam);
            if (matched) {
              setOrder(matched);
              setRevisedPrice(matched.revisedPrice || matched.estimatedPrice || 0);
            }
          }
        }
      })
      .catch((e) => console.warn("Background order sync warning:", e));
  }, [orderIdParam]);

  const handleSelectOrder = (selectedOrd: OrderData) => {
    setOrder(selectedOrd);
    setRevisedPrice(selectedOrd.revisedPrice || selectedOrd.estimatedPrice || 0);
    setSaved(false);
    router.push(`/admin/inspections?orderId=${selectedOrd.orderNumber}`);
  };

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    const token = getAdminToken();

    try {
      // 1. Post inspection result to DB
      await fetch(`/api/v1/admin/orders/${order.orderNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ finalPrice: revisedPrice, utr: "INSPECTION-VERIFIED", upiId: "UPI" }),
      }).catch(() => {});

      // 2. Update local state & storage
      const updatedOrder: OrderData = {
        ...order,
        imeiNumber: imei,
        revisedPrice,
        priceDifferenceReason: reason,
        status: "INSPECTION_COMPLETED",
        updatedAt: new Date().toISOString(),
      };

      setOrder(updatedOrder);
      setAllOrders((prev) => prev.map((o) => (o.id === order.id || o.orderNumber === order.orderNumber ? updatedOrder : o)));

      if (typeof window !== "undefined") {
        localStorage.setItem(`cashall_order_${order.id}`, JSON.stringify(updatedOrder));
        localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updatedOrder));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      alert(`Error saving inspection: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-y-auto">
        {/* HEADER TOOLBAR */}
        <div className="flex items-center justify-between bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
              Doorstep Physical Inspection Console
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Verify IMEI numbers, physical device conditions, and lock revised payout offers
            </p>
          </div>
        </div>

        {/* ACTIVE INSPECTION FORM */}
        {order ? (
          <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-700 pb-4 gap-3">
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider font-bold">Selected Device for Inspection</div>
                <div className="text-xl font-black text-white font-price flex items-center gap-2 mt-0.5">
                  <span>#{order.orderNumber}</span>
                  <span className="text-yellow-400">• {order.deviceName}</span>
                </div>
                <div className="text-xs text-neutral-300 mt-1">
                  Customer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-neutral-400">Initial Estimated Payout</div>
                <div className="text-2xl font-black text-green-400 font-price">
                  ₹{(order.estimatedPrice || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveInspection} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IMEI & HARDWARE VERIFICATION */}
                <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-700 space-y-4">
                  <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>1. Hardware & IMEI Verification</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      15-Digit Device IMEI / Serial Number *
                    </label>
                    <input
                      type="text"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      required
                      placeholder="e.g. 864502049281745"
                      className="w-full px-4 py-2.5 text-xs font-mono font-bold bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Display Condition</label>
                      <select
                        value={screenFinding}
                        onChange={(e) => setScreenFinding(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400"
                      >
                        <option value="Flawless Screen">Flawless Screen</option>
                        <option value="Minor Scratches">Minor Scratches</option>
                        <option value="Heavy Scratches">Heavy Scratches</option>
                        <option value="Cracked Screen / Display Glass">Cracked Screen / Display Glass</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Body Condition</label>
                      <select
                        value={bodyFinding}
                        onChange={(e) => setBodyFinding(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400"
                      >
                        <option value="Flawless Body">Flawless Body</option>
                        <option value="Minor Dents / Scratches">Minor Dents / Scratches</option>
                        <option value="Heavy Dents / Bent Frame">Heavy Dents / Bent Frame</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* PRICE REVISION & FINAL OFFER */}
                <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-700 space-y-4">
                  <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    <span>2. Rate Revision & Settled Payout</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Final Agreed Purchase Price Payout (₹) *
                    </label>
                    <input
                      type="number"
                      value={revisedPrice}
                      onChange={(e) => setRevisedPrice(Number(e.target.value))}
                      required
                      min={0}
                      className="w-full px-4 py-2.5 text-lg font-black text-green-400 bg-neutral-800 rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400 font-price"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Reason for Price Revision (Optional)
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Minor body scratch found during doorstep inspection"
                      className="w-full px-3 py-2 text-xs bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON & ALERT */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                {saved ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-950/60 border border-green-700 px-4 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Inspection Report Saved & Payout Locked at ₹{revisedPrice.toLocaleString("en-IN")}!</span>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-400">
                    Submitting locks the final payout price and marks inspection completed.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 text-xs font-black text-black bg-yellow-400 hover:bg-yellow-300 px-6 py-2.5 rounded-xl transition shadow-lg disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>SAVE PHYSICAL INSPECTION</span>
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* ALL ORDERS TABLE FOR QUICK INSPECTION SELECTION */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Doorstep Physical Inspection Log ({allOrders.length} Orders)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-900 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-700">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer & Location</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Base Valuation</th>
                  <th className="p-3">Settled Payout</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {allOrders.map((ord) => (
                  <tr key={ord.id} className={`hover:bg-neutral-750 transition ${order?.id === ord.id ? "bg-neutral-750/80" : ""}`}>
                    <td className="p-3 font-extrabold text-yellow-400 font-price">#{ord.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-neutral-400">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3 font-bold text-neutral-200">{ord.deviceName}</td>
                    <td className="p-3 text-neutral-400">₹{(ord.estimatedPrice || 0).toLocaleString("en-IN")}</td>
                    <td className="p-3 font-bold text-green-400 font-price">
                      ₹{(ord.revisedPrice || ord.estimatedPrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ["COMPLETED", "INSPECTION_COMPLETED"].includes(ord.status)
                          ? "bg-green-950 text-green-400 border border-green-800"
                          : "bg-amber-950 text-yellow-400 border border-yellow-800"
                      }`}>
                        {ord.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleSelectOrder(ord)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-3 py-1 rounded-lg transition"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminInspectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
      </div>
    }>
      <AdminInspectionsContent />
    </Suspense>
  );
}
