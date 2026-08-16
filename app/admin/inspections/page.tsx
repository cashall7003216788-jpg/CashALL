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
    const inspectionList = [
      {
        orderNumber: "CA36738",
        customerName: "Kundan Kumar Singh",
        customerPhone: "+91 9876543210",
        location: "Ranchi, Jharkhand",
        deviceName: "OPPO A33 (64 GB)",
        inspector: (typeof window !== "undefined" && localStorage.getItem("cashall_agent_CA36738"))
          ? `${localStorage.getItem("cashall_agent_CA36738")} (CashALL In-House Agent)`
          : "CashALL In-House Agent",
        findings: "Flawless Screen, Minor Paint Wear",
        originalPrice: 2889,
        revisedPrice: 2700,
        status: "COMPLETED",
        date: "16 Aug 2026",
      },
      {
        orderNumber: "CA72512",
        customerName: "West Bengal Customer",
        customerPhone: "+91 7003216788",
        location: "6/6 Kings Road, Howrah, West Bengal",
        deviceName: "Apple iPhone 13 (128 GB)",
        inspector: (typeof window !== "undefined" && localStorage.getItem("cashall_agent_CA72512"))
          ? `${localStorage.getItem("cashall_agent_CA72512")} (CashALL In-House Agent)`
          : "CashALL In-House Agent",
        findings: "Pending Doorstep Inspection",
        originalPrice: 32500,
        revisedPrice: null,
        status: "READY_FOR_INSPECTION",
        date: "Tomorrow (1-4 PM)",
      },
    ];

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
          </div>

          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium space-y-4">
            <h2 className="text-sm font-extrabold text-brand-black border-b border-gray-100 pb-3">
              Doorstep Physical Inspection Log
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer & Location</th>
                    <th className="p-3">Device</th>
                    <th className="p-3">Assigned Inspector</th>
                    <th className="p-3">Inspection Findings</th>
                    <th className="p-3">Valuation</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inspectionList.map((item) => (
                    <tr key={item.orderNumber} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-brand-black">{item.orderNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-brand-black">{item.customerName}</div>
                        <div className="text-[11px] text-brand-muted">{item.customerPhone}</div>
                      </td>
                      <td className="p-3 font-bold text-brand-black">{item.deviceName}</td>
                      <td className="p-3 text-gray-600 font-medium">{item.inspector}</td>
                      <td className="p-3 text-gray-500 font-medium">{item.findings}</td>
                      <td className="p-3 font-bold font-price text-brand-black">
                        {item.revisedPrice ? (
                          <span>
                            <span className="line-through text-gray-400 mr-1 text-[11px]">₹{item.originalPrice.toLocaleString("en-IN")}</span>
                            ₹{item.revisedPrice.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span>₹{item.originalPrice.toLocaleString("en-IN")}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={item.status === "COMPLETED" ? "success" : "yellow"}>
                          {item.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          onClick={() => {
                            setOrder({
                              id: `ord-${item.orderNumber.toLowerCase()}`,
                              orderNumber: item.orderNumber,
                              quoteId: `caq-${item.orderNumber.toLowerCase()}`,
                              userId: `usr-${item.orderNumber.toLowerCase()}`,
                              customerName: item.customerName,
                              customerPhone: item.customerPhone,
                              addressSummary: item.location,
                              pincode: "700001",
                              pickupDate: item.date,
                              pickupTimeSlot: "1 PM - 4 PM",
                              revisedPrice: item.revisedPrice ?? undefined,
                              declaredConditionSummary: item.deviceName,
                              status: item.status,
                              paymentStatus: "PAID",
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            });
                          }}
                          variant="secondary"
                          size="sm"
                          className="font-extrabold"
                        >
                          {item.status === "COMPLETED" ? "View Report" : "Perform Inspection"}
                        </Button>
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
