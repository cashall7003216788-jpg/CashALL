"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  FileText,
  Smartphone,
  Loader2,
  Phone,
  User,
  Search,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
  Download,
  Printer,
  CheckCircle2,
  Ban,
  ListChecks,
} from "lucide-react";
import { CustomerAnswersModal } from "@/components/admin/CustomerAnswersModal";

interface Quote {
  id: string;
  quoteNumber: string;
  customerName?: string;
  customerPhone?: string;
  deviceName: string;
  basePrice: number;
  estimatedPrice: number;
  status: string;
  createdAt: string;
  orderNumber?: string | null;
  pickupDate?: string | null;
  pickupTimeSlot?: string | null;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [selectedQuoteForAnswers, setSelectedQuoteForAnswers] = useState<any | null>(null);

  const [quoteToConvert, setQuoteToConvert] = useState<Quote | null>(null);
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
    agentNotes: "Converted from admin console leads pipeline.",
  });
  const [convertingOrder, setConvertingOrder] = useState(false);

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
        await fetchQuotes();
      } else {
        alert(json.error || "Failed to convert quote to order.");
      }
    } catch (err: any) {
      alert(err.message || "Error converting quote to order.");
    } finally {
      setConvertingOrder(false);
    }
  };

  const handleCancelQuoteAdmin = async (q: Quote) => {
    const reason = prompt(
      `Cancel Quote #${q.quoteNumber}? Enter reason:`,
      "Quote cancelled / lead discarded by Admin"
    );
    if (reason === null) return;

    try {
      const res = await fetch(`/api/v1/quotes/${q.quoteNumber}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessToast(`🛑 Quote ${q.quoteNumber} has been marked as CANCELLED!`);
        await fetchQuotes();
      } else {
        alert(json.error || "Failed to cancel quote");
      }
    } catch (err: any) {
      alert(err.message || "Error cancelling quote");
    }
  };

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/quotes?limit=250");
      const json = await res.json();
      if (json.success && Array.isArray(json.quotes)) {
        setQuotes(json.quotes);
      } else {
        setError(json.error || "Failed to fetch quotes");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching quotes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const filteredQuotes = quotes.filter((q) => {
    const qStr = (q.quoteNumber + " " + (q.customerName || "") + " " + (q.customerPhone || "") + " " + q.deviceName).toLowerCase();
    return qStr.includes(searchQuery.toLowerCase());
  });

  const handleDownloadCSV = () => {
    if (filteredQuotes.length === 0) return;
    const headers = ["Quote ID", "Customer Name", "Customer Phone", "Device Purchased", "Estimated Price (INR)", "Scheduled Visit", "Booking Status", "Generated Date & Time"];
    const rows = filteredQuotes.map((q) => [
      q.quoteNumber,
      `"${(q.customerName || "Customer Lead").replace(/"/g, '""')}"`,
      q.customerPhone || "—",
      `"${q.deviceName.replace(/"/g, '""')}"`,
      q.estimatedPrice,
      q.pickupDate ? `"${q.pickupDate} (${q.pickupTimeSlot || "Standard"})"` : "Not Scheduled",
      q.status,
      `"${new Date(q.createdAt).toLocaleString("en-IN")}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CashALL_Quotes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (typeof document !== "undefined") {
      document.title = `CashALL_Quotes_Repository_${new Date().toISOString().slice(0, 10)}`;
    }
    window.print();
  };

  const uncompletedCount = quotes.filter((q) => q.status.includes("UNCOMPLETED")).length;
  const orderedCount = quotes.filter((q) => q.status === "ORDERED").length;
  const completedCount = quotes.filter((q) => q.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
                Quotes & Uncompleted Leads Repository
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Real-Time Saved Quote IDs, Customer Details & Doorstep Visit Times for Calling Team Follow-Ups
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              disabled={filteredQuotes.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={filteredQuotes.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={fetchQuotes}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Leads</span>
            </button>
          </div>
        </div>

        {/* METRICS STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800 border border-neutral-700 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Quotes Generated</div>
              <div className="text-2xl font-black text-white font-price mt-1">{quotes.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-black">
              {quotes.length}
            </div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Completed Bookings</div>
              <div className="text-2xl font-black text-green-400 font-price mt-1">{completedCount + orderedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-black">
              {completedCount + orderedCount}
            </div>
          </div>

          <div className="bg-neutral-800 border border-amber-900/60 p-5 rounded-2xl flex items-center justify-between bg-amber-950/20">
            <div>
              <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">Pending Call Follow-Ups</div>
              <div className="text-2xl font-black text-amber-400 font-price mt-1">{uncompletedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
              {uncompletedCount}
            </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4">
          {/* SEARCH FILTER */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Quote ID, Customer Name, Mobile or Device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition"
              />
            </div>
            <span className="text-xs text-neutral-400 font-semibold">
              Showing {filteredQuotes.length} of {quotes.length} quotes
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <span className="text-xs text-neutral-400 font-semibold">Loading saved quotes & leads...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-300 text-xs p-4 rounded-2xl font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-yellow-400" />
              <p className="text-sm font-bold text-white">No quotes found</p>
              <p className="text-xs mt-1">Customer valuation quotes will populate here in real-time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 text-neutral-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-3">Quote ID</th>
                    <th className="py-3 px-3">Customer Lead & Mobile</th>
                    <th className="py-3 px-3">Device Purchased & Valuation</th>
                    <th className="py-3 px-3">Scheduled Agent Visit</th>
                    <th className="py-3 px-3">Booking Status</th>
                    <th className="py-3 px-3">Generated Date & Time</th>
                    <th className="py-3 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/60">
                  {filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-neutral-750/50 transition">
                      {/* QUOTE ID */}
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

                      {/* CUSTOMER & PHONE */}
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

                      {/* DEVICE & VALUATION */}
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

                      {/* VISIT TIME & SLOT */}
                      <td className="py-4 px-3">
                        {q.pickupDate ? (
                          <div className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-xl text-neutral-200 text-[11px] font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <span>{q.pickupDate} ({q.pickupTimeSlot || "Standard Slot"})</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">Not Scheduled</span>
                        )}
                      </td>

                      {/* BOOKING STATUS */}
                      <td className="py-4 px-3">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          q.status === "COMPLETED"
                            ? "bg-green-950 text-green-400 border border-green-700"
                            : q.status === "ORDERED" || q.status === "CONVERTED"
                            ? "bg-blue-950 text-blue-400 border border-blue-700"
                            : "bg-amber-950 text-amber-400 border border-amber-700"
                        }`}>
                          {q.status}
                        </span>
                      </td>

                      {/* GENERATED DATE & TIME */}
                      <td className="py-4 px-3 text-neutral-300 font-mono text-[11px] whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>

                      {/* ACTION CONVERT, ANSWERS & CANCEL */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedQuoteForAnswers(q)}
                            className="inline-flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-bold text-xs px-2.5 py-1.5 rounded-xl transition shadow-sm"
                            title="View Customer Evaluation Answers & Conditions"
                          >
                            <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Answers</span>
                          </button>

                          {q.status !== "ORDERED" && q.status !== "COMPLETED" && q.status !== "CONVERTED" && q.status !== "CANCELLED" ? (
                            <>
                              <button
                                onClick={() => {
                                  setQuoteToConvert(q);
                                  setConvertForm((prev) => ({
                                    ...prev,
                                    customerName: q.customerName || "",
                                    customerPhone: q.customerPhone || "",
                                  }));
                                }}
                                className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-3 py-1.5 rounded-xl transition shadow-yellowGlow"
                                title="Convert Quote into Order (CA...)"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Convert (CA...)</span>
                              </button>

                              <button
                                onClick={() => handleCancelQuoteAdmin(q)}
                                className="inline-flex items-center gap-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs px-2.5 py-1.5 rounded-xl transition shadow-sm"
                                title="Cancel / Reject Quote"
                              >
                                <Ban className="w-3.5 h-3.5 text-red-400" />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : q.status === "CANCELLED" ? (
                            <span className="text-red-400 text-[11px] font-bold bg-red-950/60 border border-red-800 px-2 py-0.5 rounded-lg">
                              CANCELLED
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px] font-bold">Converted</span>
                          )}
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

      {/* CONVERT QUOTE TO ORDER MODAL */}
      {quoteToConvert && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-extrabold text-white">Convert Lead Quote to Confirmed Order</h3>
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

      {/* CUSTOMER ANSWERS & QC AUDIT MODAL */}
      <CustomerAnswersModal
        isOpen={!!selectedQuoteForAnswers}
        onClose={() => setSelectedQuoteForAnswers(null)}
        orderOrQuote={selectedQuoteForAnswers}
      />
    </div>
  );
}
