"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Printer, Download, Shield, ArrowLeft } from "lucide-react";
import { cleanDeviceName } from "@/lib/device";

interface BillData {
  orderNumber: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  buyerName: string;
  buyerGstin: string;
  buyerAddress: string;
  agentName: string;
  deviceName: string;
  variantName: string;
  imeiNumber: string;
  quoteNumber: string;
  estimatedPrice: number;
  finalPrice: number;
  paymentMethod: string;
  utrNumber: string;
  upiId: string;
  paidAt: string;
  orderDate: string;
  completedAt: string;
  priceDifferenceReason?: string;
}

export default function CustomerBillPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "";
  const billRef = useRef<HTMLDivElement>(null);

  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    // Load html2pdf.js bundle dynamically for direct PDF download
    if (typeof window !== "undefined" && !(window as any).html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        // Try fetching order from API
        const res = await fetch(`/api/v1/orders/${orderId}`);
        let ord: any = null;

        if (res.ok) {
          const json = await res.json();
          ord = json.data || json.order;
        }

        // Fallback to local storage if API didn't return
        if (!ord && typeof window !== "undefined") {
          const stored = localStorage.getItem(`cashall_order_${orderId}`) || localStorage.getItem("cashall_latest_order");
          if (stored) {
            try {
              ord = JSON.parse(stored);
            } catch {}
          }
        }

        if (!ord) {
          // Fallback to generate-bill API
          const genRes = await fetch(`/api/v1/orders/${orderId}/generate-bill`);
          if (genRes.ok) {
            const genJson = await genRes.json();
            const bd = genJson.data?.billData;
            if (bd) {
              const currentYear = new Date().getFullYear();
              setBill({
                orderNumber: bd.orderNumber || orderId,
                billNumber: `${bd.orderNumber || orderId}_${currentYear}`,
                customerName: bd.seller?.name || "Customer",
                customerPhone: bd.seller?.phoneMasked || bd.seller?.phone || "—",
                pickupAddress: bd.seller?.address || "Howrah, West Bengal",
                buyerName: bd.buyer?.name || "AARNA ENTERPRISE",
                buyerGstin: bd.buyer?.gstin || "19AVPPG9800JIZ3",
                buyerAddress: bd.buyer?.address || "Howrah, West Bengal",
                agentName: bd.buyer?.assignedAgent || "Hyder Ali",
                deviceName: cleanDeviceName(bd.device?.deviceName || "Mobile Device"),
                variantName: bd.device?.variant || "128 GB",
                imeiNumber: bd.device?.imei1 || "N/A",
                quoteNumber: `CAQ-${(bd.orderNumber || orderId).slice(-6)}`,
                estimatedPrice: bd.financials?.estimatedPrice ?? bd.financials?.finalPurchasePrice ?? 0,
                finalPrice: bd.financials?.finalPurchasePrice ?? 0,
                paymentMethod: bd.financials?.paymentMethod || "UPI",
                utrNumber: bd.financials?.utrNumber || "",
                upiId: "Instant UPI",
                paidAt: new Date(bd.completionDate || Date.now()).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                orderDate: new Date(bd.orderDate || Date.now()).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                completedAt: new Date(bd.completionDate || Date.now()).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
              });
              setLoading(false);
              return;
            }
          }
        }

        if (!ord) {
          setError("Order bill not found.");
          setLoading(false);
          return;
        }

        const payment = ord.payments?.[0];
        const assignedPartner = ord.pickups?.[0]?.partner;
        const agentName = ord.agentName || ord.assignedPartnerName || ord.pickups?.[0]?.notes || assignedPartner?.name || "Hyder Ali";
        const currentYear = new Date().getFullYear();

        // Exact date mapping as specified by user
        const orderDateMap: Record<string, string> = {
          "CA36738": "16-08-2026",
          "CA33039": "19-08-2026",
          "CA83848": "19-08-2026",
        };

        const exactDateStr = orderDateMap[ord.orderNumber] ||
          new Date(ord.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");

        // Extract recorded IMEI number
        const imeiMap: Record<string, string> = {
          "CA33039": "867050071630112",
          "CA83848": "355432463313115",
          "CA36738": "864932057391842",
        };

        const imeiNumber =
          imeiMap[ord.orderNumber] ||
          ord.imeiRecords?.[0]?.code ||
          ord.qcReports?.[0]?.imeiNumber ||
          ord.imeiNumber ||
          "N/A";

        // Robust device name extraction
        let resolvedDeviceName = ord.deviceName || "Mobile Device";
        if (ord.quote?.breakdownJson) {
          try {
            const bd = JSON.parse(ord.quote.breakdownJson);
            if (bd?.deviceName) resolvedDeviceName = bd.deviceName;
          } catch {}
        }
        if ((!resolvedDeviceName || resolvedDeviceName === "Mobile Device") && ord.quote?.selectedAnswersJson) {
          try {
            const sa = JSON.parse(ord.quote.selectedAnswersJson);
            if (sa?.device && sa.device !== "Customer Mobile Device") resolvedDeviceName = sa.device;
          } catch {}
        }
        if ((!resolvedDeviceName || resolvedDeviceName === "Mobile Device") && ord.quote?.variant?.model?.brand?.name) {
          resolvedDeviceName = `${ord.quote.variant.model.brand.name} ${ord.quote.variant.model.name}`;
        }

        const generatedBillNum = `${ord.orderNumber}_${currentYear}`;

        if (typeof document !== "undefined") {
          document.title = generatedBillNum;
        }
        const resolvedPriceDifferenceReason =
          ord.priceDifferenceReason ||
          ord.qcReports?.[0]?.priceDifferenceReason ||
          ord.offers?.[0]?.priceDifferenceReason ||
          (ord as any).qcReport?.priceDifferenceReason ||
          "";

        setBill({
          orderNumber: ord.orderNumber,
          billNumber: generatedBillNum,
          customerName: ord.user?.name || ord.customerName || "Customer",
          customerPhone: ord.user?.phone || ord.customerPhone || ord.address?.phone || "—",
          pickupAddress: ord.addressSummary || (ord.address
            ? `${ord.address.house || ""}, ${ord.address.street || ""}, ${ord.address.area || ""}, ${ord.address.city || ""}, ${ord.address.state || ""} - ${ord.address.pincode || ""}`
            : "—"),
          buyerName: "AARNA ENTERPRISE",
          buyerGstin: "19AVPPG9800JIZ3",
          buyerAddress: "Howrah, West Bengal",
          agentName: agentName,
          deviceName: cleanDeviceName(resolvedDeviceName),
          variantName: ord.quote?.variant?.name || ord.quote?.variant?.storage || "Doorstep Verified Device",
          imeiNumber,
          quoteNumber: ord.quote?.quoteNumber || `CAQ-${ord.orderNumber || ord.id?.slice(0, 6).toUpperCase()}`,
          estimatedPrice: ord.quote?.estimatedPrice ?? ord.estimatedPrice ?? 0,
          finalPrice: payment?.amount ?? ord.finalPrice ?? ord.revisedPrice ?? ord.estimatedPrice ?? 0,
          paymentMethod: payment?.method || "UPI",
          utrNumber: (() => {
            const raw = payment?.transactionRef || (payment as any)?.utrNumber || ord.payments?.[0]?.transactionRef || ord.urn || "";
            return raw && !raw.startsWith("PAID-") && raw !== "128158907549" && raw !== "623480124575" ? raw : "";
          })(),
          upiId: payment?.upiId || (payment as any)?.upiId || "Instant UPI",
          paidAt: ord.updatedAt ? new Date(ord.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : `${exactDateStr}, 02:30 PM`,
          orderDate: ord.createdAt ? new Date(ord.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : `${exactDateStr}, 11:15 AM`,
          completedAt: ord.updatedAt ? new Date(ord.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : `${exactDateStr}, 02:30 PM`,
          priceDifferenceReason: resolvedPriceDifferenceReason,
        });
      } catch (err: any) {
        setError(err?.message || "Failed to load bill.");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchBill();
  }, [orderId]);

  const handlePrint = () => {
    if (bill && typeof document !== "undefined") {
      document.title = `${bill.orderNumber}_2026`;
    }
    window.print();
  };

  const handleSavePdf = async () => {
    if (!bill) return;
    setDownloadingPdf(true);
    const pdfFilename = `${bill.orderNumber}_2026.pdf`;

    try {
      if (typeof window !== "undefined" && (window as any).html2pdf && billRef.current) {
        const element = billRef.current;
        const opt = {
          margin: 0.15,
          filename: pdfFilename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };
        await (window as any).html2pdf().set(opt).from(element).save();
      } else {
        if (typeof document !== "undefined") {
          document.title = `${bill.orderNumber}_2026`;
        }
        window.print();
      }
    } catch (e) {
      if (typeof document !== "undefined") {
        document.title = `${bill.orderNumber}_2026`;
      }
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-sm text-gray-500 font-semibold">Loading official purchase receipt...</div>
    </div>
  );

  if (error || !bill) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-4">
      <div className="text-sm text-red-600 font-semibold">{error || "Bill not found."}</div>
      <Link href={`/track/${orderId}`} className="text-xs font-bold text-black underline">
        Return to Order Tracking
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0">
      {/* Action controls - hidden on print */}
      <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/track/${bill.orderNumber}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-gray-800 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </button>
          <button
            onClick={handleSavePdf}
            disabled={downloadingPdf}
            className="flex items-center gap-2 bg-yellow-400 text-black font-bold text-xs px-4 py-2 rounded-xl hover:bg-yellow-300 transition shadow-md disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {downloadingPdf ? "Generating PDF..." : `Save as PDF (${bill.orderNumber}_2026.pdf)`}
          </button>
        </div>
      </div>

      {/* BILL DOCUMENT (EXACT SAME AS ADMIN BILL) */}
      <div
        ref={billRef}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Header */}
        <div className="bg-black text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src="/icon.png" alt="CashALL Logo" className="h-7 w-7 object-contain rounded-lg" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                <span className="text-2xl font-black text-yellow-400 tracking-wide font-price">CashALL</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Best Value For Your Old Devices</p>
              <p className="text-[11px] text-gray-500 mt-0.5">www.cashall.in</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Purchase Receipt</div>
              <div className="text-base font-black text-yellow-400 mt-1 font-mono">{bill.billNumber}</div>
              <div className="text-[11px] text-gray-400 mt-1">Date: {bill.completedAt}</div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-green-50 border-b border-green-200 px-8 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-xs font-bold text-green-800">TRANSACTION COMPLETED — Device Acquired & Payment Confirmed</span>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Customer, Buyer & Order Info Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Seller Details</div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-gray-900 text-sm">{bill.customerName}</div>
                <div className="text-gray-600">{bill.customerPhone}</div>
                <div className="text-gray-500 leading-snug mt-1">{bill.pickupAddress}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Buyer Details</div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-gray-900 text-sm">{bill.buyerName}</div>
                <div className="text-gray-600 font-semibold">GSTIN: {bill.buyerGstin}</div>
                <div className="text-gray-500 leading-snug mt-0.5">{bill.buyerAddress}</div>
                <div className="text-yellow-700 font-bold text-[11px] mt-1.5 pt-1 border-t border-gray-100">
                  Assigned Agent: <span className="text-gray-900">{bill.agentName}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Order Details</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-black text-gray-900">{bill.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quote ID</span>
                  <span className="font-bold text-gray-700">{bill.quoteNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date</span>
                  <span className="font-semibold text-gray-700">{bill.orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-semibold text-gray-700">{bill.completedAt}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* Device Details */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Device Purchased & Serial / IMEI</div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-gray-900 text-sm">{bill.deviceName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{bill.variantName}</div>
                  <div className="text-xs font-mono font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md inline-block mt-2 shadow-sm">
                    IMEI NO: <span className="text-gray-900 tracking-wider font-mono">{bill.imeiNumber}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400">CashALL Valuation</div>
                  <div className="text-xs text-gray-400 line-through">₹{bill.estimatedPrice.toLocaleString("en-IN")}</div>
                  <div className="text-lg font-black text-gray-900">₹{bill.finalPrice.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* QC Physical Inspection & Price Settlement Rationale */}
          {bill.priceDifferenceReason && (
            <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Doorstep QC Physical Inspection & Settlement Rationale</span>
                </div>
                <span className="text-[10px] text-amber-800 font-bold">
                  Inspected by: {bill.agentName}
                </span>
              </div>
              <p className="text-xs text-gray-800 font-medium leading-relaxed bg-white/90 p-2.5 rounded-lg border border-amber-100 italic">
                &ldquo;{bill.priceDifferenceReason}&rdquo;
              </p>
            </div>
          )}

          {/* Payment Summary */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Summary</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Initial Online Valuation</span>
                <span>₹{bill.estimatedPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Post-Inspection Final Offer</span>
                <span className="font-bold text-gray-900">₹{bill.finalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-black text-sm text-gray-900">
                <span>TOTAL PAID TO SELLER</span>
                <span className="text-green-700">₹{bill.finalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">Payment Details</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Method: </span>
                <span className="font-bold text-gray-900">{bill.paymentMethod} Transfer</span>
              </div>
              <div>
                <span className="text-gray-500">Paid At: </span>
                <span className="font-bold text-gray-900">{bill.paidAt}</span>
              </div>
              {bill.upiId !== "—" && (
                <div>
                  <span className="text-gray-500">UPI ID: </span>
                  <span className="font-bold text-gray-900">{bill.upiId}</span>
                </div>
              )}
              {bill.utrNumber ? (
                <div>
                  <span className="text-gray-500">Bank UTR / Ref: </span>
                  <span className="font-mono font-bold text-gray-900">{bill.utrNumber}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Legal Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-start gap-2">
            <Shield className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-snug">
              This is a computer-generated receipt issued by CashALL. The seller (named above) has voluntarily sold the device to CashALL at the agreed final price. This document serves as the legal sale agreement and payment confirmation.
            </p>
          </div>

          <div className="text-center text-[11px] text-gray-400 font-medium">
            Thank you for choosing CashALL — India&apos;s most transparent device selling platform.
          </div>
        </div>

        {/* Footer strip */}
        <div className="bg-black text-center py-3 text-[10px] text-gray-500">
          CashALL | cashall.in | Helpline: 7003216788
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          body { margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  );
}

