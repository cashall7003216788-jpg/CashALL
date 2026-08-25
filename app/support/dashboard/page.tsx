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
        setSupportSession(parsed.supportUser || { name: "Support Agent" });
      } catch (e) {
        router.replace("/support/login");
      }
    }
  }, [router]);

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
        fetch("/api/v1/admin/quotes"),
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

  const handleLogCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;

    setSubmittingCall(true);
    try {
      const res = await fetch("/api/v1/support/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supportPersonName: supportSession?.name || "Support Agent",
          quoteId: selectedQuote.quoteNumber,
          customerName: selectedQuote.customerName || "Customer Lead",
          customerPhone: selectedQuote.customerPhone || "—",
          callOutcome,
          callNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessToast(`✅ Call logged successfully for Quote ${selectedQuote.quoteNumber}!`);
        setSelectedQuote(null);
        setCallNotes("");
        await fetchData();
      } else {
        alert(json.error || "Failed to log call");
      }
    } catch (err: any) {
      alert(err.message || "Error logging call");
    } finally {
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
  const myCallsCount = callLogs.filter((c) => c.supportPersonName === supportSession?.name).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="CashALL Logo" width={140} height={38} className="h-8 w-auto object-contain" />
          </Link>
          <div className="h-6 w-px bg-neutral-800" />
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <Headset className="w-3.5 h-3.5" />
            <span>Support Calling Console</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-4">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3">Quote ID</th>
                  <th className="py-3 px-3">Customer Lead & Mobile</th>
                  <th className="py-3 px-3">Device & Valuation</th>
                  <th className="py-3 px-3">Booking Status</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-neutral-850/50 transition">
                    <td className="py-4 px-3">
                      <div className="font-mono font-black text-yellow-400 text-sm">
                        {q.quoteNumber}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-1 font-medium" title="Time when quote was generated">
                        <Clock className="w-3 h-3 text-yellow-400/80 shrink-0" />
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
                    </td>

                    <td className="py-4 px-3">
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span>{q.customerName || "Customer Lead"}</span>
                        </div>
                        <div className="text-neutral-300 font-mono text-[11px] flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                          <a href={`tel:${q.customerPhone}`} className="hover:text-yellow-400 transition underline decoration-dotted">
                            {q.customerPhone || "—"}
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span>{q.deviceName}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          CashALL Valuation: <span className="font-black text-green-400 font-price">₹{q.estimatedPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        q.status === "COMPLETED"
                          ? "bg-green-950 text-green-400 border border-green-700"
                          : q.status === "ORDERED"
                          ? "bg-blue-950 text-blue-400 border border-blue-700"
                          : "bg-amber-950 text-amber-400 border border-amber-700"
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedQuote(q);
                            setCallOutcome("CUSTOMER_INTERESTED");
                            setCallNotes("");
                          }}
                          className="inline-flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition shadow-md border border-neutral-700"
                          title="Log Call"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-yellow-400" />
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
                          className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-3 py-2 rounded-xl transition shadow-yellowGlow"
                          title="Convert quote into confirmed order"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Convert (CA...)</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CALL LOGS AUDIT TRAIL TABLE */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span>Support Call Records & Incentive Log ({callLogs.length})</span>
          </h2>
          <span className="text-[11px] text-neutral-400 font-mono">Recorded in Supabase Database</span>
        </div>

        {callLogs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No support call logs recorded yet. Use the "Log Call" button above to record your customer interactions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3">Support Person</th>
                  <th className="py-3 px-3">Quote ID</th>
                  <th className="py-3 px-3">Customer & Phone</th>
                  <th className="py-3 px-3">Call Outcome</th>
                  <th className="py-3 px-3">Notes / Remarks</th>
                  <th className="py-3 px-3">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {callLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>{log.supportPersonName}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-yellow-400">{log.quoteId}</td>
                    <td className="py-3 px-3 text-neutral-300">
                      <div>{log.customerName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{log.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {log.callOutcome.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-300 max-w-xs truncate" title={log.callNotes}>
                      {log.callNotes}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 font-mono text-[11px]">{log.callTimeIST}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
