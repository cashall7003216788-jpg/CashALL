"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Headset,
  Plus,
  Loader2,
  Phone,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  UserPlus,
  Download,
  Printer,
  ExternalLink,
  MessageSquare,
  Volume2,
  Clock,
  Radio,
  Smartphone,
  Copy,
  Check,
  PhoneCall,
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
  audioUrl: string;
  callOutcome: string;
  callNotes: string;
  callStartTime: string;
  callEndTime: string;
  createdAtIST: string;
}

interface SupportStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  loginPassword?: string;
  createdAt: string;
  callsCount?: number;
  totalTalkTime?: string;
  recordingsCount?: number;
  lastLoginTime?: string;
  lastLogoutTime?: string;
  sessionStatus?: string;
}

interface SupportSessionLog {
  id: string;
  action: string;
  staffName: string;
  phone: string;
  event: string;
  timestamp: string;
}

export default function AdminSupportManagementPage() {
  const [supportStaff, setSupportStaff] = useState<SupportStaff[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SupportSessionLog[]>([]);
  const [recordings, setRecordings] = useState<CallRecordingItem[]>([]);
  const [recordingSearch, setRecordingSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State: Full Name, User Name, Phone Number, Password
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    password: "",
  });

  const fetchStaff = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/v1/admin/support");
      const json = await res.json();
      if (json.success) {
        const staff = json.supportStaff || [];
        const sessions = json.sessionLogs || [];
        const recs = json.recordings || [];
        setSupportStaff(staff);
        setSessionLogs(sessions);
        setRecordings(recs);

        try {
          sessionStorage.setItem("cashall_admin_support_staff", JSON.stringify(staff));
          sessionStorage.setItem("cashall_admin_support_sessions", JSON.stringify(sessions));
          sessionStorage.setItem("cashall_admin_support_recs", JSON.stringify(recs));
        } catch {}
      } else {
        setError(json.error || "Failed to fetch support staff");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching support staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const cachedStaff = sessionStorage.getItem("cashall_admin_support_staff");
      const cachedSessions = sessionStorage.getItem("cashall_admin_support_sessions");
      const cachedRecs = sessionStorage.getItem("cashall_admin_support_recs");
      if (cachedStaff) {
        setSupportStaff(JSON.parse(cachedStaff));
        if (cachedSessions) setSessionLogs(JSON.parse(cachedSessions));
        if (cachedRecs) setRecordings(JSON.parse(cachedRecs));
        setLoading(false);
      }
    } catch {}
    fetchStaff();
  }, [fetchStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!formData.username.trim()) {
      setError("User Name is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone Number is required.");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v1/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess(`✅ Support staff "${formData.name}" registered successfully!`);
        setFormData({
          name: "",
          username: "",
          phone: "",
          password: "",
        });
        fetchStaff();
      } else {
        setError(json.error || "Failed to create support staff.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCSV = () => {
    if (supportStaff.length === 0) return;
    const headers = [
      "Support Staff Name",
      "Email / User Name",
      "Phone Number",
      "Login Password",
      "Session Status",
      "Last Log In (Date & Time)",
      "Last Log Out (Date & Time)",
      "Customer Calls Logged",
      "Created Date",
    ];
    const rows = supportStaff.map((s) => [
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      `"=""${s.phone || ""}"""`,
      `"${(s.loginPassword || s.phone || "Ank933967@").replace(/"/g, '""')}"`,
      `"${s.sessionStatus || "OFFLINE"}"`,
      `"${(s.lastLoginTime || "—").replace(/"/g, '""')}"`,
      `"${(s.lastLogoutTime || "—").replace(/"/g, '""')}"`,
      s.callsCount || 0,
      `"${new Date(s.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CashALL_Support_Team_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSessionLogsCSV = () => {
    if (sessionLogs.length === 0) return;
    const headers = ["Staff Name", "Session Event", "Date & Time (IST)", "Contact Phone"];
    const rows = sessionLogs.map((l) => [
      `"${(l.staffName || "").replace(/"/g, '""')}"`,
      `"${(l.event || "").replace(/"/g, '""')}"`,
      `"${(l.timestamp || "").replace(/"/g, '""')}"`,
      `"=""${l.phone || ""}"""`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CashALL_Support_Attendance_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (typeof document !== "undefined") {
      document.title = `CashALL_Support_Team_Management_${new Date().toISOString().slice(0, 10)}`;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-xl print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <Headset className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-white tracking-wide font-price">
                Support Team Console
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Register support personnel, manage access credentials, and monitor customer call productivity.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/support/calls"
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-4 py-2.5 rounded-xl transition shadow-md"
            >
              <Radio className="w-4 h-4 text-black animate-pulse" />
              <span>Call Logs ({recordings.length})</span>
            </Link>

            <Link
              href="/support/dashboard"
              target="_blank"
              className="flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
              <span>Support App</span>
            </Link>

            <button
              onClick={handleDownloadCSV}
              disabled={supportStaff.length === 0}
              className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={fetchStaff}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2.5 rounded-xl border border-neutral-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK NOTIFICATIONS */}
        {error && (
          <div className="flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-300 text-xs p-4 rounded-2xl font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-4 rounded-2xl font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* 2-COLUMN LAYOUT: REGISTRATION FORM + ACTIVE STAFF CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* REGISTRATION FORM */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-4 print:hidden">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <UserPlus className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-extrabold text-white">Create Staff Member</h2>
            </div>
            <p className="text-xs text-neutral-400">
              Provide credentials for support agents to log into the CashALL Support App.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ankan Ghosh"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  User Name / Email Handle
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., ankan or ankan@cashall.in"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Official Phone Number (10 Digits)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g., 9339676767"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                    maxLength={10}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Login Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Set login password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-yellow-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-yellow-400 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs py-3 rounded-xl transition shadow-md disabled:opacity-60 mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Register Support Staff</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ACTIVE SUPPORT STAFF CARDS */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Headset className="w-5 h-5 text-yellow-400" />
                <span>Active Support Team ({supportStaff.length})</span>
              </h2>
              <span className="text-xs text-neutral-400 font-mono">Real-time Session Status</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                <span className="ml-2 text-xs text-neutral-400 font-semibold">Loading support staff...</span>
              </div>
            ) : supportStaff.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                No support team staff members registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {supportStaff.map((staff) => {
                  const password = staff.loginPassword || staff.phone || "Ank933967@";
                  const isOnline = staff.sessionStatus === "ONLINE";

                  return (
                    <div
                      key={staff.id}
                      className="bg-neutral-950 border border-neutral-800/90 hover:border-neutral-700 transition rounded-2xl p-4 space-y-3 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* HEADER: NAME + ONLINE STATUS */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-bold text-xs shrink-0 border border-yellow-400/20">
                              {staff.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-white text-sm truncate">{staff.name}</h3>
                              <p className="text-[11px] text-neutral-400 truncate">{staff.email}</p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                              isOnline
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700/60"
                                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOnline ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"
                              }`}
                            />
                            <span>{staff.sessionStatus || "OFFLINE"}</span>
                          </span>
                        </div>

                        {/* PHONE & DIRECT CALL */}
                        <div className="mt-3 flex items-center justify-between gap-2 bg-neutral-900/80 px-3 py-2 rounded-xl border border-neutral-800/80">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="font-mono text-xs text-neutral-200">{staff.phone}</span>
                          </div>
                          {staff.phone && (
                            <a
                              href={`tel:${staff.phone}`}
                              className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 transition"
                            >
                              Direct Call
                            </a>
                          )}
                        </div>

                        {/* PASSWORD BADGE WITH 1-TAP COPY */}
                        <div className="mt-2.5 flex items-center justify-between gap-2 bg-neutral-900/60 px-3 py-2 rounded-xl border border-neutral-800/60">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Password:
                          </span>
                          <button
                            type="button"
                            onClick={() => copyPassword(staff.id, password)}
                            className="flex items-center gap-1.5 font-mono text-xs text-yellow-400 hover:text-yellow-300 transition bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20"
                            title="Click to copy password"
                          >
                            <span>{password}</span>
                            {copiedId === staff.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-yellow-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* STATS FOOTER */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1 font-semibold text-white">
                          <PhoneCall className="w-3.5 h-3.5 text-yellow-400" />
                          <span>{staff.callsCount || 0} Calls</span>
                        </div>
                        {staff.totalTalkTime && (
                          <div className="flex items-center gap-1 font-mono text-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>{staff.totalTalkTime}</span>
                          </div>
                        )}
                        <span className="text-[10px] font-mono text-neutral-500">
                          {staff.lastLoginTime ? `Active: ${staff.lastLoginTime.split(" ")[0]}` : "No login yet"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SUPPORT ATTENDANCE & SESSION AUDIT LOG CARDS */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                <span>Support Attendance &amp; Activity Stream ({sessionLogs.length})</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exact log in and log out timestamps recorded for support staff members
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSessionLogsCSV}
                disabled={sessionLogs.length === 0}
                className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/20 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Attendance CSV</span>
              </button>
              <button
                onClick={fetchStaff}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 px-3 py-1.5 rounded-xl border border-yellow-400/20 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {sessionLogs.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No recent session logs recorded. Activity will automatically log when staff signs in or signs out.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessionLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span className="font-extrabold text-white text-xs truncate">{log.staffName}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        log.action === "SUPPORT_LOGIN"
                          ? "bg-green-950 text-green-400 border border-green-700/60"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          log.action === "SUPPORT_LOGIN" ? "bg-green-400 animate-pulse" : "bg-neutral-500"
                        }`}
                      />
                      <span>{log.event}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1 border-t border-neutral-800/80">
                    <span>{log.timestamp}</span>
                    <span>{log.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOMER CALL LOGS CARDS */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span>Customer Call Logs ({recordings.length})</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Synced automatically by CashALL Caller App with duration, outcomes, and timestamps
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/admin/support/calls"
                className="inline-flex items-center gap-1.5 text-xs text-black font-extrabold bg-yellow-400 hover:bg-yellow-300 px-3.5 py-1.5 rounded-xl transition shadow-md"
              >
                <span>Dedicated Audio Logs →</span>
              </Link>
              <input
                type="text"
                placeholder="Search phone or agent..."
                value={recordingSearch}
                onChange={(e) => setRecordingSearch(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-yellow-400 transition"
              />
              <button
                onClick={fetchStaff}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-xl font-bold transition border border-neutral-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {recordings.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              No customer calls logged yet. Once the caller app dials customers, call logs will appear here automatically.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {recordings
                .filter((rec) => {
                  if (!recordingSearch.trim()) return true;
                  const q = recordingSearch.toLowerCase();
                  return (
                    rec.customerPhone.includes(q) ||
                    rec.customerName?.toLowerCase().includes(q) ||
                    rec.deviceName?.toLowerCase().includes(q) ||
                    rec.supportPersonName.toLowerCase().includes(q) ||
                    rec.supportPersonPhone.includes(q) ||
                    rec.quoteId?.toLowerCase().includes(q)
                  );
                })
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition rounded-2xl p-4 space-y-3 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* CALL HEADER: AGENT & OUTCOME */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <span className="font-bold text-white text-xs truncate">{rec.supportPersonName}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">{rec.supportPersonPhone}</span>
                        </div>

                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                            rec.callOutcome === "CALL_COMPLETED"
                              ? "bg-emerald-950 border-emerald-700/70 text-emerald-400"
                              : rec.callOutcome === "CUSTOMER_INTERESTED"
                              ? "bg-blue-950 border-blue-700/70 text-blue-400"
                              : "bg-neutral-900 border-neutral-800 text-neutral-300"
                          }`}
                        >
                          {rec.callOutcome.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* CUSTOMER & DEVICE */}
                      <div className="mt-3 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs truncate">
                            {rec.customerName || "Customer Lead"}
                          </span>
                          <a
                            href={`tel:${rec.customerPhone}`}
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-xs flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{rec.customerPhone}</span>
                          </a>
                        </div>

                        {rec.deviceName && rec.deviceName !== "—" && (
                          <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5 truncate">
                            <Smartphone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <span className="truncate">{rec.deviceName}</span>
                          </div>
                        )}

                        {rec.quoteId && rec.quoteId !== "N/A" && (
                          <div className="inline-block text-[10px] font-mono text-yellow-400 font-extrabold bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded mt-0.5">
                            Quote: {rec.quoteId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FOOTER: DURATION & TIMESTAMP */}
                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">{rec.createdAtIST}</span>
                      <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{rec.durationFormatted}</span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
