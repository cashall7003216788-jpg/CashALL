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
  Calendar,
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

export default function AdminReportsPage() {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
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

  // Filter entries based on search query
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

  // Export to CSV Function
  const handleDownloadCSV = () => {
    if (filteredEntries.length === 0) return;

    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Mobile Number",
      "Email",
      "Pincode",
      "Device Purchased",
      "Amount Paid (INR)",
      "Payment Status",
      "12-Digit URN",
      "Assigned Field Agent",
      "Order Status",
    ];

    const csvRows = filteredEntries.map((row) => [
      `"${row.orderNumber}"`,
      `"${row.date}"`,
      `"${row.customerName}"`,
      `"${row.customerPhone}"`,
      `"${row.customerEmail}"`,
      `"${row.pincode}"`,
      `"${row.deviceName}"`,
      row.amountPaid,
      `"${row.paymentStatus}"`,
      `"${row.urn}"`,
      `"${row.agentName}"`,
      `"${row.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `CashALL_Payments_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Printable PDF Function
  const handleDownloadPDF = () => {
    if (filteredEntries.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filteredEntries
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">#${item.orderNumber}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.date}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.customerName}<br><small style="color: #666;">${item.customerPhone}</small></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.deviceName}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #16a34a;">Rs. ${item.amountPaid.toLocaleString("en-IN")}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${item.urn}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.agentName}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.paymentStatus}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CashALL Payment & Operations Summary Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            h1 { color: #000; margin-bottom: 4px; }
            .header { background: #000; color: #FACC15; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .summary { display: flex; gap: 20px; margin-bottom: 20px; font-size: 14px; }
            .card { background: #f4f4f4; padding: 12px 18px; border-radius: 8px; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #000; color: #fff; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0; color:#FACC15;">CashALL</h1>
            <p style="margin:4px 0 0 0; color:#fff; font-size: 12px;">LIVE PAYMENT OPERATIONS & FINANCIAL AUDIT REPORT</p>
          </div>
          <div class="summary">
            <div class="card"><strong>Total Orders:</strong> ${summary.totalOrders}</div>
            <div class="card"><strong>Paid & Settled Orders:</strong> ${summary.paidOrders}</div>
            <div class="card"><strong>Total Disbursed Payout:</strong> Rs. ${summary.totalPayoutAmount.toLocaleString("en-IN")}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Amount Paid</th>
                <th>12-Digit URN</th>
                <th>Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex">
      <AdminSidebar />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
                Reports & Analytics Console
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Live Payment Entries, Field Agent Performance & Automated Data Export
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

        {/* SEARCH & DATA TABLE CARD */}
        <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-neutral-700">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Order #, Customer, URN, Agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition"
              />
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              Showing {filteredEntries.length} of {entries.length} entries
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <span className="text-xs text-neutral-400">Loading live report entries from database...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 text-xs">
              No matching payment & order entries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer & Mobile</th>
                    <th className="py-3 px-3">Device Purchased</th>
                    <th className="py-3 px-3">Amount Paid</th>
                    <th className="py-3 px-3">12-Digit URN</th>
                    <th className="py-3 px-3">Field Agent</th>
                    <th className="py-3 px-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/60">
                  {filteredEntries.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-750/50 transition">
                      <td className="py-3.5 px-3">
                        <span className="bg-black text-yellow-400 font-black px-2.5 py-1 rounded-lg border border-yellow-400/20 font-price">
                          #{row.orderNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-neutral-300 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{row.customerName}</div>
                        <div className="text-[11px] text-neutral-400">{row.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-neutral-200">
                        {row.deviceName}
                      </td>
                      <td className="py-3.5 px-3 font-black text-green-400 font-price">
                        ₹{row.amountPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-yellow-400 font-bold">
                        {row.urn}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>{row.agentName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                            row.paymentStatus === "PAID"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-amber-950 text-yellow-400 border border-yellow-800"
                          }`}
                        >
                          {row.paymentStatus}
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
