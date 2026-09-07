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
  MessageSquare,
  X,
  Copy,
  Check,
  CalendarClock,
  XCircle,
  PhoneMissed,
  FileText,
  Volume2,
  Edit3,
  AlertCircle,
  Save,
} from "lucide-react";

interface CallRecordingItem {
  id: string;
  action?: string;
  supportPersonName: string;
  supportPersonPhone: string;
  customerName?: string;
  customerPhone: string;
  deviceName?: string;
  quoteId?: string;
  durationSeconds: number;
  durationFormatted: string;
  audioUrl?: string;
  hasRecording?: boolean;
  callOutcome: string;
  callNotes: string;
  callStartTime: string;
  callEndTime: string;
  createdAtIST: string;
  callTimeIST?: string;
  createdAt: string;
}

type DateFilterType = "ALL" | "TODAY" | "YESTERDAY";

function formatCallDateTime(dateVal?: string | Date | null, istVal?: string) {
  if (dateVal) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
        });
        const timeStr = d.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const fullStr = `${d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })}, ${timeStr}`;
        return { date: dateStr, time: timeStr, full: fullStr };
      }
    } catch {}
  }

  if (istVal && typeof istVal === "string" && istVal.trim() && !istVal.includes("Invalid")) {
    try {
      const parts = istVal.split(",");
      if (parts.length >= 2) {
        return { date: parts[0].trim(), time: parts[1].trim(), full: istVal };
      }
      return { date: istVal, time: "", full: istVal };
    } catch {}
  }

  return { date: "Today", time: "", full: "Today" };
}

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

