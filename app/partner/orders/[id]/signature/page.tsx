"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  FileText,
} from "lucide-react";

export default function PartnerSignaturePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [signerName, setSignerName] = useState("");
  const [signerPhone, setSignerPhone] = useState("");
  const [deviceReceivedConfirmed, setDeviceReceivedConfirmed] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultDeclaration =
    "I confirm that I am the lawful owner or authorized seller of this device. The information supplied and IMEI numbers are accurate. The device has not knowingly been obtained through theft or fraud and is not subject to conflicting ownership claims. I authorize CashALL to purchase the device under agreed terms.";

  const handleCompleteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || signerPhone.length < 10) {
      setError("Please enter the seller's full legal name and 10-digit phone number.");
      return;
    }
    if (!deviceReceivedConfirmed) {
      setError("You must confirm physical receipt of the device into CashALL custody.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Process eSign
      const esignRes = await fetch(`/api/v1/orders/${params.id}/esign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signerPhone: signerPhone.trim(),
          sellerDeclaration: defaultDeclaration,
        }),
      });

      const esignData = await esignRes.json();
      if (!esignRes.ok) {
        throw new Error(esignData.message || "Failed to record electronic signature.");
      }

      // 2. Device Received Confirmation
      await fetch(`/api/v1/orders/${params.id}/device-received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // 3. Generate Final Bill & Complete Order
      const billRes = await fetch(`/api/v1/orders/${params.id}/generate-bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const billData = await billRes.json();
      if (!billRes.ok) {
        throw new Error(billData.message || "Failed to generate final bill.");
      }

      router.push(`/partner/orders?success=1`);
    } catch (err: any) {
      setError(err.message || "Failed to complete transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 max-w-xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h1 className="text-base font-black text-white">eSignature & Device Receipt</h1>
          <p className="text-[11px] text-gray-400">Final Legal Signing & Handover Confirmation</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
          <FileCheck className="w-5 h-5 text-brand-yellow" />
        </div>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleCompleteTransaction} className="space-y-6">
        {/* Seller Ownership Declaration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Seller Legal Ownership Declaration</span>
          </h2>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-gray-300 space-y-3 leading-relaxed">
            <p className="font-medium">{defaultDeclaration}</p>

            <div className="border-t border-neutral-800 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-4 h-4 accent-brand-yellow rounded"
                  required
                />
                <span className="text-xs font-bold text-white">
                  Customer accepts and acknowledges legal declaration
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Seller Full Legal Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Seller Mobile Phone Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 6289477287"
                maxLength={10}
                value={signerPhone}
                onChange={(e) => setSignerPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Device Handover Checkbox */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
          <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4" />
            <span>Device Physical Custody Confirmation</span>
          </h2>

          <label className="flex items-center gap-3 p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={deviceReceivedConfirmed}
              onChange={(e) => setDeviceReceivedConfirmed(e.target.checked)}
              className="w-5 h-5 accent-brand-yellow rounded"
            />
            <span className="text-xs font-extrabold text-white">
              I confirm I have physically received the device, charger, and accessories from the customer.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !deviceReceivedConfirmed}
          className="w-full py-4 bg-brand-yellow text-brand-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-yellowHover shadow-yellowGlow transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Signing & Generating Signed Bill...</span>
          ) : (
            <>
              <span>Complete Transaction & Generate Bill</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
