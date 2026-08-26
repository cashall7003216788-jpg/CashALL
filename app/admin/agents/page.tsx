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

  // Form State: Full Name, User Name, Phone Number, Password
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    password: "",
  });

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

          <button
            onClick={fetchAgents}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2 rounded-xl transition shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh List
          </button>
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
      </main>
    </div>
  );
}