function formatCallOutcome(outcome: string): string {
  if (!outcome) return "Call Attempted";
  switch (outcome.toUpperCase()) {
    case "CUSTOMER_INTERESTED":
      return "Customer Interested";
    case "RESOLVED_ISSUE":
      return "Resolved Issue";
    case "RE-SCHEDULED_VISIT":
    case "RESCHEDULED_VISIT":
      return "Rescheduled Visit";
    case "NOT_INTERESTED":
      return "Not Interested";
    case "NO_ANSWER":
      return "No Answer";
    case "CALL_COMPLETED":
      return "Call Completed";
    case "CALL_RECORDED":
      return "Call Recorded";
    case "CALL_ATTEMPTED":
      return "Call Attempted";
    default:
      return outcome.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

function getOutcomeBadgeStyle(outcome: string): string {
  const norm = (outcome || "").toUpperCase();
  if (norm.includes("CUSTOMER_INTERESTED") || norm.includes("INTERESTED")) {
    return "bg-emerald-950/80 border-emerald-500/70 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-900/90 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
  }
  if (norm.includes("RESOLVED")) {
    return "bg-sky-950/80 border-sky-500/70 text-sky-300 ring-1 ring-sky-500/30 hover:bg-sky-900/90 shadow-[0_0_12px_rgba(14,165,233,0.15)]";
  }
  if (norm.includes("SCHEDULE") || norm.includes("RE-SCHEDULE")) {
    return "bg-amber-950/80 border-amber-500/70 text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-900/90 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
  }
  if (norm.includes("NOT_INTERESTED")) {
    return "bg-rose-950/80 border-rose-500/70 text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-900/90 shadow-[0_0_12px_rgba(244,63,94,0.15)]";
  }
  if (norm.includes("NO_ANSWER")) {
    return "bg-neutral-850 border-neutral-600 text-neutral-300 ring-1 ring-neutral-700 hover:bg-neutral-800";
  }
  if (norm.includes("COMPLETED")) {
    return "bg-emerald-950/60 border-emerald-600/60 text-emerald-400 hover:bg-emerald-900/60";
  }
  return "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750";
}

function getOutcomeIcon(outcome: string) {
  const norm = (outcome || "").toUpperCase();
  if (norm.includes("CUSTOMER_INTERESTED") || norm.includes("INTERESTED")) {
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  }
  if (norm.includes("RESOLVED")) {
    return <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
  }
  if (norm.includes("SCHEDULE") || norm.includes("RE-SCHEDULE")) {
    return <CalendarClock className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }
  if (norm.includes("NOT_INTERESTED")) {
    return <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
  }
  if (norm.includes("NO_ANSWER")) {
    return <PhoneMissed className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
  }
  return <PhoneCall className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
}

export default function AdminSupportCallLogsPage() {
  const [recordings, setRecordings] = useState<CallRecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("TODAY");
  const [selectedCall, setSelectedCall] = useState<CallRecordingItem | null>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Edit call reason / outcome states
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [editOutcome, setEditOutcome] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingReason, setSavingReason] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handleOpenCallModal = (rec: CallRecordingItem) => {
    setSelectedCall(rec);
    setIsEditingReason(false);
    setEditOutcome(rec.callOutcome || "CUSTOMER_INTERESTED");
    setEditNotes(rec.callNotes === "Logged via CashALL Caller App" ? "" : rec.callNotes);
    setSaveSuccessMsg("");
  };

  const handleSaveReason = async () => {
    if (!selectedCall) return;
    setSavingReason(true);
    try {
      const res = await fetch("/api/v1/support/calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCall.id,
          quoteId: selectedCall.quoteId,
          customerPhone: selectedCall.customerPhone,
          callOutcome: editOutcome,
          callNotes: editNotes,
          supportPersonName: selectedCall.supportPersonName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const updatedCall = {
          ...selectedCall,
          callOutcome: editOutcome,
          callNotes: editNotes,
        };
        setSelectedCall(updatedCall);
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === selectedCall.id ||
            (selectedCall.quoteId && selectedCall.quoteId !== "N/A" && r.quoteId === selectedCall.quoteId)
              ? { ...r, callOutcome: editOutcome, callNotes: editNotes }
              : r
          )
        );
        setIsEditingReason(false);
        setSaveSuccessMsg("✅ Call reason & outcome saved successfully!");
        setTimeout(() => setSaveSuccessMsg(""), 4000);
      } else {
        alert(json.error || "Failed to update call reason");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update call reason");
    } finally {
      setSavingReason(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCall(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch call logs from API with cache busting and fallback
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/v1/support/calls?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      const json = await res.json();
      let list = json.calls || json.recordings || json.data || [];

      if (!Array.isArray(list) || list.length === 0) {
        const fallbackRes = await fetch(`/api/v1/support/recordings?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
        const fallbackJson = await fallbackRes.json();
        list = fallbackJson.calls || fallbackJson.recordings || fallbackJson.data || [];
      }

      if (Array.isArray(list)) {
        const normalized = list.map((item: any) => {
          const ist = item.createdAtIST || item.callTimeIST || "";
          const created = item.createdAt || new Date().toISOString();
          return {
            ...item,
            createdAt: created,
            createdAtIST: ist || (created ? new Date(created).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : ""),
            callTimeIST: ist || item.callTimeIST || "",
          };
        });
        setRecordings(normalized);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }));
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
    const sangeetCalls = recordings.filter(
      (r) =>
        r.supportPersonName.toLowerCase().includes("sangeet") ||
        (!r.supportPersonPhone.includes("8981191734") && r.supportPersonName.toLowerCase().includes("shaw"))
    );
    const harshitaCalls = recordings.filter(
      (r) =>
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

  // Counts by date filter for currently selected agent
  const filterCounts = useMemo(() => {
    let agentFiltered = recordings;
    if (selectedAgent === "HARSHITA") {
      agentFiltered = recordings.filter(
        (rec) =>
          rec.supportPersonName.toLowerCase().includes("harshita") ||
          rec.supportPersonPhone.includes("8981191734")
      );
    } else if (selectedAgent === "SANGEET") {
      agentFiltered = recordings.filter(
        (rec) =>
          rec.supportPersonName.toLowerCase().includes("sangeet") ||
          (rec.supportPersonName.toLowerCase().includes("shaw") && !rec.supportPersonPhone.includes("8981191734"))
      );
    }

    const todayCount = agentFiltered.filter((r) => getISTDateString(r.createdAt || r.callStartTime) === todayIST).length;
    const yestCount = agentFiltered.filter((r) => getISTDateString(r.createdAt || r.callStartTime) === yesterdayIST).length;
    const allCount = agentFiltered.length;

    return { todayCount, yestCount, allCount };
  }, [recordings, selectedAgent, todayIST, yesterdayIST]);

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

      // 3. Search Query (matches phone, customer, device, quote, agent, outcome, notes)
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match =
          rec.customerPhone.includes(q) ||
          rec.customerName?.toLowerCase().includes(q) ||
          rec.deviceName?.toLowerCase().includes(q) ||
          rec.quoteId?.toLowerCase().includes(q) ||
          rec.supportPersonName.toLowerCase().includes(q) ||
          rec.supportPersonPhone.includes(q) ||
          rec.callOutcome.toLowerCase().includes(q) ||
          rec.callNotes?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [recordings, selectedAgent, dateFilter, search, todayIST, yesterdayIST]);

  // Aggregate Metrics for currently filtered list
  const metrics = useMemo(() => {
    const totalCalls = filteredRecordings.length;
    const totalTalkSeconds = filteredRecordings.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);
    const completedCalls = filteredRecordings.filter(
      (r) =>
        r.callOutcome === "CALL_COMPLETED" ||
        r.callOutcome === "CUSTOMER_INTERESTED" ||
        r.durationSeconds > 0
    ).length;
    const avgSeconds = totalCalls > 0 ? Math.round(totalTalkSeconds / totalCalls) : 0;

    return {
      totalCalls,
      totalTalkFormatted: formatDurationHuman(totalTalkSeconds),
      completedCalls,
      avgDurationFormatted: formatDurationHuman(avgSeconds),
    };
  }, [filteredRecordings]);

  // Copy notes to clipboard
  const handleCopyNotes = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  // Copy quote ID to clipboard
  const handleCopyQuote = (quoteId: string) => {
    if (!quoteId) return;
    navigator.clipboard.writeText(quoteId);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

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
      "Call Outcome",
      "Call Result / Reason Notes",
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
      `"${formatCallOutcome(r.callOutcome)}"`,
      `"${(r.callNotes || "").replace(/"/g, '""')}"`,
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
              Live customer call records &amp; conversation outcomes logged by support team members. Click on any call result to inspect details.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              disabled={filteredRecordings.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <div className="flex flex-col items-end">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Calls</span>
              </button>
              {lastUpdated && (
                <span className="text-[10px] text-neutral-500 font-mono mt-1">
                  Updated: {lastUpdated}
                </span>
              )}
            </div>
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
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                dateFilter === "TODAY"
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "bg-neutral-900 hover:bg-neutral-750 text-neutral-300 border border-neutral-700"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>TODAY ({filterCounts.todayCount})</span>
            </button>

            <button
              onClick={() => setDateFilter("YESTERDAY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                dateFilter === "YESTERDAY"
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "bg-neutral-900 hover:bg-neutral-750 text-neutral-300 border border-neutral-700"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>YESTERDAY ({filterCounts.yestCount})</span>
            </button>

            <button
              onClick={() => setDateFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                dateFilter === "ALL"
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "bg-neutral-900 hover:bg-neutral-750 text-neutral-300 border border-neutral-700"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>ALL TIME ({filterCounts.allCount})</span>
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search phone, customer, notes, outcome..."
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
              <div className="text-sm font-bold text-white">No call logs match this filter</div>
              {recordings.length > 0 ? (
                <>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    No calls found for <span className="text-yellow-400 font-bold">{selectedAgent}</span> on{" "}
                    <span className="text-white font-bold">{dateFilter}</span>. There are{" "}
                    <span className="text-emerald-400 font-bold">{recordings.length} total call records</span> in the
                    database.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedAgent("ALL");
                        setDateFilter("ALL");
                        setSearch("");
                      }}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-md cursor-pointer"
                    >
                      Show All Calls ({recordings.length})
                    </button>
                    {dateFilter !== "ALL" && (
                      <button
                        onClick={() => setDateFilter("ALL")}
                        className="bg-neutral-750 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-neutral-600 transition cursor-pointer"
                      >
                        Switch to ALL TIME
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Connecting to Supabase call records... If calls were just made, click refresh to fetch the latest sync.
                  </p>
                  <button
                    onClick={fetchLogs}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-md cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Now</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[28%]" />
                  <col className="w-[14%]" />
                  <col className="w-[9%]" />
                  <col className="w-[25%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-neutral-700 bg-neutral-850/60 text-neutral-400 uppercase tracking-wider font-extrabold text-[10px] sm:text-[11px]">
                    <th className="py-2.5 px-2">Support Agent</th>
                    <th className="py-2.5 px-2">Customer &amp; Device</th>
                    <th className="py-2.5 px-2">Date &amp; Time</th>
                    <th className="py-2.5 px-2">Duration</th>
                    <th className="py-2.5 px-2">Call Result &amp; Reason</th>
                    <th className="py-2.5 px-2 text-right">Dial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/60 text-xs">
                  {filteredRecordings.map((rec) => {
                    const dt = formatCallDateTime(rec.createdAt, rec.createdAtIST || rec.callTimeIST);
                    return (
                      <tr key={rec.id} className="hover:bg-neutral-750/50 transition">
                        {/* AGENT */}
                        <td className="py-2.5 px-2 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-neutral-700 flex items-center justify-center font-black text-[11px] text-yellow-400 shrink-0">
                              {rec.supportPersonName.charAt(0) || "A"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate" title={rec.supportPersonName}>
                                {rec.supportPersonName}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono truncate">
                                {rec.supportPersonPhone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CUSTOMER & DEVICE */}
                        <td className="py-2.5 px-2 min-w-0">
                          <div className="font-bold text-white text-xs flex items-center gap-1 truncate" title={rec.customerName || "Customer Lead"}>
                            <User className="w-3 h-3 text-yellow-400 shrink-0" />
                            <span className="truncate">{rec.customerName || "Customer Lead"}</span>
                          </div>
                          <div className="text-[10px] text-neutral-300 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                            <span>{rec.customerPhone}</span>
                          </div>
                          {rec.deviceName && rec.deviceName !== "—" && (
                            <div className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 mt-0.5 truncate" title={rec.deviceName}>
                              <Smartphone className="w-2.5 h-2.5 text-yellow-400 shrink-0" />
                              <span className="truncate">{rec.deviceName}</span>
                            </div>
                          )}
                          {rec.quoteId && rec.quoteId !== "N/A" && (
                            <div className="inline-block text-[9px] font-mono text-yellow-400 font-bold bg-yellow-950/60 border border-yellow-800/80 px-1.5 py-0.2 rounded mt-0.5">
                              Quote: {rec.quoteId}
                            </div>
                          )}
                        </td>

                        {/* DATE & TIME (IST) */}
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <div className="font-mono">
                            <div className="text-xs font-bold text-white">{dt.date}</div>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5 text-yellow-400/80 shrink-0" />
                              <span>{dt.time}</span>
                            </div>
                          </div>
                        </td>

                        {/* DURATION & AUDIO BADGE */}
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1 bg-amber-950/80 border border-amber-800 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-lg text-[10px]">
                              <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span>{rec.durationFormatted}</span>
                            </span>
                            {rec.audioUrl && (
                              <button
                                type="button"
                                onClick={() => handleOpenCallModal(rec)}
                                className="inline-flex items-center gap-1 bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-900 font-bold px-1.5 py-0.5 rounded-md text-[9px] transition cursor-pointer"
                                title="HD Recording Available - Click to Listen"
                              >
                                <Volume2 className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                                <span>HD Audio</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* CALL RESULT / OUTCOME BADGE WITH CLICKABLE POPUP */}
                        <td className="py-2.5 px-2 min-w-0">
                          <div className="space-y-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleOpenCallModal(rec)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer ${getOutcomeBadgeStyle(
                                rec.callOutcome
                              )}`}
                              title="Click to view full conversation details and agent notes"
                            >
                              {getOutcomeIcon(rec.callOutcome)}
                              <span className="truncate">{formatCallOutcome(rec.callOutcome)}</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70 shrink-0" />
                            </button>

                            {/* REASON / NOTES PREVIEW */}
                            {rec.callNotes && (
                              <div
                                onClick={() => handleOpenCallModal(rec)}
                                className="text-[10px] text-neutral-400 hover:text-neutral-200 truncate italic cursor-pointer flex items-center gap-1 transition"
                                title={`Click to view: "${rec.callNotes}"`}
                              >
                                <MessageSquare className="w-2.5 h-2.5 text-yellow-400/80 shrink-0" />
                                <span className="truncate">"{rec.callNotes}"</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* QUICK CALL ACTION */}
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          {rec.customerPhone && rec.customerPhone !== "—" ? (
                            <a
                              href={`tel:${rec.customerPhone}`}
                              className="inline-flex items-center gap-1 text-[10px] font-extrabold text-black bg-yellow-400 hover:bg-yellow-300 px-2.5 py-1 rounded-lg transition shadow-sm cursor-pointer"
                              title={`Dial ${rec.customerPhone}`}
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          ) : (
                            <span className="text-neutral-500 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* DETAILED RESULT AND REASON POPUP MODAL */}
      {selectedCall && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCall(null);
          }}
        >
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 my-8 text-white relative">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Call Result &amp; Reason Details</h3>
                  <p className="text-[11px] text-neutral-400">
                    Logged by <span className="font-bold text-yellow-400">{selectedCall.supportPersonName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 p-2 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QUICK INFO STRIP */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Quote ID</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-yellow-400 text-sm">{selectedCall.quoteId || "N/A"}</span>
                  {selectedCall.quoteId && selectedCall.quoteId !== "N/A" && (
                    <button
                      onClick={() => handleCopyQuote(selectedCall.quoteId || "")}
                      className="text-neutral-400 hover:text-yellow-400 text-[10px] flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedQuote ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Call Timestamp</span>
                <span className="font-mono text-neutral-200 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span>{formatCallDateTime(selectedCall.createdAt, selectedCall.createdAtIST || selectedCall.callTimeIST).full}</span>
                </span>
              </div>
            </div>

            {/* PARTICIPANTS DETAILS */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3 text-xs">
              {/* SUPPORT AGENT */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-yellow-400 text-black font-black text-xs flex items-center justify-center">
                    {selectedCall.supportPersonName.charAt(0) || "A"}
                  </div>
                  <div>
                    <div className="font-bold text-white">{selectedCall.supportPersonName}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">Support Executive ({selectedCall.supportPersonPhone})</div>
                  </div>
                </div>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-2 py-0.5 rounded-full border border-neutral-700">
                  Duration: {selectedCall.durationFormatted}
                </span>
              </div>

              {/* CUSTOMER & DEVICE */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Customer Name &amp; Phone:</span>
                  <div className="font-extrabold text-white text-sm">{selectedCall.customerName || "Customer Lead"}</div>
                  <div className="font-mono text-neutral-300 text-xs mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    <span>{selectedCall.customerPhone}</span>
                  </div>
                </div>

                {selectedCall.customerPhone && selectedCall.customerPhone !== "—" && (
                  <a
                    href={`tel:${selectedCall.customerPhone}`}
                    className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Dial Now</span>
                  </a>
                )}
              </div>

              {selectedCall.deviceName && selectedCall.deviceName !== "—" && (
                <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                  <Smartphone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>{selectedCall.deviceName}</span>
                </div>
              )}
            </div>

            {/* SUCCESS BANNER WHEN NOTES UPDATED */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">{saveSuccessMsg}</span>
              </div>
            )}

            {/* CALL OUTCOME BANNER */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Selected Call Outcome:
                </span>
                {!isEditingReason && (
                  <button
                    onClick={() => setIsEditingReason(true)}
                    className="text-[10px] text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1 bg-yellow-400/10 hover:bg-yellow-400/20 px-2 py-0.5 rounded-lg border border-yellow-400/30 transition cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change Outcome &amp; Notes</span>
                  </button>
                )}
              </div>
              <div
                className={`flex items-center gap-2 p-3.5 rounded-2xl border text-sm font-black uppercase tracking-wide shadow-md ${getOutcomeBadgeStyle(
                  selectedCall.callOutcome
                )}`}
              >
                {getOutcomeIcon(selectedCall.callOutcome)}
                <span>{formatCallOutcome(selectedCall.callOutcome)}</span>
              </div>
            </div>

            {/* DETAILED RESULT & REASON NOTE (PRIMARY REQUIREMENT) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-400">
                  <MessageSquare className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Agent Notes &amp; Conversation Reason:</span>
                </div>
                {!isEditingReason && selectedCall.callNotes && (
                  <button
                    onClick={() => handleCopyNotes(selectedCall.callNotes)}
                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedNotes ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Reason</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* INLINE EDIT FORM OR DISPLAY */}
              {isEditingReason ? (
                <div className="bg-neutral-950 border border-yellow-400/40 rounded-2xl p-4 space-y-3.5 shadow-lg">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">Update Call Outcome:</label>
                    <select
                      value={editOutcome}
                      onChange={(e) => setEditOutcome(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-yellow-400 cursor-pointer"
                    >
                      <option value="CUSTOMER_INTERESTED">Customer Interested (Proceeding with Booking)</option>
                      <option value="CALL_COMPLETED">Call Completed / Discussed Valuation</option>
                      <option value="PRICE_NEGOTIATION">Price Negotiation (Customer Demands Higher Price)</option>
                      <option value="RE-SCHEDULED_VISIT">Requested Re-scheduled Visit Time</option>
                      <option value="RESOLVED_ISSUE">Resolved Customer Inquiry / Question</option>
                      <option value="NO_ANSWER">No Answer / Line Busy / Switched Off</option>
                      <option value="NOT_INTERESTED">Not Interested / Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Detailed Conversation Reason &amp; Remarks:
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="e.g. Customer agreed to sell at ₹18,000. Wants pickup tomorrow 11 AM..."
                      className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-yellow-400 transition"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingReason(false)}
                      className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveReason}
                      disabled={savingReason}
                      className="w-1/2 flex items-center justify-center gap-1.5 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl transition shadow cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingReason ? "Saving..." : "Save Call Reason"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {selectedCall.callNotes && !selectedCall.callNotes.includes("CashALL Caller App") ? (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 relative shadow-inner">
                      <p className="text-neutral-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                        "{selectedCall.callNotes}"
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs space-y-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                        <span>No detailed conversation reason recorded yet</span>
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        This call was logged via the caller app. Add the discussion notes and customer outcome below:
                      </p>
                      <button
                        onClick={() => {
                          setIsEditingReason(true);
                          setEditOutcome(selectedCall.callOutcome || "CUSTOMER_INTERESTED");
                          setEditNotes("");
                        }}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>+ Add Detailed Reason &amp; Outcome</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* AUDIO RECORDING (IF AVAILABLE) */}
            {selectedCall.audioUrl ? (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-emerald-900/60 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>HD 2-Way Call Audio Recording</span>
                  </div>
                  <a
                    href={selectedCall.audioUrl}
                    download={`CashALL_Call_${selectedCall.customerPhone || "lead"}_${selectedCall.id}.m4a`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-neutral-400 hover:text-yellow-400 flex items-center gap-1 transition"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Audio</span>
                  </a>
                </div>
                <audio controls src={selectedCall.audioUrl} className="w-full h-9 rounded-lg" />
              </div>
            ) : (
              <div className="bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800/80 text-neutral-400 text-xs flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-neutral-500 opacity-60 shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-neutral-300">No Audio File:</strong> Call was logged via caller app. To enable automatic HD audio capture, turn ON <span className="text-yellow-400 font-semibold">'Auto-record calls'</span> in Phone Dialer Settings.
                </div>
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedCall(null)}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
