"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { OrderData, INITIAL_MODELS, INITIAL_BRANDS, INITIAL_VARIANTS } from "@/lib/store";
import { Printer, Download, ArrowLeft, ShieldCheck, CheckCircle2, Lock, Smartphone } from "lucide-react";

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

export default function PurchaseReceiptPage() {
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
          <h1 className="text-xl font-black text-brand-black">Receipt Not Found</h1>
          <p className="text-xs text-gray-500">
            No valid purchase receipt found for order reference <strong className="text-black">#{rawOrderId || "N/A"}</strong>.
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
  const serviceNumber = `MPMLA${Math.floor(10000000 + Math.random() * 90000000)}`;
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 print:bg-white print:p-0 print:m-0 text-black">
      
      {/* NO-PRINT ACTION BAR */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/track/${order.orderNumber}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black bg-white px-4 py-2 rounded-xl border border-gray-300 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Tracking</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-xs font-black text-black bg-brand-yellow hover:bg-yellow-400 px-5 py-2.5 rounded-xl border border-black shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Download PDF</span>
          </button>
        </div>
      </div>

      {/* PAGE 1 CONTAINER */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 border border-gray-300 shadow-xl print:shadow-none print:border-none print:p-0 rounded-2xl print:rounded-none relative overflow-hidden mb-12 page-break-after">
        
        {/* WATERMARK STAMP */}
        <div className="absolute top-10 right-1/3 opacity-15 pointer-events-none border-4 border-emerald-600 rounded-full p-6 rotate-[-12deg] text-emerald-800 text-center font-black">
          <div className="text-xl uppercase tracking-widest">DEVICE TRANSFER</div>
          <div className="text-3xl font-black">CERTIFICATE</div>
          <div className="text-xs">VERIFIED & DATA WIPED</div>
        </div>

        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-6 mb-6 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Purchase Receipt.</h1>
            <div className="mt-3 space-y-1 text-xs text-gray-600 font-medium">
              <div><span className="font-bold text-gray-900">Order created on :</span> {formattedDate}</div>
              <div><span className="font-bold text-gray-900">Service Number :</span> {serviceNumber}</div>
              <div><span className="font-bold text-gray-900">Order Ref ID :</span> {order.orderNumber}</div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">www.cashall.in</div>
            <div className="text-base font-black text-gray-900">CashALL Recommerce Technologies Pvt Ltd</div>
            <div className="text-xs text-gray-500 font-medium">CIN: U27205DL2026PTC190441</div>
            <div className="text-xs text-gray-500 font-medium">GST: 07AAGCM0328J3ZK</div>
          </div>
        </div>

        {/* PURCHASER & SELLER GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          
          {/* PURCHASER BOX */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2 text-xs">
            <div className="font-black text-gray-900 border-b border-gray-200 pb-2 text-sm">Purchaser Details</div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-gray-700">Purchaser :</span>
              <span className="col-span-2 font-bold text-gray-900">CASHALL RECOMMERCE ENTERPRISE</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-gray-700">Address :</span>
              <span className="col-span-2 text-gray-800">Connaught Place, New Delhi - 110001</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-gray-700">GST Number :</span>
              <span className="col-span-2 text-gray-800 font-mono">07AAAAA0000A1Z5</span>
            </div>
          </div>

          {/* SELLER BOX */}
          <div className="bg-teal-500 text-white rounded-2xl p-5 border border-teal-600 space-y-2 text-xs">
            <div className="font-black text-white border-b border-teal-400 pb-2 text-sm">Seller Details</div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-teal-100">Seller :</span>
              <span className="col-span-2 font-black text-white">{order.customerName}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-teal-100">Email :</span>
              <span className="col-span-2 text-teal-50 font-medium">{order.customerPhone ? `cus****@cashall.in` : "customer@cashall.in"}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-teal-100">Phone :</span>
              <span className="col-span-2 font-bold text-white">{order.customerPhone}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-bold text-teal-100">Address :</span>
              <span className="col-span-2 text-teal-50 leading-tight">{order.addressSummary}</span>
            </div>
          </div>

        </div>

        {/* PRICE VALUATION TABLE */}
        <div className="border border-gray-300 rounded-2xl overflow-hidden mb-8">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 border-b border-gray-300 font-bold text-gray-900">
              <tr>
                <th className="p-4">Product Name & Description</th>
                <th className="p-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-4">
                  <div className="font-black text-sm text-gray-900">
                    {order.declaredConditionSummary || "Used Device Valuation"}
                  </div>
                  <div className="text-gray-600 font-mono mt-1 text-[11px]">
                    IMEI No: {order.imeiNumber || "352901547218795"}
                  </div>
                </td>
                <td className="p-4 text-right font-black text-sm text-gray-900">
                  {(finalAmount + 99).toFixed(1)}
                </td>
              </tr>
              <tr className="text-gray-600">
                <td className="p-3 pl-4">Pickup Charges (Fast Doorstep Pickup)</td>
                <td className="p-3 pr-4 text-right font-medium">-0.0</td>
              </tr>
              <tr className="text-gray-600">
                <td className="p-3 pl-4">Coupon / Promotional Bonus</td>
                <td className="p-3 pr-4 text-right font-medium">0.0</td>
              </tr>
              <tr className="text-gray-600">
                <td className="p-3 pl-4">Processing & Administrative Fee</td>
                <td className="p-3 pr-4 text-right font-medium">-99.0</td>
              </tr>
              <tr className="bg-gray-50 font-black text-sm border-t-2 border-gray-400">
                <td className="p-4 text-gray-900">Total Payout Amount</td>
                <td className="p-4 text-right text-gray-900 font-price text-base">
                  ₹{finalAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">Amount Payable (In words) :</span>
              <span className="font-black text-gray-900">{amountInWords}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">Payment Mode :</span>
              <span className="font-bold text-emerald-700">Instant UPI / IMPS Bank Transfer</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">UTR / Transaction Ref No :</span>
              <span className="font-mono text-gray-900 font-bold">{order.paymentTxRef || "TXN9842109852"}</span>
            </div>
          </div>
        </div>

        {/* SECURITY & DATA WIPING GUARANTEE BOX */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="text-center shrink-0">
            <div className="w-24 h-24 bg-white border border-gray-300 rounded-xl p-2 flex items-center justify-center mx-auto shadow-sm">
              {/* QR CODE ILLUSTRATION */}
              <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-black rounded">
                <div className="bg-white rounded-sm" />
                <div className="bg-black" />
                <div className="bg-white rounded-sm" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-white rounded-sm" />
                <div className="bg-white rounded-sm" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-white rounded-sm" />
                <div className="bg-black" />
                <div className="bg-white rounded-sm" />
              </div>
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1 font-bold">CODE: CA-EF92203</div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 font-black text-gray-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Your Device is Safeguarded by CashALL DataSanitize</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              We take data security seriously. To prevent data breach, all CashALL devices are 100% factory data-wiped using DoD 5220.22-M military grade wiping standards. The device then undergoes 32-point inspection testing before authorized resale.
            </p>
            <div className="text-[11px] font-bold text-gray-800">
              Verification Portal: <span className="text-blue-600 underline">https://www.cashall.in/verify-certificate/{order.orderNumber}</span>
            </div>
          </div>
        </div>

        {/* REGISTERED ADDRESS FOOTER */}
        <div className="text-[11px] text-gray-500 border-t border-gray-200 pt-4 flex justify-between items-center">
          <div>
            <span className="font-bold text-gray-700">Registered Office:</span> CashALL Recommerce Technologies, Connaught Place, New Delhi - 110001
          </div>
          <div className="font-bold text-gray-400">Page 1 of 2</div>
        </div>

      </div>

      {/* PAGE 2 CONTAINER: INSPECTION SNAPSHOTS, LEGAL SELF DECLARATION & SIGNATURE */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 border border-gray-300 shadow-xl print:shadow-none print:border-none print:p-0 rounded-2xl print:rounded-none relative overflow-hidden">
        
        {/* SECTION 1: PHYSICAL DEVICE VERIFICATION IMAGES */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
            Executive Physical Inspection Snapshots
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-24 border border-gray-300 flex flex-col items-center justify-center text-center p-2 relative overflow-hidden group">
                <Smartphone className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-[10px] font-bold text-gray-500">Angle #{i}</span>
                <span className="text-[9px] text-emerald-600 font-bold">Verified</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: LEGAL SELF-DECLARATION */}
        <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-3">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
            SELF-DECLARATION FOR SALE OF USED MOBILE/DEVICE
          </h3>
          <p className="text-[11px] text-gray-700 leading-relaxed italic text-justify">
            &quot;The seller, hereby solemnly affirms and declares that I am the rightful and legal owner of the used/pre-owned electronic Gadget/Device/Mobile Phone, hereinafter referred to as the &quot;Mobile/Device.&quot; I assert that I possess full authority and legal entitlement to sell the Mobile/Device, and subsequent to the transfer of ownership, I hereby release any and all liabilities pertaining to the said Mobile/Device. I confirm that the Mobile/Device is in good working condition and is devoid of any encumbrances, liens, or legal claims, and I had submitted genuine documents of my identity. I acknowledge and understand that it is my responsibility to provide accurate and truthful information regarding the condition and specifications of the Mobile/Device. I have removed all personal data and accounts from the Mobile/Device to ensure no access post-transfer of ownership. I indemnify and hold harmless Purchaser from any third-party claims arising from the transaction. I affirm, under penalty of perjury, that the above statements are true and correct to the best of my knowledge and belief.&quot;
          </p>

          {/* CUSTOMER DIGITAL SIGNATURE STAMP */}
          <div className="pt-4 flex justify-end">
            <div className="text-center space-y-1">
              <div className="w-48 h-20 bg-white border border-gray-300 rounded-xl flex items-center justify-center p-2 shadow-inner">
                {/* SIGNATURE ILLUSTRATION */}
                <div className="font-serif italic text-xl font-bold text-blue-900 rotate-[-5deg]">
                  {order.customerName}
                </div>
              </div>
              <div className="text-xs font-black text-gray-900">Customer Digital Signature</div>
              <div className="text-[10px] text-gray-500 font-mono">OTP Verified (+91 7003216788)</div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TERMS & CONDITIONS */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2 mb-8 text-[11px] text-gray-600">
          <div className="font-bold text-gray-900">Terms & Conditions:</div>
          <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
            <li>CashALL is a facilitator & legal purchaser of the pre-owned electronic Gadget/Device.</li>
            <li>Seller and Purchaser are solely liable for their respective liabilities for the transaction and the Gadget/Device towards each other.</li>
            <li>Seller confirms to be the bonafide seller of the Gadget/Device and owns all liabilities towards ownership.</li>
            <li>Purchaser and Seller warrant to indemnify CashALL for any third party claims arising out of the transaction.</li>
            <li>In case of any dispute between Seller/Purchaser and CashALL, Courts situated at New Delhi shall possess exclusive jurisdiction.</li>
          </ol>
        </div>

        {/* FOOTER BANNER */}
        <div className="bg-black text-white rounded-2xl p-6 text-center space-y-1">
          <div className="text-xl font-black tracking-widest uppercase text-brand-yellow">
            THANKS FOR CHOOSING CASHALL
          </div>
          <div className="text-xs text-gray-400 font-medium">
            India&apos;s Most Trusted & Transparent Recommerce Platform — www.cashall.in
          </div>
        </div>

        <div className="text-[11px] text-gray-500 border-t border-gray-200 pt-4 mt-6 flex justify-between items-center">
          <div>Receipt Reference: {order.orderNumber} | Customer: {order.customerName}</div>
          <div className="font-bold text-gray-400">Page 2 of 2</div>
        </div>

      </div>

    </div>
  );
}
