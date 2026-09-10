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
  Smartphone,
  Phone,
  User,
  Copy,
  Check,
  Clock,
  CreditCard,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  orderNumber: string;
  date: string;
  orderPlacedAt?: string;
  settledAt?: string;
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
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

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
      "Order Number",
      "Order Placed Date & Time",
      "Payout Settled Date & Time",
      "Customer Name",
      "Customer Phone",
      "Pincode",
      "Address",
      "Device Name",
      "Disbursed Amount (INR)",
      "Payment Status",
      "Bank UTR / Ref",
      "Assigned Agent",
      "Order Status",
    ];
    const rows = filteredEntries.map((item) => [
      item.orderNumber,
      `"${item.orderPlacedAt || item.date}"`,
      `"${item.settledAt || "—"}"`,
      `"${item.customerName.replace(/"/g, '""')}"`,
      item.customerPhone,
      item.pincode,
      `"${item.address.replace(/"/g, '""')}"`,
      `"${item.deviceName.replace(/"/g, '""')}"`,
      item.amountPaid,
      item.paymentStatus,
      item.urn,
      `"${item.agentName.replace(/"/g, '""')}"`,
      item.status,
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
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
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
            <div className="space-y-3">
              {filteredEntries.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 transition shadow-md space-y-3 print:bg-white print:border-gray-200 print:text-black"
                >
                  {/* CARD HEADER: ORDER NUMBER + SETTLED DATE + STATUS */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-yellow-400 text-sm tracking-wide print:text-black">
                        #{item.orderNumber}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium bg-neutral-800 px-2 py-0.5 rounded-md print:bg-gray-100 print:text-gray-700">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>Settled: {item.settledAt || item.date}</span>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        item.paymentStatus === "PAID" || item.status === "COMPLETED"
                          ? "bg-green-950 text-green-400 border border-green-700 print:bg-green-100 print:text-green-800"
                          : "bg-amber-950 text-amber-400 border border-amber-700 print:bg-amber-100 print:text-amber-800"
                      }`}
                    >
                      {item.paymentStatus}
                    </span>
                  </div>

                  {/* DEVICE & DISBURSED AMOUNT */}
                  <div className="flex items-center justify-between gap-2 bg-black/40 border border-neutral-800/80 rounded-xl p-3 print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <Smartphone className="w-4 h-4 text-yellow-400 shrink-0 print:text-black" />
                      <span className="font-bold text-white text-xs sm:text-sm truncate print:text-black">
                        {item.deviceName}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 block font-semibold print:text-gray-500">Disbursed</span>
                      <span className="font-black text-green-400 font-price text-sm sm:text-base print:text-black">
                        ₹{item.amountPaid.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* CUSTOMER & CONTACT & PINCODE */}
                  <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                    <div>
                      <div className="font-bold text-white print:text-black">{item.customerName}</div>
                      <div className="text-[11px] text-neutral-400 print:text-gray-600">
                        PIN: {item.pincode} • {item.address}
                      </div>
                    </div>

                    {item.customerPhone && (
                      <a
                        href={`tel:${item.customerPhone}`}
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-xl active:scale-95 transition print:border-gray-300 print:text-black"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{item.customerPhone}</span>
                      </a>
                    )}
                  </div>

                  {/* BANKING & ASSIGNED AGENT FOOTER */}
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2 flex-wrap text-xs print:border-gray-200">
                    {/* BANK UTR WITH COPY BUTTON */}
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-neutral-400 text-[11px]">UTR:</span>
                      <span className="font-bold text-yellow-400 print:text-black">{item.urn}</span>
                      {item.urn && item.urn !== "—" && item.urn !== "N/A" && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.urn);
                            setCopiedUtr(item.urn);
                            setTimeout(() => setCopiedUtr(null), 2000);
                          }}
                          className="p-1 text-neutral-400 hover:text-yellow-400 rounded transition cursor-pointer"
                          title="Copy UTR Reference"
                        >
                          {copiedUtr === item.urn ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* ASSIGNED AGENT */}
                    <div className="inline-flex items-center gap-1 text-[11px] text-neutral-300 font-bold bg-neutral-800 px-2.5 py-0.5 rounded-lg border border-neutral-700 print:bg-gray-100 print:text-black">
                      <User className="w-3 h-3 text-yellow-400" />
                      <span>{item.agentName}</span>
                    </div>
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
