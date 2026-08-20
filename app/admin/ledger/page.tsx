"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  FileText,
  Download,
  Loader2,
  RefreshCw,
  IndianRupee,
  ShoppingBag,
  CheckCircle2,
  Search,
  Receipt,
  Printer,
} from "lucide-react";

interface LedgerEntry {
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

export default function AdminLedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState({ totalOrders: 0, paidOrders: 0, totalPayoutAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/reports?t=${Date.now()}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data || []);
        if (json.summary) setSummary(json.summary);
      }
    } catch (e) {
      console.error("Failed to load audit ledger:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

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
      "Order Number", "Date", "Customer Name", "Customer Phone", "Pincode", "Address", "Device Name", "Disbursed Amount (INR)", "Payment Status", "Bank UTR / Ref", "Assigned Agent", "Order Status"
    ];
    const rows = filteredEntries.map((item) => [
      item.orderNumber, item.date, `"${item.customerName.replace(/"/g, '""')}"`, item.customerPhone, item.pincode, `"${item.address.replace(/"/g, '""')}"`, `"${item.deviceName.replace(/"/g, '""')}"`, item.amountPaid, item.paymentStatus, item.urn, `"${item.agentName.replace(/"/g, '""')}"`, item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CashALL_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (typeof document !== "undefined") {
      document.title = `CashALL_Audit_Ledger_${new Date().toISOString().slice(0, 10)}`;
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
              <Receipt className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
                Transaction Audit Ledger
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Complete Accounting Ledger, UTR Bank References & Disbursed Customer Payouts
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
              <Printer className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={fetchLedgerData}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 print:hidden">
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

        {/* FULL AUDIT LEDGER TABLE */}
        <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-700 pb-4 print:hidden">
            <h2 className="text-lg font-extrabold text-white">Full Transaction Audit Ledger</h2>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search order number, customer, UTR, agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
              <span className="ml-2 text-xs text-neutral-400 font-semibold">Generating live audit ledger...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-yellow-400" />
              <p className="text-sm font-bold text-white">No ledger entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 text-neutral-400 uppercase tracking-wider font-extrabold print:text-black print:border-gray-300">
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer & Phone</th>
                    <th className="py-3 px-3">Device Name</th>
                    <th className="py-3 px-3">Disbursed Amount</th>
                    <th className="py-3 px-3">Bank UTR / Ref</th>
                    <th className="py-3 px-3">Assigned Agent</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/60 print:divide-gray-200">
                  {filteredEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-750/50 transition">
                      <td className="py-4 px-3 font-mono font-black text-yellow-400 print:text-black">{item.orderNumber}</td>
                      <td className="py-4 px-3 text-neutral-300 print:text-gray-800">{item.date}</td>
                      <td className="py-4 px-3">
                        <div className="font-bold text-white print:text-black">{item.customerName}</div>
                        <div className="text-[11px] text-neutral-400 font-mono print:text-gray-600">{item.customerPhone}</div>
                      </td>
                      <td className="py-4 px-3 font-semibold text-white print:text-black">{item.deviceName}</td>
                      <td className="py-4 px-3 font-black text-green-400 font-price print:text-black">₹{item.amountPaid.toLocaleString("en-IN")}</td>
                      <td className="py-4 px-3 font-mono text-neutral-300 print:text-gray-800">{item.urn}</td>
                      <td className="py-4 px-3 font-bold text-yellow-300 print:text-black">{item.agentName}</td>
                      <td className="py-4 px-3">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          item.paymentStatus === "PAID" || item.status === "COMPLETED"
                            ? "bg-green-950 text-green-400 border border-green-700 print:bg-green-100 print:text-green-800"
                            : "bg-amber-950 text-amber-400 border border-amber-700 print:bg-amber-100 print:text-amber-800"
                        }`}>
                          {item.paymentStatus}
                        </span>
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
