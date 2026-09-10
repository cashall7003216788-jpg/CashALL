"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  BarChart3,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  IndianRupee,
  ShoppingBag,
  CheckCircle2,
  UserCheck,
  Search,
  Lock,
  Headset,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

interface ReportEntry {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pincode: string;
  address: string;
  deviceName: string;
  amountPaid: number;
  paymentStatus: string;
  urn: string;
  agentName: string;
  status: string;
}

interface AgentPerf {
  agentName: string;
  completedLeads: number;
  totalPayout: number;
}

interface AdminLoginLog {
  id: string;
  adminName: string;
  loginTimeIST: string;
  ipAddress: string;
}

interface SupportCallLog {
  id: string;
  supportPersonName: string;
  quoteId: string;
  customerName: string;
  customerPhone: string;
  callOutcome: string;
  callTimeIST: string;
}

export default function AdminReportsPage() {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerf[]>([]);
  const [adminLogins, setAdminLogins] = useState<AdminLoginLog[]>([]);
  const [supportCalls, setSupportCalls] = useState<SupportCallLog[]>([]);
  const [summary, setSummary] = useState({ totalOrders: 0, paidOrders: 0, totalPayoutAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/reports?t=${Date.now()}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data || []);
        if (json.summary) setSummary(json.summary);
        if (json.agentPerformance) setAgentPerformance(json.agentPerformance);
        if (json.adminLogins) setAdminLogins(json.adminLogins);
        if (json.supportCalls) setSupportCalls(json.supportCalls);
      }
    } catch (e) {
      console.error("Failed to load report data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const filteredEntries = entries.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.orderNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.customerPhone.toLowerCase().includes(q) ||
      item.deviceName.toLowerCase().includes(q) ||
      item.urn.toLowerCase().includes(q) ||
      item.agentName.toLowerCase().includes(q)
    );
  });

  const handleDownloadCSV = () => {
    if (filteredEntries.length === 0) return;
    const headers = [
      "Order Number", "Date", "Customer Name", "Customer Phone", "Pincode", "Address", "Device Name", "Amount Paid", "Payment Status", "UTR Number", "Assigned Agent", "Order Status"
    ];
    const rows = filteredEntries.map((item) => [
      item.orderNumber, item.date, `"${item.customerName.replace(/"/g, '""')}"`, item.customerPhone, item.pincode, `"${item.address.replace(/"/g, '""')}"`, `"${item.deviceName.replace(/"/g, '""')}"`, item.amountPaid, item.paymentStatus, item.urn, `"${item.agentName.replace(/"/g, '""')}"`, item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CashALL_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
                Reports & Audit Analytics Console
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Live Payment Entries, Agent Performance & Support Call Records for Salary/Incentive Calculations
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              disabled={filteredEntries.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={filteredEntries.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={fetchReportData}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-bold uppercase">Total Orders</div>
              <div className="text-2xl font-black text-white font-price">{summary.totalOrders}</div>
            </div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-bold uppercase">Settled Payments</div>
              <div className="text-2xl font-black text-emerald-400 font-price">{summary.paidOrders}</div>
            </div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-green-400/10 text-green-400 border border-green-400/20 rounded-2xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-bold uppercase">Total Disbursed Payout</div>
              <div className="text-2xl font-black text-green-400 font-price">
                ₹{summary.totalPayoutAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* AGENT PERFORMANCE & INCENTIVES MATRIX */}
        <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-yellow-400" />
              <span>Agent Completed Leads & Incentive Matrix</span>
            </h2>
            <span className="text-xs text-neutral-400 font-semibold">Database Record for Agent Salaries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agentPerformance.map((ap) => (
              <div key={ap.agentName} className="bg-neutral-900 border border-neutral-700/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-yellow-400">{ap.agentName}</span>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    ACTIVE AGENT
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-neutral-800">
                  <span className="text-neutral-400 uppercase font-bold text-[11px]">LEADS COMPLETED:</span>
                  <span className="font-bold text-emerald-400 font-mono">{ap.completedLeads}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-bold text-[11px]">LEADS NOT COMPLETED:</span>
                  <span className="font-bold text-amber-400 font-mono">{(ap as any).uncompletedLeads || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-bold text-[11px]">Total Value:</span>
                  <span className="font-black text-green-400 font-price">₹{ap.totalPayout.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ADMIN LOGINS AUDIT TRAIL */}
        <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Recent Admin Login Audit Trail ({adminLogins.length})</span>
            </h2>
            <span className="text-xs text-neutral-400 font-semibold">Recorded Logins for Sangeet, Abhishek, Ankit & Ayush</span>
          </div>

          {adminLogins.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-xs">No admin logins logged yet in database.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {adminLogins.map((log) => (
                <div
                  key={log.id}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-yellow-400 text-xs sm:text-sm">{log.adminName}</span>
                    <span className="bg-yellow-950 text-yellow-400 border border-yellow-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-xs text-neutral-300 font-mono">
                    <div className="text-[11px] text-neutral-400">Login Time (IST):</div>
                    <div className="font-semibold">{log.loginTimeIST}</div>
                  </div>
                  <div className="pt-1.5 border-t border-neutral-800 text-[10px] text-neutral-400 font-mono flex items-center justify-between">
                    <span>IP Address:</span>
                    <span className="text-neutral-300">{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUPPORT TEAM CALL LOGS AUDIT TRAIL */}
        <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Headset className="w-5 h-5 text-blue-400" />
              <span>Support Team Call Records & Incentive Log ({supportCalls.length})</span>
            </h2>
            <span className="text-xs text-neutral-400 font-semibold">Database Records for Support Salaries</span>
          </div>

          {supportCalls.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-xs">
              No support calls recorded yet. Logged calls will populate here automatically.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {supportCalls.map((sc) => (
                <div
                  key={sc.id}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition shadow-md space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-xs">{sc.supportPersonName}</span>
                    <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {sc.callOutcome.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="bg-black/40 border border-neutral-800/80 rounded-xl p-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-1 font-mono text-[11px]">
                      <span className="text-neutral-400">Quote:</span>
                      <span className="text-yellow-400 font-bold">#{sc.quoteId}</span>
                    </div>
                    <div className="font-bold text-white truncate">{sc.customerName}</div>
                    {sc.customerPhone && (
                      <a
                        href={`tel:${sc.customerPhone}`}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold hover:underline"
                      >
                        📞 {sc.customerPhone}
                      </a>
                    )}
                  </div>

                  <div className="text-[10px] text-neutral-400 font-mono text-right">
                    {sc.callTimeIST}
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
