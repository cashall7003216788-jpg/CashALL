"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Phone,
  MapPin,
  Smartphone,
  Calendar,
  IndianRupee,
  Upload,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  FileCheck,
  Sparkles,
  AlertCircle,
  ClipboardCheck,
  CreditCard,
  Barcode,
  Ban,
  XCircle,
  ListChecks,
} from "lucide-react";
import { CustomerAnswersModal } from "@/components/admin/CustomerAnswersModal";

interface AgentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pincode: string;
  address: string;
  deviceName: string;
  imeiNumber?: string;
  pickupDate: string;
  pickupTimeSlot: string;
  amount: number;
  finalPrice?: number;
  estimatedPrice?: number;
  status: string;
  paymentStatus: string;
  urn?: string | null;
  paymentScreenshotUrl?: string | null;
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const [agentSession, setAgentSession] = useState<any>(null);
  const [orders, setOrders] = useState<AgentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [selectedOrderForAnswers, setSelectedOrderForAnswers] = useState<any | null>(null);

  // Check agent login session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cashall_agent_session");
      if (!saved) {
        router.replace("/agent/login");
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        setAgentSession(parsed.agent || { name: "Field Agent" });
      } catch (e) {
        router.replace("/agent/login");
      }
    }
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const agentId = agentSession?.id || "";
      const phone = agentSession?.phone || "";
      const name = encodeURIComponent(agentSession?.name || "");
      const res = await fetch(`/api/v1/agent/orders?agentId=${agentId}&phone=${phone}&name=${name}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.orders)) {
        setOrders(json.orders);
      }
    } catch (err: any) {
      console.error("Error loading agent orders:", err);
    } finally {
      setLoading(false);
    }
  }, [agentSession]);

  useEffect(() => {
    if (agentSession) {
      fetchOrders();
    }
  }, [agentSession, fetchOrders]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cashall_agent_session");
    }
    router.replace("/agent/login");
  };

  // OCR Extraction with Tesseract.js & Upload Handler
  const handleFileUpload = async (ord: AgentOrder, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOrderId(ord.id);
    setOcrStatus("🔍 Scanning screenshot with Tesseract.js OCR...");
    setNotification(null);

    let extractedUrn = "";

    try {
      try {
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng");
        const ret = await worker.recognize(file);
        await worker.terminate();

        const recognizedText = ret.data.text || "";
        console.log("OCR Recognized Text:", recognizedText);

        // Robust 12-Digit UPI / UTR / Transaction ID Extraction
        const extractUtr = (text: string): string => {
          if (!text) return "";
          const labelMatch = text.match(/(?:UPI\s*Ref(?:\s*No)?|UTR(?:\s*No)?|Txn\s*ID|Transaction\s*ID|Ref\s*No|Order\s*ID|Reference(?:\s*No)?)[:\s-]*([0-9\s-]{12,20})/i);
          if (labelMatch && labelMatch[1]) {
            const digits = labelMatch[1].replace(/\D/g, "");
            if (digits.length >= 12) return digits.substring(0, 12);
          }
          const directMatch = text.match(/\b\d{12}\b/);
          if (directMatch) return directMatch[0];
          const spacedMatch = text.match(/\b\d{3,6}[\s-]+\d{3,6}[\s-]+\d{3,6}\b/);
          if (spacedMatch) {
            const digits = spacedMatch[0].replace(/\D/g, "");
            if (digits.length === 12) return digits;
          }
          for (const line of text.split('\n')) {
            const d = line.replace(/\D/g, "");
            if (d.length === 12) return d;
          }
          return "";
        };

        extractedUrn = extractUtr(recognizedText);

        if (extractedUrn) {
          setOcrStatus(`✨ Auto-Extracted 12-Digit UTR: ${extractedUrn}`);
        } else {
          setOcrStatus("⚠️ OCR could not detect 12 digits automatically. Saving screenshot...");
        }
      } catch (ocrErr) {
        console.warn("Tesseract.js OCR fallback notice:", ocrErr);
        setOcrStatus("Uploading payment screenshot...");
      }

      if (!extractedUrn) {
        const manualInput = prompt(
          `Enter 12-Digit URN / Bank UTR / Transaction ID for Order #${ord.orderNumber}:`,
          ord.urn || ""
        );
        if (manualInput) extractedUrn = manualInput.trim();
      }

      setOcrStatus("Saving payment screenshot & locking UTR in database...");

      const bodyFormData = new FormData();
      bodyFormData.append("orderId", ord.orderNumber);
      bodyFormData.append("file", file);
      if (extractedUrn) bodyFormData.append("urn", extractedUrn);
      if (agentSession?.id) bodyFormData.append("agentId", agentSession.id);
      if (agentSession?.name) bodyFormData.append("agentName", agentSession.name);

      const res = await fetch("/api/v1/agent/upload-payment", {
        method: "POST",
        body: bodyFormData,
      });

      const json = await res.json();

      if (json.success) {
        const finalUrn = json.urn || extractedUrn;
        setOrders((prev) =>
          prev.map((item) =>
            item.id === ord.id || item.orderNumber === ord.orderNumber
              ? { ...item, urn: finalUrn || item.urn, paymentScreenshotUrl: json.order?.paymentScreenshotUrl || item.paymentScreenshotUrl }
              : item
          )
        );
        setNotification({
          type: "success",
          msg: finalUrn
            ? `⚡ Auto-Scanned UTR: ${finalUrn}!\nPayment record locked. Click 'Mark Paid' to complete transaction and dispatch official invoice.`
            : `✅ Payment Screenshot Uploaded!\nClick 'Mark Paid' to complete transaction.`,
        });
        await fetchOrders();
      } else {
        setNotification({
          type: "error",
          msg: json.error || "Upload failed. Please try again.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: err.message || "An error occurred while processing payment.",
      });
    } finally {
      setUploadingOrderId(null);
      setOcrStatus("");
    }
  };

  // Mark Paid & Complete Order Handler (Instant 1-Click completion)
  const handleMarkPaid = async (ord: AgentOrder) => {
    const finalPrice = ord.finalPrice || ord.amount || ord.estimatedPrice || 0;
    const rawUrn = ord.urn?.trim() || "";
    // If OCR extracted URN from uploaded screenshot, use it; otherwise leave blank ("")
    const finalUtr = rawUrn && !rawUrn.startsWith("PAID-") && rawUrn !== "128158907549" && rawUrn !== "623480124575" ? rawUrn : "";

    setActionLoading(ord.id + "-paid");
    try {
      const res = await fetch(`/api/v1/agent/orders/${ord.orderNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalPrice,
          utr: finalUtr,
          agentName: agentSession?.name || "Field Agent",
        }),
      });

      const json = await res.json();

      if (json.success) {
        setOrders((prev) =>
          prev.map((item) =>
            item.id === ord.id || item.orderNumber === ord.orderNumber
              ? { ...item, status: "COMPLETED", paymentStatus: "PAID", urn: finalUtr || null }
              : item
          )
        );

        // Update local storage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`cashall_order_${ord.orderNumber}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.status = "COMPLETED";
              parsed.paymentStatus = "PAID";
              parsed.utr = finalUtr || null;
              localStorage.setItem(`cashall_order_${ord.orderNumber}`, JSON.stringify(parsed));
            } catch (e) {}
          }
        }

        setNotification({
          type: "success",
          msg: `🎉 Order #${ord.orderNumber} Completed & Paid!\n• Payout: ₹${finalPrice.toLocaleString("en-IN")}\n• Official Tax Invoice PDF emailed to customer!${finalUtr ? `\n• Verified UTR: ${finalUtr}` : ""}`,
        });

        await fetchOrders();
      } else {
        setNotification({
          type: "error",
          msg: json.error || "Failed to mark order as paid.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: `Error completing order: ${err.message}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Agent: Mark as Customer Rejected Offer / Cancel Order
  const handleCustomerRejectedOffer = async (ord: AgentOrder) => {
    const reason = prompt(
      `Mark Order #${ord.orderNumber} as Customer Rejected Offer / Cancelled? Enter reason:`,
      "Customer rejected doorstep inspection revised price"
    );
    if (reason === null) return;

    setActionLoading(ord.id + "-reject");
    try {
      const res = await fetch(`/api/v1/orders/${ord.orderNumber}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (typeof window !== "undefined") {
          const storedStr = localStorage.getItem(`cashall_order_${ord.orderNumber}`);
          if (storedStr) {
            try {
              const parsed = JSON.parse(storedStr);
              parsed.status = "CANCELLED";
              localStorage.setItem(`cashall_order_${ord.orderNumber}`, JSON.stringify(parsed));
            } catch (e) {}
          }
        }

        setNotification({
          type: "success",
          msg: `🛑 Order #${ord.orderNumber} marked as CANCELLED (Customer Rejected Offer). Doorstep pickup closed.`,
        });

        await fetchOrders();
      } else {
        setNotification({
          type: "error",
          msg: json.error || "Failed to cancel order.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: `Error cancelling order: ${err.message}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* NAVBAR */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="CashALL Logo"
              width={110}
              height={30}
              className="h-6 sm:h-8 w-auto object-contain"
              priority
            />
          </Link>
          <span className="bg-yellow-400/20 text-yellow-400 text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md uppercase border border-yellow-400/30">
            Agent Console
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-xl text-xs">
            <UserCheck className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-white">{agentSession?.name || "Agent"}</span>
            <span className="text-neutral-400 text-[10px]">({agentSession?.phone || ""})</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-red-950/50 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-neutral-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-xl">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-yellow-400 tracking-wide font-price">
              Doorstep Pickup & Payment Console
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Field Agent: <span className="text-white font-bold">{agentSession?.name || "Agent"}</span> • Physical Inspection, Zero-Friction OCR & Instant Bill Dispatch
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-yellowGlow disabled:opacity-60 cursor-pointer"
          >
            <Clock className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Orders
          </button>
        </div>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-2xl ${
              notification.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-700"
                : "bg-red-950/90 text-red-300 border-red-700"
            }`}
          >
            <div className="flex items-center gap-2 whitespace-pre-line">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              )}
              <span>{notification.msg}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* OCR PROCESSING STATUS BAR */}
        {ocrStatus && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold text-yellow-300 animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{ocrStatus}</span>
          </div>
        )}

        {/* ORDERS LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-800">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <span className="text-xs text-neutral-400 font-semibold">Loading assigned doorstep pickups...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-neutral-900 rounded-3xl p-16 text-center border border-neutral-800 space-y-2">
              <Smartphone className="w-12 h-12 mx-auto text-yellow-400 opacity-40" />
              <p className="text-base font-bold text-white">No assigned orders found</p>
              <p className="text-xs text-neutral-400">
                When an admin assigns a pickup order to you, it will appear here instantly.
              </p>
            </div>
          ) : (
            orders.map((ord) => {
              const isCancelled = ord.status === "CANCELLED" || ord.status === "REJECTED";
              const isCompleted = ord.paymentStatus === "PAID" || ord.status === "COMPLETED";
              const isInspectionDone = Boolean(ord.imeiNumber) || ord.status === "ACCEPTED" || isCompleted;
              const payoutVal = ord.finalPrice || ord.amount || ord.estimatedPrice || 0;

              return (
                <div
                  key={ord.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition space-y-5"
                >
                  {/* TOP HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-black text-yellow-400 text-base font-black px-4 py-1.5 rounded-xl border border-yellow-400/20 font-price">
                        #{ord.orderNumber}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-yellow-300 bg-yellow-950/50 border border-yellow-500/40 px-3 py-1.5 rounded-xl">
                        <Calendar className="w-4 h-4 text-yellow-400 shrink-0" />
                        <span>Scheduled Visit: {ord.pickupDate} ({ord.pickupTimeSlot})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider ${
                          isCancelled
                            ? "bg-red-950 text-red-400 border border-red-700"
                            : isCompleted
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                            : isInspectionDone
                            ? "bg-blue-950 text-blue-300 border border-blue-700"
                            : "bg-amber-950 text-yellow-400 border border-yellow-700"
                        }`}
                      >
                        {isCancelled ? "CANCELLED" : isCompleted ? "PAID & COMPLETED" : isInspectionDone ? "INSPECTION COMPLETED" : "PICKUP SCHEDULED"}
                      </span>
                    </div>
                  </div>

                  {/* 3 COLUMN INFO GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CUSTOMER & CONTACT */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Customer & Address
                      </div>
                      <div className="font-bold text-white text-base">{ord.customerName}</div>
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{ord.customerPhone}</span>
                      </a>
                      <div className="flex items-start gap-1.5 text-xs text-neutral-400 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>{ord.address}</span>
                      </div>
                    </div>

                    {/* DEVICE & PAYOUT AMOUNT */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Device Purchased & Valuation
                      </div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Smartphone className="w-4 h-4 text-yellow-400" />
                        <span>{ord.deviceName}</span>
                      </div>

                      {ord.imeiNumber && (
                        <div className="inline-flex items-center gap-1.5 bg-yellow-950/70 border border-yellow-500/60 px-3 py-1 rounded-xl text-xs font-mono font-bold text-yellow-400 shadow-sm">
                          <Barcode className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span>IMEI: {ord.imeiNumber}</span>
                        </div>
                      )}

                      <div className="bg-black/60 p-3 rounded-2xl border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>{isInspectionDone ? "Final Settled Payout:" : "Online Customer Quote:"}</span>
                        </div>
                        <div className="text-xl font-black text-emerald-400 font-price flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          <span>{payoutVal.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* PAYMENT OCR UPLOAD SECTION */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Zero-Friction Payment Verification
                      </div>

                      {(() => {
                        const rawUrn = ord.urn || (ord as any).utr;
                        const hasRealUrn = Boolean(rawUrn && !String(rawUrn).startsWith("PAID-") && rawUrn !== "623480124575");

                        if (hasRealUrn) {
                          return (
                            <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-2xl space-y-1">
                              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                                <FileCheck className="w-4 h-4 text-emerald-400" />
                                <span>12-Digit URN Verified</span>
                              </div>
                              <div className="text-xs font-mono text-yellow-400 font-bold">
                                {rawUrn}
                              </div>
                              <div className="text-[10px] text-emerald-200/70">
                                Google Sheets Synced & PDF Invoice Delivery
                              </div>
                            </div>
                          );
                        }

                        if (isCompleted) {
                          return (
                            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl space-y-1">
                              <div className="flex items-center gap-1.5 text-neutral-300 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Payment Completed</span>
                              </div>
                              <div className="text-xs font-mono text-neutral-400 italic">
                                UTR: — (Left Blank)
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl space-y-2">
                            <div className="text-xs text-neutral-300 font-medium">
                              Upload UPI Payment Screenshot to extract 12-digit URN automatically with Tesseract.js.
                            </div>

                            <label className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-yellowGlow">
                              {uploadingOrderId === ord.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>
                                {uploadingOrderId === ord.id
                                  ? "Scanning OCR..."
                                  : "Upload Payment Screenshot"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(ord, e)}
                                disabled={uploadingOrderId === ord.id}
                                className="hidden"
                              />
                            </label>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS TOOLBAR */}
                  <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                    {/* LEFT BUTTONS: Physical Inspection & Customer Answers */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/agent/orders/${ord.orderNumber}/inspection`}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                          isInspectionDone
                            ? "bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-700"
                            : "bg-yellow-400 hover:bg-yellow-300 text-black font-black shadow-yellowGlow"
                        }`}
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>{isInspectionDone ? "✓ Inspection Done (Edit QC)" : "Physical Inspection"}</span>
                      </Link>

                      <button
                        onClick={() => setSelectedOrderForAnswers(ord)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                        title="View all answers given & skipped by customer to negotiate price"
                      >
                        <ListChecks className="w-4 h-4 text-cyan-400" />
                        <span>View Customer Answers</span>
                      </button>
                    </div>

                    {/* RIGHT BUTTONS: Mark Paid & Customer Rejected */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isCompleted ? (
                        <>
                          <button
                            onClick={() => handleCustomerRejectedOffer(ord)}
                            disabled={actionLoading === ord.id + "-reject"}
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2.5 rounded-xl transition shadow-md disabled:opacity-60 cursor-pointer"
                            title="Customer rejected offer or wants to cancel order"
                          >
                            {actionLoading === ord.id + "-reject" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Ban className="w-4 h-4 text-red-400" />
                            )}
                            <span>Customer Rejected / Cancel</span>
                          </button>

                          <button
                            onClick={() => handleMarkPaid(ord)}
                            disabled={actionLoading === ord.id + "-paid"}
                            className="inline-flex items-center gap-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition shadow-md disabled:opacity-60 cursor-pointer"
                          >
                            {actionLoading === ord.id + "-paid" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            <span>Mark Paid</span>
                          </button>
                        </>
                      ) : isCancelled ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-950/60 border border-red-800 px-4 py-2 rounded-xl">
                          <Ban className="w-4 h-4" />
                          <span>Order Cancelled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-4 py-2 rounded-xl">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Order Completed & Paid</span>
                          </div>
                          <button
                            onClick={() => handleCustomerRejectedOffer(ord)}
                            disabled={actionLoading === ord.id + "-reject"}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 px-3 py-2 rounded-xl transition cursor-pointer"
                            title="Cancel order if marked paid by mistake"
                          >
                            <Ban className="w-3.5 h-3.5 text-red-400" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* CUSTOMER ANSWERS & QC AUDIT MODAL */}
      <CustomerAnswersModal
        isOpen={!!selectedOrderForAnswers}
        onClose={() => setSelectedOrderForAnswers(null)}
        orderOrQuote={selectedOrderForAnswers}
      />
    </div>
  );
}
