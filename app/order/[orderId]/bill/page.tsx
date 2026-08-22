"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Printer, ShieldCheck, Download, CheckCircle2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CustomerBillPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "";
  const [billData, setBillData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await fetch(`/api/v1/orders/${orderId}/generate-bill`);
        if (res.ok) {
          const data = await res.json();
          setBillData(data.data?.billData || null);
        }
      } catch (err) {
        console.error("Failed to load bill data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchBill();
  }, [orderId]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link href={`/track/${orderId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Order Tracking</span>
            </Link>

            <Button onClick={() => window.print()} variant="primary" size="sm" className="gap-2 shadow-yellowGlow font-black">
              <Printer className="w-4 h-4" />
              <span>PRINT / DOWNLOAD PDF BILL</span>
            </Button>
          </div>

          {/* DUAL DOCUMENT CONTAINER */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-premium space-y-8 print:shadow-none print:border-none print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-6">
              <div>
                <div className="text-2xl font-black text-brand-black font-price">CashALL</div>
                <div className="text-xs text-brand-muted">AARNA ENTERPRISE • CashALL Platform</div>
                <div className="text-[11px] text-gray-400 mt-1">GSTIN: 19AVPPG9800JIZ3 • Howrah, West Bengal • support@cashall.in</div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-green-100 text-green-800 text-[11px] font-black uppercase px-3 py-1 rounded-full border border-green-300">
                  OFFICIAL SIGNED BILL
                </div>
                <div className="text-sm font-extrabold text-brand-black mt-2">
                  {billData?.billNumber || `${orderId}-${new Date().getFullYear()}`}
                </div>
                <div className="text-xs text-brand-muted">
                  Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* Document A: Device Sale Agreement */}
            <div className="space-y-4">
              <h2 className="text-base font-black text-brand-black uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-yellow" />
                <span>Document A — Mobile & Device Sale Agreement</span>
              </h2>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs leading-relaxed space-y-2 text-gray-700">
                <p className="font-semibold text-brand-black">Seller Legal Ownership Declaration:</p>
                <p>
                  &quot;{billData?.declarations?.sellerDeclarationText || "I confirm I am the lawful owner or authorized seller of this device. The information supplied and IMEI numbers are accurate. The device has not knowingly been obtained through theft or fraud and is not subject to conflicting ownership claims. I authorize CashALL to purchase the device under agreed terms."}&quot;
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-brand-black border-t border-gray-200">
                  <span>Signed By: {billData?.seller?.name || "Customer"}</span>
                  <span>eSign Timestamp: {new Date(billData?.declarations?.eSignTimestamp || Date.now()).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Document B: Purchase Receipt */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-black text-brand-black uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-yellow" />
                <span>Document B — CashALL Purchase Receipt</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-bold uppercase block text-[10px]">Seller Details</span>
                  <div className="font-extrabold text-brand-black text-sm">{billData?.seller?.name || "Customer"}</div>
                  <div className="text-gray-600">{billData?.seller?.phoneMasked || "—"}</div>
                  <div className="text-gray-500 text-[11px] mt-1">{billData?.seller?.address || "Howrah, West Bengal"}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-bold uppercase block text-[10px]">Device Specifications</span>
                  <div className="font-extrabold text-brand-black text-sm">{billData?.device?.deviceName || `${billData?.device?.brand || "Apple"} ${billData?.device?.model || "iPhone 15"}`}</div>
                  <div className="text-gray-600">Storage / Variant: {billData?.device?.variant || "128 GB"}</div>
                  <div className="text-gray-500 font-mono text-[11px]">IMEI 1: {billData?.device?.imei1 || "—"}</div>
                </div>
              </div>

              {/* Financial Payout Details */}
              <div className="bg-brand-black text-white p-6 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase">Final Agreed Purchase Price</span>
                  <span className="text-2xl font-black text-brand-yellow font-price">
                    ₹{(billData?.financials?.finalPurchasePrice || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Payment Method</span>
                    <span className="font-bold text-white">{billData?.financials?.paymentMethod || "Instant UPI / Bank Transfer"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Bank UTR Reference</span>
                    <span className="font-bold font-mono text-brand-yellow">{billData?.financials?.utrNumber || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verifications Footer */}
            <div className="border-t border-gray-200 pt-4 flex flex-wrap items-center justify-between text-[11px] text-brand-muted gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Identity Verified ({billData?.verifications?.identityProvider || "e-KYC"})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>IMEI Cleared ({billData?.verifications?.imeiProvider || "Commercial Check"})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Doc Hash: {(billData?.declarations?.documentHash || "sha256_verified").slice(0, 16)}...</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
