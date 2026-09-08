"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Headset,
  PhoneCall,
  User,
  Phone,
  Smartphone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  MessageSquare,
  FileText,
  Mail,
  Send,
} from "lucide-react";

interface QuoteLead {
  id: string;
  quoteNumber: string;
  customerName?: string;
  customerPhone?: string;
  deviceName: string;
  estimatedPrice: number;
  status: string;
  createdAt: string;
  pickupDate?: string | null;
  pickupTimeSlot?: string | null;
}

interface CallRecord {
  id: string;
  supportPersonName: string;
  quoteId: string;
  customerName: string;
  customerPhone: string;
  callOutcome: string;
  callNotes: string;
  callTimeIST: string;
}

export default function SupportDashboardPage() {
  const router = useRouter();
  const [supportSession, setSupportSession] = useState<any>(null);

  const [quotes, setQuotes] = useState<QuoteLead[]>([]);
  const [callLogs, setCallLogs] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [callFilter, setCallFilter] = useState<"MY_CALLS" | "ALL_CALLS">("MY_CALLS");

  // Modal State for Call Logging
  const [selectedQuote, setSelectedQuote] = useState<QuoteLead | null>(null);
  const [callOutcome, setCallOutcome] = useState("CUSTOMER_INTERESTED");
  const [callNotes, setCallNotes] = useState("");
  const [submittingCall, setSubmittingCall] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Modal State for Quote to Order Conversion
  const [quoteToConvert, setQuoteToConvert] = useState<QuoteLead | null>(null);
  const [convertForm, setConvertForm] = useState({
    customerName: "",
    customerPhone: "",
    house: "158, Ghughupara Road",
    street: "Bhattanagar, Liluah",
    area: "Howrah",
    landmark: "Near Railway Station",
    city: "Howrah",
    state: "West Bengal",
    pincode: "711203",
    pickupDate: "Tomorrow",
    pickupTimeSlot: "10 AM - 1 PM",
    agentNotes: "Confirmed and booked by Support Agent over phone.",
  });
  const [convertingOrder, setConvertingOrder] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cashall_support_session");
      if (!saved) {
        router.replace("/support/login");
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        const user = parsed.supportUser || { name: "Support Agent" };
        setSupportSession(user);
        if ((window as any).CashAllNative?.setAgentInfo) {
          (window as any).CashAllNative.setAgentInfo(user.name || "", user.phone || "");
        }
      } catch (e) {
        router.replace("/support/login");
      }
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined" && supportSession?.name) {
      if ((window as any).CashAllNative?.setAgentInfo) {
        (window as any).CashAllNative.setAgentInfo(supportSession.name, supportSession.phone || "");
      }
    }
  }, [supportSession]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/support/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: supportSession?.name || "Support Agent",
          phone: supportSession?.phone || "",
        }),
      });
    } catch (e) {}
    localStorage.removeItem("cashall_support_session");
    router.push("/support/login");
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [quotesRes, callsRes] = await Promise.all([
        fetch("/api/v1/admin/quotes?limit=100"),
        fetch("/api/v1/support/calls"),
      ]);

      const quotesJson = await quotesRes.json();
      const callsJson = await callsRes.json();

      if (quotesJson.success && Array.isArray(quotesJson.quotes)) {
        setQuotes(quotesJson.quotes);
      }
      if (callsJson.success && Array.isArray(callsJson.calls)) {
        setCallLogs(callsJson.calls);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load support data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supportSession) {
      fetchData();
    }
  }, [supportSession, fetchData]);

  useEffect(() => {
    // Listen for call finished callback from Android WebView bridge
    (window as any).__cashall_onCallFinished = (quoteId: string, phone: string) => {
      const cleanP = (phone || "").replace(/\D/g, "").slice(-10);
      const matched = quotes.find(
        (item) =>
          item.quoteNumber === quoteId ||
          item.id === quoteId ||
          (cleanP && item.customerPhone && item.customerPhone.replace(/\D/g, "").slice(-10) === cleanP)
      );
      if (matched) {
        setSelectedQuote(matched);
        setCallOutcome("CUSTOMER_INTERESTED");
      }
    };

    // Prompt log modal when window regains focus after dialing
    const handleWindowFocus = () => {
      try {
        const pendingStr = sessionStorage.getItem("cashall_pending_call_quote");
        if (pendingStr) {
          const parsed = JSON.parse(pendingStr);
          if (parsed) {
            setSelectedQuote((prev) => prev || parsed);
          }
        }
      } catch {}
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleWindowFocus);
    };
  }, [quotes]);

  const handleLogCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;

    const currentQuote = selectedQuote;
    const currentNotes = callNotes;
    const currentOutcome = callOutcome;

    setSubmittingCall(true);
    try {
      const res = await fetch("/api/v1/support/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supportPersonName: supportSession?.name || "Support Agent",
          quoteId: currentQuote.quoteNumber,
          customerName: currentQuote.customerName || "Customer Lead",
          customerPhone: currentQuote.customerPhone || "—",
          callOutcome: currentOutcome,
          callNotes: currentNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Optimistic instant UI update: immediately add to call list and dismiss modal
        const newRecord: CallRecord = {
          id: json.callLog?.id || Date.now().toString(),
          supportPersonName: supportSession?.name || "Support Agent",
          quoteId: currentQuote.quoteNumber,
          customerName: currentQuote.customerName || "Customer Lead",
          customerPhone: currentQuote.customerPhone || "—",
          callOutcome: currentOutcome,
          callNotes: currentNotes,
          callTimeIST: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        };

        setCallLogs((prev) => [newRecord, ...prev.filter((c) => c.id !== newRecord.id)]);
        setSuccessToast(`✅ Call logged successfully for Quote ${currentQuote.quoteNumber}!`);
        setSelectedQuote(null);
        setCallNotes("");
        setSubmittingCall(false);

        try {
          sessionStorage.removeItem("cashall_pending_call_quote");
        } catch {}

        // Background sync to ensure server consistency without UI blocking
        fetchData();
      } else {
        alert(json.error || "Failed to log call");
        setSubmittingCall(false);
      }
    } catch (err: any) {
      alert(err.message || "Error logging call");
      setSubmittingCall(false);
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteToConvert) return;

    setConvertingOrder(true);
    try {
      const res = await fetch("/api/v1/admin/quotes/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber: quoteToConvert.quoteNumber,
          customerName: convertForm.customerName || quoteToConvert.customerName,
          customerPhone: convertForm.customerPhone || quoteToConvert.customerPhone,
          house: convertForm.house,
          street: convertForm.street,
          area: convertForm.area,
          landmark: convertForm.landmark,
          city: convertForm.city,
          state: convertForm.state,
          pincode: convertForm.pincode,
          pickupDate: convertForm.pickupDate,
          pickupTimeSlot: convertForm.pickupTimeSlot,
          agentNotes: convertForm.agentNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessToast(`🎉 SUCCESS! Quote ${quoteToConvert.quoteNumber} converted to Order ${json.data?.orderNumber}!`);
        setQuoteToConvert(null);
        await fetchData();
      } else {
        alert(json.error || "Failed to convert quote to order.");
      }
    } catch (err: any) {
      alert(err.message || "Error converting quote to order.");
    } finally {
      setConvertingOrder(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const qStr = (q.quoteNumber + " " + (q.customerName || "") + " " + (q.customerPhone || "") + " " + q.deviceName).toLowerCase();
    return qStr.includes(searchQuery.toLowerCase());
  });

  const pendingLeadsCount = quotes.filter((q) => q.status.includes("UNCOMPLETED")).length;

  const myCalls = callLogs.filter((c) => {
    const sName = (supportSession?.name || "").toLowerCase().trim();
    const cName = (c.supportPersonName || "").toLowerCase().trim();
    return sName && (cName === sName || cName.includes(sName) || sName.includes(cName));
  });
  const myCallsCount = myCalls.length;
  const displayedCalls = callFilter === "MY_CALLS" ? myCalls : callLogs;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-3 sm:p-6 lg:p-8 space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 sm:p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link href="/">
            <Image src="/logo.png" alt="CashALL Logo" width={110} height={30} className="h-6 sm:h-8 w-auto object-contain" />
          </Link>
          <div className="h-5 w-px bg-neutral-800 hidden sm:block" />
          <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase">
            <Headset className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Support Console</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-extrabold text-white">{supportSession?.name || "Support Agent"}</div>
            <div className="text-[10px] text-neutral-400">Customer & Agent Support</div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-750 text-yellow-400 border border-neutral-700 rounded-xl transition"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-red-950/60 hover:text-red-400 text-neutral-300 text-xs font-bold rounded-xl border border-neutral-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* TOAST SUCCESS */}
      {successToast && (
        <div className="bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs p-4 rounded-2xl font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast("")} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* METRICS STATS */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-neutral-900 border border-amber-900/50 bg-amber-950/10 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">Leads Pending Follow-Up</div>
            <div className="text-2xl font-black text-amber-400 font-price mt-1">{pendingLeadsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
            {pendingLeadsCount}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">My Calls Logged</div>
            <div className="text-2xl font-black text-white font-price mt-1">{myCallsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
            {myCallsCount}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Official Support Help Desk</div>
            <a href="mailto:support@cashall.in" className="text-xs font-extrabold text-yellow-400 underline hover:text-yellow-300 mt-1 block">
              support@cashall.in
            </a>
          </div>
          <a href="mailto:support@cashall.in" className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 hover:scale-105 transition">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* UNCOMPLETED LEADS & CALL LOGGING SECTION */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-yellow-400" />
              <span>Customer Quote Leads & Follow-Up Console</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Connect with customers regarding saved quote IDs and log call results for salary & incentive records.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search leads by name, phone, or Quote ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
            <span className="text-xs text-neutral-400 font-semibold">Loading quote leads...</span>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-yellow-400" />
            <p className="text-sm font-bold text-white">No quote leads found</p>
          </div>
        ) : (
          /* ── MOBILE-FIRST CARD LIST — replaces overflow desktop table ── */
          <div className="space-y-3">
            {filteredQuotes.map((q) => (
              <div
                key={q.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3 hover:border-neutral-700 transition"
              >
                {/* ROW 1 — Quote ID + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono font-black text-yellow-400 text-base leading-none">
                      {q.quoteNumber}
                    </div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-yellow-400/60 shrink-0" />
                      <span>
                        {q.createdAt
                          ? new Date(q.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                    q.status === "COMPLETED"
                      ? "bg-green-950 text-green-400 border border-green-700"
                      : q.status === "ORDERED"
                      ? "bg-blue-950 text-blue-400 border border-blue-700"
                      : "bg-amber-950 text-amber-400 border border-amber-700"
                  }`}>
                    {q.status}
                  </span>
                </div>

                {/* ROW 2 — Customer Name + Phone + Call button */}
                <div className="flex items-center justify-between gap-2 bg-neutral-900 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-yellow-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">
                        {q.customerName || "Customer Lead"}
                      </div>
                      <div className="font-mono text-neutral-400 text-xs">
                        {q.customerPhone || "—"}
                      </div>
                    </div>
                  </div>
                  {q.customerPhone && (
                    <a
                      href={`tel:${q.customerPhone}`}
                      onClick={() => {
                        setSelectedQuote(q);
                        setCallOutcome("CUSTOMER_INTERESTED");
                        setCallNotes("");
                        try {
                          sessionStorage.setItem("cashall_pending_call_quote", JSON.stringify(q));
                        } catch {}
                        if (typeof window !== "undefined") {
                          const agentName = supportSession?.name || "";
                          const agentPhone = supportSession?.phone || "";
                          if ((window as any).CashAllNative?.setAgentInfo && agentName) {
                            (window as any).CashAllNative.setAgentInfo(agentName, agentPhone);
                          }
                          if ((window as any).CashAllNative?.setTargetQuote) {
                            (window as any).CashAllNative.setTargetQuote(
                              q.quoteNumber || q.id,
                              q.customerPhone || "",
                              q.customerName || "Customer Lead",
                              q.deviceName || "Mobile Device",
                              agentName
                            );
                          }
                        }
                      }}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shrink-0"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                  )}
                </div>

                {/* ROW 3 — Device + Valuation */}
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs truncate">{q.deviceName}</div>
                    <div className="text-[11px] text-neutral-400">
                      Valuation: <span className="font-black text-green-400">₹{q.estimatedPrice.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* ROW 4 — Action Buttons */}
                <div className="flex gap-2 pt-1 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setSelectedQuote(q);
                      setCallOutcome("CUSTOMER_INTERESTED");
                      setCallNotes("");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white font-extrabold text-xs py-3 rounded-xl transition border border-neutral-700"
                  >
                    <PhoneCall className="w-4 h-4 text-yellow-400" />
                    <span>Log Call</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuoteToConvert(q);
                      setConvertForm((prev) => ({
                        ...prev,
                        customerName: q.customerName || "",
                        customerPhone: q.customerPhone || "",
                      }));
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-extrabold text-xs py-3 rounded-xl transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Convert to Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CALL LOGS AUDIT TRAIL */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>Call Records</span>
            </h2>
            <span className="text-[10px] text-neutral-500 font-mono">Supabase DB</span>
          </div>
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs w-full">
            <button
              type="button"
              onClick={() => setCallFilter("MY_CALLS")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                callFilter === "MY_CALLS"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              My Calls ({myCalls.length})
            </button>
            <button
              type="button"
              onClick={() => setCallFilter("ALL_CALLS")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                callFilter === "ALL_CALLS"
                  ? "bg-neutral-700 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All ({callLogs.length})
            </button>
          </div>
        </div>

        {displayedCalls.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            {callFilter === "MY_CALLS"
              ? `No calls recorded by ${supportSession?.name || "you"} yet.`
              : "No call logs yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedCalls.map((log) => (
              <div key={log.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 space-y-2">
                {/* Agent + Quote ID */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-bold text-white text-sm">{log.supportPersonName}</span>
                  </div>
                  <span className="font-mono font-black text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    {log.quoteId}
                  </span>
                </div>
                {/* Customer */}
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <div>
                    <div className="text-white text-xs font-semibold">{log.customerName}</div>
                    <div className="text-neutral-500 font-mono text-[11px]">{log.customerPhone}</div>
                  </div>
                </div>
                {/* Outcome + Time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 uppercase">
                    {log.callOutcome.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">{log.callTimeIST}</span>
                </div>
                {/* Notes */}
                {log.callNotes && (
                  <div className="text-[11px] text-neutral-400 bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-800 leading-relaxed">
                    {log.callNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONVERT QUOTE TO ORDER MODAL */}
      {quoteToConvert && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-extrabold text-white">Convert Quote into Confirmed Order</h3>
              </div>
              <button
                onClick={() => setQuoteToConvert(null)}
                className="text-neutral-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* QUOTE & CONVERTED ORDER ID SUMMARY */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Incoming Quote ID:</span>
                <span className="font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                  {quoteToConvert.quoteNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Quote Generated At:</span>
                <span className="text-neutral-200 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400 shrink-0" />
                  {quoteToConvert.createdAt
                    ? new Date(quoteToConvert.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Target Generated Order ID:</span>
                <span className="font-mono font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20 text-sm">
                  {`CA${quoteToConvert.quoteNumber.replace(/^(CAQ|Q)-?/i, "").replace(/[^0-9]/g, "")}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Device:</span>
                <span className="font-bold text-white">{quoteToConvert.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Final Agreed Payout:</span>
                <span className="font-black text-green-400 font-price text-sm">
                  ₹{quoteToConvert.estimatedPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <form onSubmit={handleConvertSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={convertForm.customerName}
                    onChange={(e) => setConvertForm({ ...convertForm, customerName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Customer Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={convertForm.customerPhone}
                    onChange={(e) => setConvertForm({ ...convertForm, customerPhone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <span className="text-neutral-400 font-extrabold uppercase text-[10px] block">Doorstep Pickup Address</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Flat / House No.</label>
                    <input
                      type="text"
                      required
                      value={convertForm.house}
                      onChange={(e) => setConvertForm({ ...convertForm, house: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Street / Locality</label>
                    <input
                      type="text"
                      required
                      value={convertForm.street}
                      onChange={(e) => setConvertForm({ ...convertForm, street: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={convertForm.city}
                      onChange={(e) => setConvertForm({ ...convertForm, city: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={convertForm.state}
                      onChange={(e) => setConvertForm({ ...convertForm, state: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={convertForm.pincode}
                      onChange={(e) => setConvertForm({ ...convertForm, pincode: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Pickup Date</label>
                  <select
                    value={convertForm.pickupDate}
                    onChange={(e) => setConvertForm({ ...convertForm, pickupDate: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Day After Tomorrow">Day After Tomorrow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Pickup Time Slot</label>
                  <select
                    value={convertForm.pickupTimeSlot}
                    onChange={(e) => setConvertForm({ ...convertForm, pickupTimeSlot: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-2.5 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="10 AM - 1 PM">10 AM - 1 PM</option>
                    <option value="1 PM - 4 PM">1 PM - 4 PM</option>
                    <option value="4 PM - 7 PM">4 PM - 7 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setQuoteToConvert(null)}
                  className="w-1/2 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={convertingOrder}
                  className="w-1/2 flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl transition shadow-yellowGlow disabled:opacity-60"
                >
                  {convertingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>CONFIRM &amp; BOOK ORDER</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG CALL MODAL */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-extrabold text-white">Log Call with Customer</h3>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-neutral-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Quote ID:</span>
                <span className="font-mono font-bold text-yellow-400">{selectedQuote.quoteNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Quote Generated At:</span>
                <span className="text-neutral-200 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400 shrink-0" />
                  {selectedQuote.createdAt
                    ? new Date(selectedQuote.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Customer Name:</span>
                <span className="font-bold text-white">{selectedQuote.customerName || "Customer Lead"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Mobile Number:</span>
                <a href={`tel:${selectedQuote.customerPhone}`} className="font-mono font-bold text-yellow-400 underline">
                  {selectedQuote.customerPhone || "—"}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Device Valuation:</span>
                <span className="font-black text-green-400 font-price">₹{selectedQuote.estimatedPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <form onSubmit={handleLogCallSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Call Outcome</label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-yellow-400 transition cursor-pointer"
                >
                  <option value="CUSTOMER_INTERESTED">Customer Interested (Proceeding with Booking)</option>
                  <option value="RE-SCHEDULED_VISIT">Requested Re-scheduled Visit Time</option>
                  <option value="RESOLVED_ISSUE">Resolved Customer Inquiry / Question</option>
                  <option value="NO_ANSWER">No Answer / Line Busy</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Call Notes & Remarks</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter details of conversation with customer..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-yellow-400 transition"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="w-1/2 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCall}
                  className="w-1/2 flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl transition shadow-yellowGlow disabled:opacity-60"
                >
                  {submittingCall ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Call Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
