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
} from "lucide-react";

interface AgentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pincode: string;
  address: string;
  deviceName: string;
  pickupDate: string;
  pickupTimeSlot: string;
  amount: number;
  status: string;
  paymentStatus: string;
  urn?: string;
  paymentScreenshotUrl?: string;
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const [agentSession, setAgentSession] = useState<any>(null);
  const [orders, setOrders] = useState<AgentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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
      // 1. Silent Tesseract.js OCR parsing in background using regex /\b\d{12}\b/
      try {
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng");
        const ret = await worker.recognize(file);
        await worker.terminate();

        const recognizedText = ret.data.text || "";
        console.log("OCR Recognized Text:", recognizedText);

        const match = recognizedText.match(/\b\d{12}\b/);
        if (match && match[0]) {
          extractedUrn = match[0];
          setOcrStatus(`✨ Extracted 12-Digit URN: ${extractedUrn}`);
        } else {
          setOcrStatus("⚠️ OCR could not find 12-digit number automatically. Please verify URN.");
        }
      } catch (ocrErr) {
        console.warn("Tesseract.js OCR fallback notice:", ocrErr);
        setOcrStatus("Processing payment screenshot...");
      }

      // Prompt agent if URN couldn't be automatically matched by OCR
      if (!extractedUrn) {
        const manualInput = prompt(
          `Enter 12-Digit URN / Bank Transaction ID for Order #${ord.orderNumber}:`,
          ""
        );
        if (manualInput) {
          extractedUrn = manualInput.trim();
        }
      }

      setOcrStatus("Uploading payment screenshot & syncing Google Sheets...");

      // 2. Build FormData payload
      const bodyFormData = new FormData();
      bodyFormData.append("orderId", ord.orderNumber);
      bodyFormData.append("file", file);
      bodyFormData.append("urn", extractedUrn);
      if (agentSession?.id) bodyFormData.append("agentId", agentSession.id);
      if (agentSession?.name) bodyFormData.append("agentName", agentSession.name);

      // 3. Post to upload-payment API
      const res = await fetch("/api/v1/agent/upload-payment", {
        method: "POST",
        body: bodyFormData,
      });

      const json = await res.json();

      if (json.success) {
        setNotification({
          type: "success",
          msg: `✅ Payment Uploaded Successfully!\nURN: ${json.urn || extractedUrn || "PAID"}\nGoogle Sheets Synced & PDF Invoice Emailed!`,
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

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* NAVBAR */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="CashALL Logo"
              width={140}
              height={38}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <span className="bg-yellow-400/20 text-yellow-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase border border-yellow-400/30">
            Agent Console
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-xl text-xs">
            <UserCheck className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-white">{agentSession?.name || "Agent"}</span>
            <span className="text-neutral-400 text-[10px]">({agentSession?.phone || ""})</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-red-950/50 px-3 py-2 rounded-xl border border-neutral-700 transition"
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
              Field Agent: <span className="text-white font-bold">{agentSession?.name || "Agent"}</span> • Zero-Friction Tesseract OCR Payment Scanning
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-yellowGlow disabled:opacity-60"
          >
            <Clock className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Orders
          </button>
        </div>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
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
              className="text-xs opacity-70 hover:opacity-100 ml-4"
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
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition space-y-4"
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
                      className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        ord.paymentStatus === "PAID" || ord.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                          : "bg-amber-950 text-yellow-400 border border-yellow-700"
                      }`}
                    >
                      {ord.paymentStatus === "PAID" ? "PAID & COMPLETED" : "PICKUP SCHEDULED"}
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
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Items & Payout Amount
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Smartphone className="w-4 h-4 text-yellow-400" />
                      <span>{ord.deviceName}</span>
                    </div>
                    <div className="bg-black/60 p-3 rounded-2xl border border-neutral-800 space-y-1">
                      <div className="text-[11px] text-neutral-400">Final Settled Payout:</div>
                      <div className="text-xl font-black text-emerald-400 font-price flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>{ord.amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT OCR UPLOAD SECTION */}
                  <div className="space-y-2 flex flex-col justify-between">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Zero-Friction Payment Verification
                    </div>

                    {ord.urn ? (
                      <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-2xl space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          <span>12-Digit URN Verified</span>
                        </div>
                        <div className="text-xs font-mono text-yellow-400 font-bold">
                          {ord.urn}
                        </div>
                        <div className="text-[10px] text-emerald-200/70">
                          Google Sheets Synced & PDF Invoice Emailed
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
