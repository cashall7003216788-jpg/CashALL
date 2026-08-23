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
} from "lucide-react";

interface SupportStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  callsCount?: number;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form State: Full Name, User Name, Phone Number, Password
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    password: "",
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/support");
      const json = await res.json();
      if (json.success) {
        setSupportStaff(json.supportStaff || []);
        setSessionLogs(json.sessionLogs || []);
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

  const handleDownloadCSV = () => {
    if (supportStaff.length === 0) return;
    const headers = ["Support Staff Name", "Email / User Name", "Phone", "Status", "Customer Calls Logged", "Created Date"];
    const rows = supportStaff.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      s.phone,
      s.status,
      s.callsCount || 0,
      new Date(s.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" }),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CashALL_Support_Team_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="min-h-screen bg-neutral-900 text-white flex">
      <AdminSidebar />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <Headset className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
                Support Team Management
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Create support staff credentials, manage user names and passwords, and monitor customer call performance.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/support/dashboard"
              target="_blank"
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
              <span>Open Support Console</span>
            </Link>

            <button
              onClick={handleDownloadCSV}
              disabled={supportStaff.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={supportStaff.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={fetchStaff}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Staff</span>
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
          <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs p-4 rounded-2xl font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* MAIN 2-COLUMN GRID: FORM + STAFF LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1: ONBOARDING FORM */}
          <div className="lg:col-span-1 bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-5 h-fit print:hidden">
            <div className="border-b border-neutral-700 pb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-extrabold text-white">Add New Support Staff</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sangeet Shaw"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* USER NAME */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  User Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. SANGEET SHAW"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 7003216788"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Login Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter Password (e.g. Ank933967@)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-yellow-400 transition"
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
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs py-3 rounded-xl transition shadow-yellowGlow disabled:opacity-60 mt-2"
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

          {/* COLUMN 2: ACTIVE SUPPORT STAFF TABLE */}
          <div className="lg:col-span-2 bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Headset className="w-5 h-5 text-blue-400" />
                <span>Active Support Team Staff ({supportStaff.length})</span>
              </h2>
              <span className="text-xs text-neutral-400 font-mono">Recorded in Database</span>
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-700 text-neutral-400 uppercase tracking-wider font-extrabold print:text-black print:border-gray-300">
                      <th className="py-3 px-3">Staff Name</th>
                      <th className="py-3 px-3">Phone & Email</th>
                      <th className="py-3 px-3">Session Status</th>
                      <th className="py-3 px-3">Last Log In</th>
                      <th className="py-3 px-3">Last Log Out</th>
                      <th className="py-3 px-3">Calls Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/60 print:divide-gray-200">
                    {supportStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-neutral-750/50 transition">
                        <td className="py-4 px-3">
                          <div className="font-bold text-white flex items-center gap-1.5 print:text-black">
                            <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <span>{staff.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="text-neutral-300 font-mono text-xs">{staff.phone}</div>
                          <div className="text-neutral-400 text-[11px]">{staff.email}</div>
                        </td>
                        <td className="py-4 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            staff.sessionStatus === "ONLINE"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${staff.sessionStatus === "ONLINE" ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
                            <span>{staff.sessionStatus || "OFFLINE"}</span>
                          </span>
                        </td>
                        <td className="py-4 px-3 text-green-400 font-medium text-[11px] whitespace-nowrap">
                          {staff.lastLoginTime || "—"}
                        </td>
                        <td className="py-4 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                          {staff.lastLogoutTime || "—"}
                        </td>
                        <td className="py-4 px-3">
                          <div className="inline-flex items-center gap-1 bg-blue-950/80 border border-blue-800 text-blue-300 px-2.5 py-1 rounded-xl text-xs font-bold font-mono">
                            <MessageSquare className="w-3 h-3 text-blue-400" />
                            <span>{staff.callsCount || 0} Calls</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SUPPORT LOGIN & LOGOUT ATTENDANCE AUDIT LOG */}
        <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                <span>Support Team Attendance & Session Audit Log ({sessionLogs.length})</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exact log in and log out timestamps recorded for support staff members
              </p>
            </div>
            <button
              onClick={fetchStaff}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 px-3 py-1.5 rounded-xl border border-yellow-400/20 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Sessions</span>
            </button>
          </div>

          {sessionLogs.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No recent session logs recorded. Activity will automatically log when staff signs in or signs out.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 text-neutral-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-3">Staff Name</th>
                    <th className="py-3 px-3">Session Event</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Contact Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/60">
                  {sessionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-750/50 transition">
                      <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{log.staffName}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          log.action === "SUPPORT_LOGIN"
                            ? "bg-green-950 text-green-400 border border-green-700"
                            : "bg-neutral-800 text-neutral-300 border border-neutral-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${log.action === "SUPPORT_LOGIN" ? "bg-green-400 animate-pulse" : "bg-neutral-400"}`} />
                          <span>{log.event}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-neutral-200 font-mono text-xs">
                        {log.timestamp}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-400 font-mono">
                        {log.phone}
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
