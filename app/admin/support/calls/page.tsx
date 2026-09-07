"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Headset,
  Phone,
  User,
  Calendar,
  Clock,
  Radio,
  Search,
  Download,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  PhoneCall,
  Filter,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface CallRecordingItem {
  id: string;
  supportPersonName: string;
  supportPersonPhone: string;
  customerName?: string;
  customerPhone: string;
  deviceName?: string;
  quoteId?: string;
  durationSeconds: number;
  durationFormatted: string;
  audioUrl?: string;
  callOutcome: string;
  callNotes: string;
  callStartTime: string;
  callEndTime: string;
  createdAtIST: string;
  createdAt: string;
}

type DateFilterType = "ALL" | "TODAY" | "YESTERDAY";

function formatDurationHuman(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function getISTDateString(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d); // Returns YYYY-MM-DD in IST
  } catch {
    return "";
  }
}

export default function AdminSupportCallLogsPage() {
  const [recordings, setRecordings] = useState<CallRecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("TODAY");

  // Fetch call recordings from API
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/support/recordings", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecordings(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch customer call logs:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Determine current date markers in IST
  const { todayIST, yesterdayIST } = useMemo(() => {
    const now = new Date();
    const todayStr = getISTDateString(now);

    const yestDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getISTDateString(yestDate);

    return { todayIST: todayStr, yesterdayIST: yesterdayStr };
  }, []);

  // Standard agents requested: "SANGEET SHAW" and "HARSHITA VYAS"
  const agentTabs = useMemo(() => {
    // Count calls per agent
    const sangeetCalls = recordings.filter((r) =>
      r.supportPersonName.toLowerCase().includes("sangeet") ||
      r.supportPersonPhone.includes("8981191734") === false && r.supportPersonName.toLowerCase().includes("shaw")
    );
    const harshitaCalls = recordings.filter((r) =>
      r.supportPersonName.toLowerCase().includes("harshita") ||
      r.supportPersonPhone.includes("8981191734")
    );

    return [
      {
        id: "ALL",
        label: "All Team Members",
        count: recordings.length,
        totalSeconds: recordings.reduce((acc, r) => acc + (r.durationSeconds || 0), 0),
      },
      {
        id: "HARSHITA",
        label: "Harshita Vyas",
        subtitle: "8981191734",
        count: harshitaCalls.length,
        totalSeconds: harshitaCalls.reduce((acc, r) => acc + (r.durationSeconds || 0), 0),
      },
      {
        id: "SANGEET",
        label: "Sangeet Shaw",
        subtitle: "Support Staff",
        count: sangeetCalls.length,
        totalSeconds: sangeetCalls.reduce((acc, r) => acc + (r.durationSeconds || 0), 0),
      },
    ];
  }, [recordings]);

  // Filtered dataset
  const filteredRecordings = useMemo(() => {
    return recordings.filter((rec) => {
      // 1. Agent Filter
      if (selectedAgent === "HARSHITA") {
        const isHarshita =
          rec.supportPersonName.toLowerCase().includes("harshita") ||
          rec.supportPersonPhone.includes("8981191734");
        if (!isHarshita) return false;
      } else if (selectedAgent === "SANGEET") {
        const isSangeet =
          rec.supportPersonName.toLowerCase().includes("sangeet") ||
          (rec.supportPersonName.toLowerCase().includes("shaw") && !rec.supportPersonPhone.includes("8981191734"));
        if (!isSangeet) return false;
      }

      // 2. Date Filter in IST
      if (dateFilter !== "ALL") {
        const itemDateIST = getISTDateString(rec.createdAt || rec.callStartTime);
        if (dateFilter === "TODAY" && itemDateIST !== todayIST) {
          return false;
        }
        if (dateFilter === "YESTERDAY" && itemDateIST !== yesterdayIST) {
          return false;
        }
      }

      // 3. Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match =
          rec.customerPhone.includes(q) ||
          rec.customerName?.toLowerCase().includes(q) ||
          rec.deviceName?.toLowerCase().includes(q) ||
          rec.quoteId?.toLowerCase().includes(q) ||
          rec.supportPersonName.toLowerCase().includes(q) ||
          rec.supportPersonPhone.includes(q) ||
          rec.callOutcome.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [recordings, selectedAgent, dateFilter, search, todayIST, yesterdayIST]);

  // Aggregate Metrics for currently filtered list
  const metrics = useMemo(() => {
    const totalCalls = filteredRecordings.length;
    const totalTalkSeconds = filteredRecordings.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);
    const completedCalls = filteredRecordings.filter((r) => r.callOutcome === "CALL_COMPLETED" || r.durationSeconds > 0).length;
    const avgSeconds = totalCalls > 0 ? Math.round(totalTalkSeconds / totalCalls) : 0;

    return {
      totalCalls,
      totalTalkFormatted: formatDurationHuman(totalTalkSeconds),
      completedCalls,
      avgDurationFormatted: formatDurationHuman(avgSeconds),
    };
  }, [filteredRecordings]);

  // Export Filtered CSV
  const handleExportCSV = () => {
    if (filteredRecordings.length === 0) return;
    const headers = [
      "Agent Name",
      "Agent Phone",
      "Customer Name",
      "Customer Phone",
      "Device",
      "Quote ID",
      "Date & Time (IST)",
      "Duration (Seconds)",
      "Duration (Formatted)",
      "Outcome",
    ];

    const rows = filteredRecordings.map((r) => [
      `"${(r.supportPersonName || "").replace(/"/g, '""')}"`,
      `"=""${r.supportPersonPhone || ""}"""`,
      `"${(r.customerName || "").replace(/"/g, '""')}"`,
      `"=""${r.customerPhone || ""}"""`,
      `"${(r.deviceName || "").replace(/"/g, '""')}"`,
      `"${r.quoteId || ""}"`,
      `"${r.createdAtIST || ""}"`,
      r.durationSeconds || 0,
      `"${r.durationFormatted || ""}"`,
      `"${r.callOutcome || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `CashALL_Call_Logs_${selectedAgent}_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* TOP BREADCRUMB & HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div className="space-y-1.5">
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Support Team Management</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
              <h1 className="text-2xl font-black text-white tracking-wide font-price flex items-center gap-2">
                <span>Customer Call Logs</span>
                <span className="text-xs font-bold bg-yellow-400 text-black px-2.5 py-0.5 rounded-full">
                  {filteredRecordings.length}
                </span>
              </h1>
            </div>
            <p className="text-xs text-neutral-400">
              Live customer call records synced automatically from the CashALL Android Caller App.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              disabled={filteredRecordings.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Calls</span>
            </button>
          </div>
        </div>

        {/* TEAM MEMBER SELECTOR: SANGEET SHAW & HARSHITA VYAS */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-yellow-400" />
            <span>Select Support Team Member:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {agentTabs.map((agent) => {
              const isSelected = selectedAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-neutral-800/95 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400/50"
                      : "bg-neutral-800/60 border-neutral-700/80 hover:bg-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            isSelected ? "bg-yellow-400 text-black" : "bg-neutral-700 text-neutral-300"
                          }`}
                        >
                          {agent.id === "ALL" ? "👥" : agent.label.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-black text-sm ${isSelected ? "text-yellow-400" : "text-white"}`}>
                            {agent.label}
                          </div>
                          {agent.subtitle && (
                            <div className="text-[10px] text-neutral-400 font-mono">{agent.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                        isSelected
                          ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                          : "bg-neutral-700/60 text-neutral-300 border-neutral-600"
                      }`}
                    >
                      {agent.count} Calls
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-700/50 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Total Talk Time:</span>
                    <span className="font-mono font-bold text-neutral-200">
                      {formatDurationHuman(agent.totalSeconds)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DATE FILTERS: YESTERDAY | TODAY | ALL TIME */}
        <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-yellow-400" />
              <span>Time Filter:</span>
            </span>

            <button
              onClick={() => setDateFilter("TODAY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                dateFilter === "TODAY"
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "bg-neutral-900 hover:bg-neutral-750 text-neutral-300 border border-neutral-700"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>TODAY</span>
            </button>

            <button
              onClick={() => setDateFilter("YESTERDAY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                dateFilter === "YESTERDAY"
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "bg-neutral-900 hover:bg-neutral-750 text-neutral-300 border border-neutral-700"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>YESTERDAY</span>
            </button>

            <button
              onClick={() => setDateFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                dateFilter === "ALL"
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "bg-neutral-900 hover:bg-neutral-750 text-neutral-300 border border-neutral-700"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>ALL TIME</span>
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search phone, customer, device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-800/80 border border-neutral-700/80 p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Calls</div>
            <div className="text-xl font-black text-white mt-1 font-price">{metrics.totalCalls}</div>
          </div>
          <div className="bg-neutral-800/80 border border-neutral-700/80 p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Talk Time</div>
            <div className="text-xl font-black text-amber-400 mt-1 font-price">{metrics.totalTalkFormatted}</div>
          </div>
          <div className="bg-neutral-800/80 border border-neutral-700/80 p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Connected / Completed</div>
            <div className="text-xl font-black text-emerald-400 mt-1 font-price">{metrics.completedCalls}</div>
          </div>
          <div className="bg-neutral-800/80 border border-neutral-700/80 p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Average Call Duration</div>
            <div className="text-xl font-black text-neutral-200 mt-1 font-price">{metrics.avgDurationFormatted}</div>
          </div>
        </div>

        {/* CALL LOGS TABLE */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-extrabold text-white">
                Detailed Call Activity Feed ({filteredRecordings.length})
              </h2>
            </div>
            <div className="text-xs text-neutral-400">
              Showing: <span className="font-bold text-yellow-400">{selectedAgent}</span> •{" "}
              <span className="font-bold text-white">{dateFilter}</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-neutral-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
              <span>Loading customer call logs...</span>
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-750 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-white">No call logs found for this filter</div>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                No customer calls logged under {selectedAgent} for {dateFilter}. Try changing the agent, date filter, or clearing search.
              </p>
              <button
                onClick={() => {
                  setSelectedAgent("ALL");
                  setDateFilter("ALL");
                  setSearch("");
                }}
                className="text-xs font-bold text-yellow-400 hover:underline pt-2"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 bg-neutral-850/60 text-neutral-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3.5 px-4">Support Agent</th>
                    <th className="py-3.5 px-4">Customer &amp; Device</th>
                    <th className="py-3.5 px-4">Date &amp; Time (IST)</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Call Outcome</th>
                    <th className="py-3.5 px-4 text-right">Quick Dial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/60">
                  {filteredRecordings.map((rec) => (
                    <tr key={rec.id} className="hover:bg-neutral-750/50 transition">
                      {/* AGENT */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-neutral-700 flex items-center justify-center font-bold text-yellow-400 shrink-0">
                            {rec.supportPersonName.charAt(0) || "A"}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{rec.supportPersonName}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              {rec.supportPersonPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CUSTOMER & DEVICE */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span>{rec.customerName || "Customer Lead"}</span>
                        </div>
                        <div className="text-xs text-neutral-300 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{rec.customerPhone}</span>
                        </div>
                        {rec.deviceName && rec.deviceName !== "—" && (
                          <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1 mt-1">
                            <Smartphone className="w-3 h-3 text-yellow-400 shrink-0" />
                            <span>{rec.deviceName}</span>
                          </div>
                        )}
                        {rec.quoteId && rec.quoteId !== "N/A" && (
                          <div className="inline-block text-[10px] font-mono text-yellow-400 font-extrabold bg-yellow-950/60 border border-yellow-800/80 px-2 py-0.5 rounded mt-1">
                            Quote: {rec.quoteId}
                          </div>
                        )}
                      </td>

                      {/* DATE & TIME (IST) */}
                      <td className="py-3.5 px-4 text-neutral-200 font-mono text-xs whitespace-nowrap">
                        {rec.createdAtIST}
                      </td>

                      {/* DURATION */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-amber-950/80 border border-amber-800 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-xl text-xs">
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{rec.durationFormatted}</span>
                        </span>
                      </td>

                      {/* OUTCOME */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                            rec.callOutcome === "CALL_COMPLETED"
                              ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                              : rec.callOutcome === "CUSTOMER_INTERESTED"
                              ? "bg-blue-950 border-blue-700 text-blue-400"
                              : "bg-neutral-900 border-neutral-700 text-neutral-300"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{rec.callOutcome.replace(/_/g, " ")}</span>
                        </span>
                      </td>

                      {/* QUICK CALL ACTION */}
                      <td className="py-3.5 px-4 text-right">
                        {rec.customerPhone && rec.customerPhone !== "—" ? (
                          <a
                            href={`tel:${rec.customerPhone}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 px-3 py-1.5 rounded-xl border border-yellow-400/30 transition shadow-sm"
                            title={`Dial ${rec.customerPhone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        ) : (
                          <span className="text-neutral-500 text-xs">—</span>
                        )}
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
