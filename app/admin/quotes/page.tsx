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
} from "lucide-react";

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

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/quotes");
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

  const uncompletedCount = quotes.filter((q) => q.status.includes("UNCOMPLETED")).length;
  const orderedCount = quotes.filter((q) => q.status === "ORDERED").length;
  const completedCount = quotes.filter((q) => q.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex">
      <AdminSidebar />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-full">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
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

          <button
            onClick={fetchQuotes}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Leads
          </button>
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
                    <th className="py-3 px-3">Generated Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/60">
                  {filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-neutral-750/50 transition">
                      {/* QUOTE ID */}
                      <td className="py-4 px-3 font-mono font-black text-yellow-400">
                        {q.quoteNumber}
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
                            : q.status === "ORDERED"
                            ? "bg-blue-950 text-blue-400 border border-blue-700"
                            : "bg-amber-950 text-amber-400 border border-amber-700"
                        }`}>
                          {q.status}
                        </span>
                      </td>

                      {/* GENERATED DATE */}
                      <td className="py-4 px-3 text-neutral-400 text-[11px]">
                        {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
