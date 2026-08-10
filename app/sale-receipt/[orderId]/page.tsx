"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { OrderData } from "@/lib/store";
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2, FileCheck, Banknote } from "lucide-react";

// HELPER: CONVERT NUMBER TO WORDS (INDIAN RUPEES)
function convertNumberToWords(num: number): string {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if ((num = num.toString().length > 9 ? parseFloat(num.toString().substring(0, 9)) : num) === 0) return "Zero";
  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
  str += Number(n[5]) !== 0 ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) : "";
  return str.trim() + " Rupees Only";
}

export default function CustomerSaleReceiptPage() {
  const params = useParams();
  const rawOrderId = (params?.orderId as string) || "";
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && rawOrderId) {
      const stored = localStorage.getItem(`cashall_order_${rawOrderId}`) || localStorage.getItem("cashall_latest_order");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.customerName !== "Ananya Roy" && parsed.orderNumber !== "CA10482") {
            setOrder(parsed);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      setOrder(null);
    }
  }, [rawOrderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 text-brand-black">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-300 shadow-xl text-center space-y-4">
          <h1 className="text-xl font-black text-brand-black">Sale Receipt Not Found</h1>
          <p className="text-xs text-gray-500">
            No valid customer sale receipt found for order reference <strong className="text-black">#{rawOrderId || "N/A"}</strong>.
          </p>
          <Link href="/account" className="inline-block pt-2">
            <button className="bg-brand-yellow text-black font-extrabold text-xs px-6 py-2.5 rounded-xl border border-black shadow-md hover:bg-yellow-400 transition-all">
              Go to My Account
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const finalAmount = order.revisedPrice || 51900;
  const amountInWords = convertNumberToWords(finalAmount);
  const invoiceNumber = `CAS-2026-${order.orderNumber}`;
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 print:bg-white print:p-0 print:m-0 text-black">
      
      {/* ACTION BAR */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/track/${order.orderNumber}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black bg-white px-4 py-2 rounded-xl border border-gray-300 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Tracking</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/receipt/${order.orderNumber}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black bg-white px-4 py-2 rounded-xl border border-gray-300 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Switch to Procurement Receipt (Internal)</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-xs font-black text-black bg-brand-yellow hover:bg-yellow-400 px-5 py-2.5 rounded-xl border border-black shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Customer Payout Receipt</span>
          </button>
        </div>
      </div>

      {/* CUSTOMER SALE & PAYOUT RECEIPT CARD */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 border border-gray-300 shadow-xl print:shadow-none print:border-none print:p-0 rounded-2xl print:rounded-none relative overflow-hidden">
        
        {/* CUSTOMER COPY WATERMARK */}
        <div className="absolute top-12 right-1/4 opacity-10 pointer-events-none border-4 border-brand-black rounded-full p-6 rotate-[-10deg] text-brand-black text-center font-black">
          <div className="text-xl uppercase tracking-widest">CUSTOMER COPY</div>
          <div className="text-3xl font-black">SALE & PAYOUT</div>
          <div className="text-xs">PAYMENT VERIFIED & COMPLETED</div>
        </div>

        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-brand-yellow pb-6 mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-44">
              <Image
                src="/logo.png"
                alt="CashALL Logo"
                width={180}
                height={55}
                className="object-contain object-left h-full w-auto"
                priority
              />
            </div>
            <div>
              <div className="text-2xl font-black text-brand-black tracking-tight">Customer Sale Receipt</div>
              <div className="text-xs text-brand-muted font-bold">Device Sale & Direct Payout Invoice</div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs text-gray-600">
            <div className="text-sm font-black text-brand-black">Invoice No: {invoiceNumber}</div>
            <div><span className="font-bold">Date:</span> {formattedDate}</div>
            <div><span className="font-bold">Order Ref:</span> {order.orderNumber}</div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] mt-1">
              ✓ Payout Completed
            </div>
          </div>
        </div>

        {/* CUSTOMER & ISSUER DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          
          {/* CUSTOMER (SELLER) INFO */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2 text-xs">
            <div className="font-black text-brand-black border-b border-gray-200 pb-2 text-sm flex items-center justify-between">
              <span>Customer Details (Seller)</span>
              <span className="text-[10px] font-bold text-gray-400">BENEFICIARY</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-gray-600">Name :</span>
              <span className="col-span-2 font-black text-brand-black">{order.customerName}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-gray-600">Mobile :</span>
              <span className="col-span-2 font-bold text-gray-900">{order.customerPhone}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-gray-600">Pickup Address :</span>
              <span className="col-span-2 text-gray-800 leading-tight">{order.addressSummary}</span>
            </div>
          </div>

          {/* CASHALL ISSUER INFO */}
          <div className="bg-brand-black text-white rounded-2xl p-5 border border-neutral-800 space-y-2 text-xs">
            <div className="font-black text-brand-yellow border-b border-neutral-800 pb-2 text-sm flex items-center justify-between">
              <span>Issued By (Purchaser)</span>
              <span className="text-[10px] font-bold text-gray-400">OFFICIAL</span>
            </div>
            <div className="font-extrabold text-white text-sm">CashALL Recommerce Technologies Pvt Ltd</div>
            <div className="text-gray-300">Connaught Place, New Delhi - 110001</div>
            <div className="text-gray-400 text-[11px]">Helpline: +91 7003216788 | cashall7003216788@gmail.com</div>
            <div className="text-brand-yellow text-[11px] font-bold">GSTIN: 07AAGCM0328J3ZK</div>
          </div>

        </div>

        {/* SALE & PAYOUT TABLE */}
        <div className="border-2 border-brand-black rounded-2xl overflow-hidden mb-8">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-black text-white font-bold">
              <tr>
                <th className="p-4 text-brand-yellow">Item & Device Description</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-right text-brand-yellow">Agreed Valuation (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-4">
                  <div className="font-black text-base text-brand-black">
                    {order.declaredConditionSummary || "Used Device Sale"}
                  </div>
                  <div className="text-gray-600 font-mono mt-1 text-[11px]">
                    Verified IMEI / Serial No: {order.imeiNumber || "352901547218795"}
                  </div>
                </td>
                <td className="p-4 text-center font-bold text-gray-600">
                  Used Device Recommerce
                </td>
                <td className="p-4 text-right font-black text-base text-brand-black font-price">
                  ₹{(finalAmount + 99).toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className="bg-gray-50 text-gray-600">
                <td className="p-3 pl-4">Fast Doorstep Inspection & Pickup Service</td>
                <td className="p-3 text-center font-bold text-emerald-700">COMPLIMENTARY</td>
                <td className="p-3 pr-4 text-right font-bold text-emerald-700">FREE (-₹0)</td>
              </tr>
              <tr className="bg-gray-50 text-gray-600">
                <td className="p-3 pl-4">Data Wiping & Administrative Processing Fee</td>
                <td className="p-3 text-center">Standard Fee</td>
                <td className="p-3 pr-4 text-right font-medium text-gray-700">-₹99.00</td>
              </tr>
              <tr className="bg-brand-yellow/20 font-black text-base border-t-2 border-brand-black">
                <td className="p-4 text-brand-black" colSpan={2}>
                  Total Payout Received By Customer
                </td>
                <td className="p-4 text-right text-brand-black font-price text-xl">
                  ₹{finalAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* PAYOUT STATUS BOX */}
          <div className="p-5 bg-emerald-50 border-t border-emerald-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Amount Received in Customer Account:</span>
              </span>
              <span className="font-black text-emerald-950 text-base font-price">{amountInWords}</span>
            </div>
            <div className="flex justify-between text-emerald-900 border-t border-emerald-200/60 pt-2 mt-2">
              <span>Payment Mode: <strong>Instant Direct Bank Payout (UPI / IMPS)</strong></span>
              <span>Transaction UTR: <strong className="font-mono text-black">{order.paymentTxRef || "TXN9842109852"}</strong></span>
            </div>
          </div>
        </div>

        {/* CUSTOMER ADVANTAGES & DATA PROTECTION CERTIFICATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2 text-xs">
            <div className="font-black text-brand-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Destruction Guarantee</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              CashALL confirms that all data on your sold device has been completely wiped using DoD 5220.22-M factory standards. No personal files remain on the device.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2 text-xs">
            <div className="font-black text-brand-black flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-brand-yellow" />
              <span>Legal Transfer of Ownership</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              By accepting payment reference <strong>{order.paymentTxRef || "TXN9842109852"}</strong>, ownership of the device has been legally transferred to CashALL Recommerce Technologies.
            </p>
          </div>

        </div>

        {/* FOOTER SIGN-OFF */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-gray-500 text-center sm:text-left">
            <div className="font-bold text-gray-800">Thank you for selling with CashALL!</div>
            <div>For any queries regarding this receipt, contact +91 7003216788 or cashall7003216788@gmail.com</div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-black text-gray-900 text-sm">CashALL Authorized Signatory</div>
            <div className="text-[10px] text-gray-400">Electronically Generated Invoice</div>
          </div>
        </div>

      </div>

    </div>
  );
}
