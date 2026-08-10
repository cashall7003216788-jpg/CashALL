"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_ORDERS, OrderData } from "@/lib/store";
import { ClipboardCheck, CheckCircle2, ShieldCheck, Save } from "lucide-react";

function AdminInspectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [imei, setImei] = useState("");
  const [screenFinding, setScreenFinding] = useState("Flawless Screen");
  const [bodyFinding, setBodyFinding] = useState("Flawless Body");
  const [revisedPrice, setRevisedPrice] = useState(0);
  const [reason, setReason] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear legacy sample keys from browser localStorage if present
      localStorage.removeItem("cashall_order_CA10482");

      const stored = orderIdParam
        ? localStorage.getItem(`cashall_order_${orderIdParam}`)
        : localStorage.getItem("cashall_latest_order");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.customerName !== "Ananya Roy" && parsed.orderNumber !== "CA10482") {
            setOrder(parsed);
            if (parsed.revisedPrice) setRevisedPrice(parsed.revisedPrice);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      setOrder(null);
    }
  }, [orderIdParam]);

  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const updatedOrder: OrderData = {
      ...order,
      imeiNumber: imei,
      revisedPrice,
      priceDifferenceReason: reason,
      declaredConditionSummary: order.declaredConditionSummary || "Declared: Standard Assessment",
      inspectedConditionSummary: `Inspected: ${screenFinding}, ${bodyFinding}`,
      status: "FINAL_OFFER_PENDING",
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updatedOrder));
      localStorage.setItem("cashall_latest_order", JSON.stringify(updatedOrder));
    }

    setOrder(updatedOrder);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-bg flex">
        <AdminSidebar />

        <main className="flex-grow p-8 overflow-y-auto space-y-8">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Physical Inspection & Price Revision Entry
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Record IMEI, physical condition findings, and submit revised final offers to customers
            </p>
          </div>

          <div className="bg-white rounded-3xl p-12 border border-brand-border shadow-subtleCard text-center space-y-4 max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-brand-yellow/20 rounded-2xl flex items-center justify-center mx-auto text-brand-black">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-brand-black">No Active Order Selected for Inspection</h2>
            <p className="text-xs text-brand-muted leading-relaxed">
              Select an active customer selling order from the Order Management repository to enter physical doorstep inspection findings and issue price revisions.
            </p>
            <Button
              onClick={() => router.push("/admin/orders")}
              variant="primary"
              size="md"
              className="font-extrabold shadow-yellowGlow mt-2"
            >
              Go to Order Operations Repository
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Physical Inspection & Price Revision Entry
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Record IMEI, physical condition findings, and submit revised final offers to customers
            </p>
          </div>

          <Badge variant="yellow">ORDER #{order.orderNumber}</Badge>
        </div>

        {saved && (
          <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-xs text-green-900 flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>Physical inspection recorded! Order updated to FINAL_OFFER_PENDING for customer approval.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* INSPECTION FORM */}
          <form onSubmit={handleSaveInspection} className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6">
            <h2 className="text-base font-extrabold text-brand-black border-b border-gray-100 pb-3">
              Doorstep Inspection Log
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-black mb-1">15-Digit Device IMEI</label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-black mb-1">Screen Inspection Finding</label>
                <select
                  value={screenFinding}
                  onChange={(e) => setScreenFinding(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow font-bold"
                >
                  <option value="Flawless Screen">Flawless Screen (Matches Declaration)</option>
                  <option value="Minor Screen Scratches">Minor Screen Scratches</option>
                  <option value="Heavy Screen Scratches">Heavy Screen Scratches (-₹1,600 diff)</option>
                  <option value="Cracked Glass">Cracked Glass Panel (-₹4,000 diff)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-black mb-1">Body Frame Finding</label>
                <select
                  value={bodyFinding}
                  onChange={(e) => setBodyFinding(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow font-bold"
                >
                  <option value="Flawless Body">Flawless Body</option>
                  <option value="Minor Wear">Minor Paint Wear</option>
                  <option value="Corner Dents">Noticeable Corner Dents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-black mb-1">Revised Final Offer Amount (₹)</label>
                <input
                  type="number"
                  value={revisedPrice}
                  onChange={(e) => setRevisedPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-base font-black font-price bg-white rounded-xl border-2 border-brand-yellow focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">Transparent Price Revision Rationale</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                placeholder="Explain why the physical condition differed from customer declaration..."
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth className="font-extrabold gap-2 shadow-yellowGlow">
              <Save className="w-5 h-5" />
              <span>SUBMIT INSPECTION & NOTIFY CUSTOMER</span>
            </Button>
          </form>

          {/* SIDEBAR SUMMARY */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-3 text-xs">
              <h3 className="font-extrabold text-brand-black border-b border-gray-100 pb-2">Customer Declaration</h3>
              <div className="text-brand-muted">Customer: <strong>{order.customerName}</strong></div>
              <div className="text-brand-muted">Phone: <strong>{order.customerPhone}</strong></div>
              <div className="p-3 bg-gray-50 rounded-xl font-medium text-brand-black">
                {order.declaredConditionSummary || "Declared: Minor Screen Scratches"}
              </div>
            </div>

            <div className="bg-brand-black text-white rounded-3xl p-6 border border-neutral-800 space-y-2 text-xs">
              <div className="text-brand-yellow font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Transparent Protocol</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Customer will receive a live notification to accept or decline the final revised offer on their tracking page.
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default function AdminInspectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-black text-xs font-bold">Loading Inspections...</div>}>
      <AdminInspectionsContent />
    </Suspense>
  );
}
