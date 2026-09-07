"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  FileText,
  Search,
  Filter,
  Navigation,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Eye,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { CustomerAnswersModal } from "@/components/admin/CustomerAnswersModal";

type DateFilterType = "ALL" | "TODAY" | "TOMORROW" | "DAY_AFTER_TOMORROW";
type StatusFilterType = "ALL" | "PENDING" | "COMPLETED" | "CANCELLED";

function getISTDateStrings() {
  const now = new Date();
  const getOffset = (days: number) => {
    const d = new Date(now.getTime() + days * 86400000);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  };

  const getDisplay = (days: number) => {
    const d = new Date(now.getTime() + days * 86400000);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
    }).format(d);
  };

  return {
    today: getOffset(0),
    todayDisplay: getDisplay(0),
    tomorrow: getOffset(1),
    tomorrowDisplay: getDisplay(1),
    dayAfterTomorrow: getOffset(2),
    dayAfterTomorrowDisplay: getDisplay(2),
  };
}

function matchesPickupDate(orderDateStr: string | undefined, targetDateIso: string, isTodayCheck: boolean): boolean {
  if (!orderDateStr) return false;
  const raw = orderDateStr.trim().toLowerCase();

  if (isTodayCheck && (raw === "today" || raw.includes("today"))) return true;
  if (!isTodayCheck && raw.includes("tomorrow") && !raw.includes("day after")) return true;

  if (raw.includes(targetDateIso)) return true;

  try {
    const parsed = new Date(orderDateStr);
    if (!isNaN(parsed.getTime())) {
      const parsedIso = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(parsed);
      if (parsedIso === targetDateIso) return true;
    }
  } catch {}

  return false;
}

function getOrderDateBucket(
  ord: AgentOrder,
  dates: ReturnType<typeof getISTDateStrings>
): "TODAY" | "TOMORROW" | "DAY_AFTER_TOMORROW" | "OTHER" {
  if (matchesPickupDate(ord.pickupDate, dates.today, true)) return "TODAY";
  if (matchesPickupDate(ord.pickupDate, dates.tomorrow, false)) return "TOMORROW";
  if (matchesPickupDate(ord.pickupDate, dates.dayAfterTomorrow, false)) return "DAY_AFTER_TOMORROW";
  return "OTHER";
}

class InHouseBuzzerAlarm {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  public isPlaying: boolean = false;

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. Synthetic Web Audio Siren / Alarm Buzzer (Sawtooth wave with pitch ramp)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        const playBeep = () => {
          if (!this.isPlaying || !this.audioCtx) return;
          try {
            if (this.audioCtx.state === "suspended") {
              this.audioCtx.resume();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(920, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(460, this.audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.85, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.4);
          } catch (e) {}
        };

        playBeep();
        this.intervalId = setInterval(playBeep, 550);
      }
    } catch (e) {
      console.warn("AudioContext error:", e);
    }

    // 2. Hardware Vibration
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([700, 250, 700, 250, 1000]);
        const vInterval = setInterval(() => {
          if (!this.isPlaying) {
            clearInterval(vInterval);
            navigator.vibrate(0);
          } else {
            navigator.vibrate([700, 250, 700, 250, 1000]);
          }
        }, 2500);
      }
    } catch (e) {}

    // 3. Android Native App Bridge (CashAllAgentNative)
    try {
      if (typeof window !== "undefined" && (window as any).CashAllAgentNative?.startAlarm) {
        (window as any).CashAllAgentNative.startAlarm();
      }
    } catch (e) {}
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(0);
      }
    } catch (e) {}

    // Android Native App Bridge Stop
    try {
      if (typeof window !== "undefined" && (window as any).CashAllAgentNative?.stopAlarm) {
        (window as any).CashAllAgentNative.stopAlarm();
      }
    } catch (e) {}
  }
}

