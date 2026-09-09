"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  UserCheck,
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
  PhoneCall,
  Volume2,
  Download,
  Search,
  X,
  Clock,
  Calendar,
  Smartphone,
  Copy,
} from "lucide-react";

interface Agent {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  status: string;
  createdAt: string;
  _count?: {
    assignedOrders: number;
  };
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Agent Call Logs Modal State
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loadingCallLogs, setLoadingCallLogs] = useState(false);
  const [callSearchTerm, setCallSearchTerm] = useState("");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("ALL");
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State: Full Name, User Name, Phone Number, Password
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    password: "",
  });

  const fetchCallLogs = useCallback(async () => {
    setLoadingCallLogs(true);
    try {
      const res = await fetch(`/api/v1/support/recordings?role=AGENT&t=${Date.now()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.recordings)) {
        // Strict frontend protection: only field agents, never support staff (Harshita)
        const agentOnlyCalls = json.recordings.filter((c: any) => {
          const name = (c.supportPersonName || "").toLowerCase();
          const phone = c.supportPersonPhone || "";
          if (name.includes("harshita") || phone.includes("8981191734")) {
            return false;
          }
          return true;
        });
        setCallLogs(agentOnlyCalls);
      }
    } catch (err) {
      console.error("Failed to fetch agent call logs:", err);
    } finally {
      setLoadingCallLogs(false);
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/agents");
      const json = await res.json();
      if (json.success) {
        setAgents(json.agents || []);
      } else {
        setError(json.error || "Failed to fetch agents");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Agent Full Name is required.");
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
      const res = await fetch("/api/v1/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess(`✅ Agent "${formData.name}" (Username: ${formData.username}) created successfully!`);
        setFormData({ name: "", username: "", phone: "", password: "" });
        await fetchAgents();
      } else {
        setError(json.error || "Failed to create agent.");
      }
    } catch (err: any) {
      setError(err.message || "Error submitting form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
                Agent Management Console
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Onboard Field Agents with Full Name, User Name, Phone & Password for Portal Access
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="/CashALL-Agent.apk"
              download="CashALL-Agent.apk"
              className="flex items-center gap-2 text-xs font-bold text-white bg-neutral-700 hover:bg-neutral-600 px-3.5 py-2.5 rounded-xl transition border border-neutral-600 shadow-md cursor-pointer"
              title="Download Latest CashALL Agent APK (v1.0.3)"
            >
              <Download className="w-3.5 h-3.5 text-yellow-400" />
              <span>Agent APK (v1.0.3)</span>
            </a>

            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText("https://cashall.in/download/agent");
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 px-3.5 py-2.5 rounded-xl transition cursor-pointer"
              title="Copy Agent Download Link to share with agents"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
            </button>

            <button
              onClick={() => {
                setShowCallLogModal(true);
                fetchCallLogs();
              }}
              className="flex items-center gap-2 text-xs font-black text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-yellowGlow cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>AGENT CALL LOG</span>
            </button>

            <button
              onClick={fetchAgents}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-neutral-300 bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh List</span>
            </button>
          </div>
        </div>

        {/* GRID LAYOUT: FORM + AGENTS TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CREATE AGENT FORM */}
          <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-700">
              <Plus className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-extrabold text-white">Register New Field Agent</h2>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-xl font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* AGENT FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Agent Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. HYDER ALI"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* USER NAME */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">User Name (For Login)</label>
                <div className="relative">
                  <UserPlus className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. hyderali or HYDER ALI"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Login Password for Agent Portal"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-9 pr-9 py-2.5 focus:outline-none focus:border-yellow-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-yellow-400 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs py-3 rounded-xl transition shadow-lg disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Register Agent (Role: AGENT)</span>
              </button>
            </form>
          </div>

          {/* AGENTS LIST TABLE */}
          <div className="lg:col-span-2 bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-700">
              <h2 className="text-base font-extrabold text-white">
                Active Field Agents ({agents.length})
              </h2>
              <span className="text-[11px] text-neutral-400">Supabase & Prisma Verified</span>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
                <span className="text-xs text-neutral-400">Loading registered agents...</span>
              </div>
            ) : agents.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                No field agents registered yet. Use the form on the left to add your first field agent.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-700 text-neutral-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Agent Full Name</th>
                      <th className="py-3 px-3">Mobile Number</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Leads Assigned</th>
                      <th className="py-3 px-3">Date Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/60">
                    {agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-neutral-750/50 transition">
                        <td className="py-3.5 px-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <span>{agent.name || "Field Agent"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-neutral-300 font-mono">
                          {agent.phone || "—"}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            {agent.status || "ACTIVE"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-yellow-400">
                          {agent._count?.assignedOrders ?? 0} Orders
                        </td>
                        <td className="py-3.5 px-3 text-neutral-400">
                          {new Date(agent.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* AGENT CALL LOGS MODAL */}
        {showCallLogModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-700 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-850">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl">
                    <PhoneCall className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <span>Agent Call Log &amp; Audio Recordings</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                        {callLogs.filter((c) => {
                          if (selectedAgentFilter !== "ALL") {
                            const matchAgent =
                              c.supportPersonName?.toLowerCase().includes(selectedAgentFilter.toLowerCase()) ||
                              c.supportPersonPhone?.includes(selectedAgentFilter);
                            if (!matchAgent) return false;
                          }
                          if (!callSearchTerm.trim()) return true;
                          const q = callSearchTerm.toLowerCase();
                          return (
                            c.customerName?.toLowerCase().includes(q) ||
                            c.customerPhone?.toLowerCase().includes(q) ||
                            c.deviceName?.toLowerCase().includes(q) ||
                            c.quoteId?.toLowerCase().includes(q) ||
                            c.supportPersonName?.toLowerCase().includes(q) ||
                            c.supportPersonPhone?.toLowerCase().includes(q)
                          );
                        }).length} Calls
                      </span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Verified customer doorstep coordination calls logged &amp; recorded via CashALL Agent App
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCallLogModal(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={callSearchTerm}
                    onChange={(e) => setCallSearchTerm(e.target.value)}
                    placeholder="Search customer name, phone, device, order # or agent..."
                    className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedAgentFilter}
                    onChange={(e) => setSelectedAgentFilter(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-yellow-400 transition cursor-pointer"
                  >
                    <option value="ALL">All Field Agents</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.name || ag.phone}>
                        {ag.name || "Agent"} ({ag.phone})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={fetchCallLogs}
                    disabled={loadingCallLogs}
                    className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-neutral-700 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCallLogs ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* CALLS LIST CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {loadingCallLogs ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-3" />
                    <p className="text-xs text-neutral-400">Loading call recordings &amp; logs...</p>
                  </div>
                ) : (
                  (() => {
                    const filtered = callLogs.filter((c) => {
                      if (selectedAgentFilter !== "ALL") {
                        const matchAgent =
                          c.supportPersonName?.toLowerCase().includes(selectedAgentFilter.toLowerCase()) ||
                          c.supportPersonPhone?.includes(selectedAgentFilter);
                        if (!matchAgent) return false;
                      }
                      if (!callSearchTerm.trim()) return true;
                      const q = callSearchTerm.toLowerCase();
                      return (
                        c.customerName?.toLowerCase().includes(q) ||
                        c.customerPhone?.toLowerCase().includes(q) ||
                        c.deviceName?.toLowerCase().includes(q) ||
                        c.quoteId?.toLowerCase().includes(q) ||
                        c.supportPersonName?.toLowerCase().includes(q) ||
                        c.supportPersonPhone?.toLowerCase().includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-20 text-center space-y-2">
                          <Volume2 className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                          <p className="text-sm font-bold text-neutral-300">No Call Logs Found</p>
                          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                            Calls made by field agents to customers via the CashALL App will automatically appear here with audio playback.
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((call) => (
                      <div
                        key={call.id}
                        className="bg-neutral-800/80 border border-neutral-700/80 hover:border-neutral-600 rounded-2xl p-4 transition shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        {/* CALL META INFO */}
                        <div className="space-y-1.5 flex-1 min-w-[280px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{call.customerName || "Customer Lead"}</span>
                            <a
                              href={`tel:${call.customerPhone}`}
                              className="text-xs font-mono font-bold text-yellow-400 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{call.customerPhone}</span>
                            </a>
                            <span className="text-[10px] bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-md font-semibold">
                              {call.quoteId || "Order"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-neutral-300">
                            <Smartphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="font-medium text-neutral-200">{call.deviceName || "Mobile Device"}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-0.5">
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-yellow-400" />
                              <span>Agent: <strong className="text-neutral-200">{call.supportPersonName || "Field Agent"}</strong></span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{call.callTimeIST || call.createdAtIST}</span>
                            </div>
                          </div>
                        </div>

                        {/* DURATION & AUDIO CONTROLS */}
                        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap shrink-0">
                          <div className="flex flex-col items-end">
                            <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-xs font-mono font-black px-2.5 py-1 rounded-lg">
                              ⏱️ {call.durationFormatted || `${call.durationSeconds}s`}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                              {call.callOutcome === "CALL_COMPLETED" ? "Completed" : "Logged"}
                            </span>
                          </div>

                          {call.audioUrl ? (
                            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 px-2 py-1.5 rounded-xl shadow-inner">
                              <audio controls src={call.audioUrl} preload="none" className="h-7 w-48" />
                              <a
                                href={call.audioUrl}
                                download={`Call_${call.customerPhone}_${call.id.slice(0, 6)}.m4a`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-yellow-400 transition"
                                title="Download audio recording"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs italic text-neutral-500 bg-neutral-900/60 px-3 py-1.5 rounded-xl border border-neutral-800">
                              Logged (No Audio File)
                            </span>
                          )}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-850 flex items-center justify-between text-xs text-neutral-400">
                <span>Total Calls Synced: <strong className="text-white">{callLogs.length}</strong></span>
                <button
                  onClick={() => setShowCallLogModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