const buzzerAlarm = new InHouseBuzzerAlarm();

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
  quotedPrice?: number;
  requotedPrice?: number;
  revisedPrice?: number;
  finalPrice?: number;
  estimatedPrice?: number;
  status: string;
  paymentStatus: string;
  urn?: string | null;
  paymentScreenshotUrl?: string | null;
  cancellationReason?: string | null;
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

  // Dynamic Lead Filters & Search
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilterType>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Real-Time New Lead Alarm & Buzzer
  const [activeAlertLead, setActiveAlertLead] = useState<AgentOrder | null>(null);
  const [isAlarmSounding, setIsAlarmSounding] = useState(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  const dateStrings = useMemo(() => getISTDateStrings(), []);

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
        const session = parsed.agent || { name: "Field Agent" };
        setAgentSession(session);
        // Persist session to Android native bridge for 24/7 background lead monitoring when app is closed
        try {
          if (session?.phone && (window as any).CashAllAgentNative?.saveAgentSession) {
            (window as any).CashAllAgentNative.saveAgentSession(
              session.phone,
              session.name || "",
              session.id || ""
            );
          }
        } catch (e) {}
      } catch (e) {
        router.replace("/agent/login");
      }
    }
  }, [router]);

  const handleTriggerAlarm = useCallback((ord: AgentOrder) => {
    setActiveAlertLead(ord);
    setIsAlarmSounding(true);
    buzzerAlarm.start();

    // Notify Native Android Bridge if running inside CashALL Agent App
    if (typeof window !== "undefined" && (window as any).CashAllAgentNative) {
      try {
        (window as any).CashAllAgentNative.triggerNewLeadAlarm(JSON.stringify(ord));
      } catch (e) {}
    }
  }, []);

  const handleDismissAlarm = useCallback(() => {
    buzzerAlarm.stop();
    setIsAlarmSounding(false);
    setActiveAlertLead(null);
    if (typeof window !== "undefined" && (window as any).CashAllAgentNative) {
      try {
        (window as any).CashAllAgentNative.stopAlarm();
      } catch (e) {}
    }
  }, []);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const agentId = agentSession?.id || "";
      const phone = agentSession?.phone || "";
      const name = encodeURIComponent(agentSession?.name || "");
      const res = await fetch(`/api/v1/agent/orders?agentId=${agentId}&phone=${phone}&name=${name}&t=${Date.now()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.orders)) {
        const fetchedOrders: AgentOrder[] = json.orders;
        setOrders(fetchedOrders);

        // Check for new incoming lead alert
        if (initialLoadDoneRef.current) {
          const newUnseenLead = fetchedOrders.find(
            (o) =>
              !knownOrderIdsRef.current.has(o.id) &&
              !knownOrderIdsRef.current.has(o.orderNumber) &&
              o.status !== "COMPLETED" &&
              o.status !== "CANCELLED"
          );

          if (newUnseenLead) {
            handleTriggerAlarm(newUnseenLead);
          }
        }

        // Update known order IDs
        const updatedSet = new Set<string>();
        for (const o of fetchedOrders) {
          updatedSet.add(o.id);
          updatedSet.add(o.orderNumber);
        }
        knownOrderIdsRef.current = updatedSet;
        initialLoadDoneRef.current = true;
      }
    } catch (err: any) {
      console.error("Error loading agent orders:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [agentSession, handleTriggerAlarm]);

  useEffect(() => {
    if (agentSession) {
      fetchOrders();
    }
  }, [agentSession, fetchOrders]);

  // Background polling every 12 seconds for real-time lead alerts
  useEffect(() => {
    if (!agentSession) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [agentSession, fetchOrders]);

  // Clean up alarm on unmount
  useEffect(() => {
    return () => {
      buzzerAlarm.stop();
    };
  }, []);

  const counts = useMemo(() => {
    let today = 0;
    let tomorrow = 0;
    let dayAfterTomorrow = 0;

    for (const ord of orders) {
      const bucket = getOrderDateBucket(ord, dateStrings);
      if (bucket === "TODAY") today++;
      else if (bucket === "TOMORROW") tomorrow++;
      else if (bucket === "DAY_AFTER_TOMORROW") dayAfterTomorrow++;
    }

    return {
      all: orders.length,
      today,
      tomorrow,
      dayAfterTomorrow,
    };
  }, [orders, dateStrings]);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Date Filter
      if (selectedDateFilter !== "ALL") {
        const bucket = getOrderDateBucket(ord, dateStrings);
        if (bucket !== selectedDateFilter) return false;
      }

      // 2. Status Filter
      if (selectedStatusFilter !== "ALL") {
        const isCancelled = ord.status === "CANCELLED" || ord.status === "REJECTED";
        const isCompleted = ord.paymentStatus === "PAID" || ord.status === "COMPLETED";
        if (selectedStatusFilter === "CANCELLED" && !isCancelled) return false;
        if (selectedStatusFilter === "COMPLETED" && !isCompleted) return false;
        if (selectedStatusFilter === "PENDING" && (isCancelled || isCompleted)) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.customerName.toLowerCase().includes(q) ||
          ord.customerPhone.includes(q) ||
          (ord.customerEmail && ord.customerEmail.toLowerCase().includes(q)) ||
          ord.deviceName.toLowerCase().includes(q) ||
          ord.address.toLowerCase().includes(q) ||
          ord.pincode.includes(q) ||
          (ord.imeiNumber && ord.imeiNumber.includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [orders, selectedDateFilter, selectedStatusFilter, searchQuery, dateStrings]);

  const handleLogout = () => {
    buzzerAlarm.stop();
    try {
      if (typeof window !== "undefined" && (window as any).CashAllAgentNative?.clearAgentSession) {
        (window as any).CashAllAgentNative.clearAgentSession();
      }
    } catch (e) {}
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
      `🛑 Mark Order #${ord.orderNumber} as Customer Rejected / Cancelled?\n\n* Cancellation reason is MANDATORY:`,
      ""
    );
    if (reason === null) return; // Cancelled prompt
    if (!reason.trim()) {
      alert("⚠️ Cancellation reason is mandatory. The order was NOT cancelled.");
      return;
    }

    setActionLoading(ord.id + "-reject");
    try {
      const res = await fetch(`/api/v1/orders/${ord.orderNumber}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (typeof window !== "undefined") {
          const storedStr = localStorage.getItem(`cashall_order_${ord.orderNumber}`);
          if (storedStr) {
            try {
              const parsed = JSON.parse(storedStr);
              parsed.status = "CANCELLED";
              parsed.cancellationReason = reason.trim();
              localStorage.setItem(`cashall_order_${ord.orderNumber}`, JSON.stringify(parsed));
            } catch (e) {}
          }
        }

        setNotification({
          type: "success",
          msg: `🛑 Order #${ord.orderNumber} marked as CANCELLED!\nReason: ${reason.trim()}`,
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

      {/* ACTIVE ALARM STICKY BANNER */}
      {isAlarmSounding && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-pulse sticky top-16 z-40 border-b-2 border-yellow-400">
          <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm">
            <BellRing className="w-5 h-5 animate-bounce text-yellow-300 shrink-0" />
            <span>⚠️ LOUD ALARM & VIBRATION ACTIVE: New Lead Assigned to You!</span>
          </div>
          <button
            onClick={() => {
              buzzerAlarm.stop();
              setIsAlarmSounding(false);
            }}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-900 text-yellow-400 px-4 py-1.5 rounded-xl font-black text-xs shadow-lg transition border border-yellow-400/40 cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            <span>Silence Siren</span>
          </button>
        </div>
      )}

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

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                if (isAlarmSounding) {
                  buzzerAlarm.stop();
                  setIsAlarmSounding(false);
                } else {
                  buzzerAlarm.start();
                  setIsAlarmSounding(true);
                }
              }}
              className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer border shadow-md ${
                isAlarmSounding
                  ? "bg-red-600 hover:bg-red-500 text-white border-red-400 animate-pulse"
                  : "bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border-yellow-400/30"
              }`}
              title="Test the loud 920Hz-460Hz siren and vibration pattern"
            >
              {isAlarmSounding ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
              <span>{isAlarmSounding ? "Stop Buzzer" : "Test Siren & Buzzer"}</span>
            </button>

            <button
              onClick={() => fetchOrders(false)}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-black text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-yellowGlow disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Orders</span>
            </button>
          </div>
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

        {/* FILTERS & SEARCH BAR */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
          {/* PRIMARY DATE FILTERS: ALL TIME, TODAY, TOMORROW, DAY AFTER TOMORROW */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span>Schedule Filter:</span>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
              {(
                [
                  { id: "ALL", label: "ALL TIME", count: counts.all },
                  { id: "TODAY", label: "TODAY", count: counts.today },
                  { id: "TOMORROW", label: "TOMORROW", count: counts.tomorrow },
                  { id: "DAY_AFTER_TOMORROW", label: "DAY AFTER TOMORROW", count: counts.dayAfterTomorrow },
                ] as const
              ).map((tab) => {
                const isActive = selectedDateFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedDateFilter(tab.id)}
                    className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      isActive
                        ? "bg-yellow-400 text-black shadow-yellowGlow"
                        : "bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/80 hover:text-white border border-neutral-700/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isActive
                          ? "bg-black text-yellow-400"
                          : tab.count > 0
                          ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/40"
                          : "bg-neutral-700 text-neutral-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECONDARY ROW: STATUS FILTER PILLS & SEARCH INPUT */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-neutral-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-neutral-500" />
                Status:
              </span>
              {(
                [
                  { id: "ALL", label: "All" },
                  { id: "PENDING", label: "Pending Visit" },
                  { id: "COMPLETED", label: "Paid & Done" },
                  { id: "CANCELLED", label: "Cancelled" },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedStatusFilter === st.id
                      ? "bg-neutral-200 text-black font-black"
                      : "bg-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* SEARCH INPUT */}
            <div className="relative min-w-[240px] sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order, customer, IMEI..."
                className="w-full bg-black/60 border border-neutral-700 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

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
          ) : filteredOrders.length === 0 ? (
            <div className="bg-neutral-900 rounded-3xl p-14 text-center border border-neutral-800 space-y-3">
              <Filter className="w-10 h-10 mx-auto text-neutral-500 opacity-60" />
              <p className="text-base font-bold text-white">No pickups match your active filter</p>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                No assigned leads found for date filter: <span className="text-yellow-400 font-bold">{selectedDateFilter.replace(/_/g, " ")}</span>
                {selectedStatusFilter !== "ALL" ? ` and status: ${selectedStatusFilter}` : ""}.
              </p>
              <button
                onClick={() => {
                  setSelectedDateFilter("ALL");
                  setSelectedStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-2 text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-xl transition shadow-yellowGlow cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((ord) => {
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

                  {/* CANCELLATION REASON BANNER */}
                  {isCancelled && (
                    <div className="bg-red-950/40 border border-red-700/60 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-300">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-200">Cancellation Reason: </span>
                        <span className="font-medium text-red-100">{ord.cancellationReason || "Doorstep inspection rejected / cancelled"}</span>
                      </div>
                    </div>
                  )}

                  {/* 3 COLUMN INFO GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CUSTOMER & CONTACT & NAVIGATION */}
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
                        <div className="flex-grow">
                          <span>{ord.address}</span>
                          {ord.pincode && <span className="ml-1 text-neutral-400 font-semibold">({ord.pincode})</span>}
                        </div>
                      </div>

                      {/* 1-TAP GOOGLE MAPS NAVIGATION */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${ord.address} ${ord.pincode || ""}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-black bg-neutral-800 hover:bg-neutral-700 text-yellow-400 hover:text-yellow-300 border border-neutral-700 px-3 py-1.5 rounded-xl transition shadow-sm"
                        title="Open Google Maps Navigation to customer doorstep"
                      >
                        <Navigation className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Navigate on Google Maps</span>
                      </a>
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

                      <div className="bg-black/60 p-3 rounded-2xl border border-neutral-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Quoted Price:</span>
                          <span className="font-bold text-yellow-400 font-price">
                            ₹{(ord.quotedPrice || ord.estimatedPrice || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Re-Quoted Price:</span>
                          <span className="font-bold text-purple-300 font-price">
                            ₹{(ord.requotedPrice || ord.revisedPrice || ord.quotedPrice || ord.estimatedPrice || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-neutral-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300">Final Price:</span>
                          <span className="text-lg font-black text-emerald-400 font-price">
                            ₹{(ord.finalPrice || ord.amount || ord.revisedPrice || ord.estimatedPrice || 0).toLocaleString("en-IN")}
                          </span>
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
                          <Link
                            href={`/order/${ord.orderNumber}/bill`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-3.5 py-2 rounded-xl transition shadow-md"
                            title="View official purchase receipt & bill"
                          >
                            <FileText className="w-3.5 h-3.5 text-yellow-400" />
                            <span>View Bill</span>
                          </Link>
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

      {/* FULL-SCREEN PERSISTENT LOUD LEAD ALERT MODAL */}
      {activeAlertLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-neutral-900 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
            {/* Pulsing Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 animate-pulse" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 animate-bounce shrink-0">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    NEW LEAD ASSIGNED!
                  </span>
                  <h2 className="text-xl font-black text-white font-price">
                    Order #{activeAlertLead.orderNumber}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  buzzerAlarm.stop();
                  setIsAlarmSounding(false);
                  setActiveAlertLead(null);
                }}
                className="text-neutral-400 hover:text-white p-1 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/60 rounded-2xl p-4 border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Device:</span>
                <span className="font-bold text-white">{activeAlertLead.deviceName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Scheduled Visit:</span>
                <span className="font-black text-yellow-400">
                  {activeAlertLead.pickupDate} ({activeAlertLead.pickupTimeSlot})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Customer:</span>
                <span className="font-bold text-white">{activeAlertLead.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Phone:</span>
                <a href={`tel:${activeAlertLead.customerPhone}`} className="font-bold text-yellow-400 hover:underline">
                  {activeAlertLead.customerPhone}
                </a>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Address:</span>
                <span className="font-medium text-neutral-300 text-right max-w-[220px] truncate">
                  {activeAlertLead.address}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-bold">Quoted Value:</span>
                <span className="text-base font-black text-emerald-400 font-price">
                  ₹{(activeAlertLead.quotedPrice || activeAlertLead.estimatedPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  buzzerAlarm.stop();
                  setIsAlarmSounding(false);
                  setActiveAlertLead(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <VolumeX className="w-4 h-4" />
                <span>Stop Siren & Dismiss</span>
              </button>

              <Link
                href={`/agent/orders/${activeAlertLead.orderNumber}/inspection`}
                onClick={() => {
                  buzzerAlarm.stop();
                  setIsAlarmSounding(false);
                  setActiveAlertLead(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs transition shadow-yellowGlow flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Start Inspection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER ANSWERS & QC AUDIT MODAL */}
      <CustomerAnswersModal
        isOpen={!!selectedOrderForAnswers}
        onClose={() => setSelectedOrderForAnswers(null)}
        orderOrQuote={selectedOrderForAnswers}
      />
    </div>
  );
}
