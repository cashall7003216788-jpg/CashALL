"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Upload,
} from "lucide-react";

export default function PartnerPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [upiId, setUpiId] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [isCorporateAccount, setIsCorporateAccount] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !utrNumber.trim() || !amount) {
      setError("Please complete all required UPI payment details.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/orders/${params.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          upiId: upiId.trim(),
          utrNumber: utrNumber.trim(),
          paymentProofUrl: paymentProofUrl.trim() || `https://cashall.in/uploads/payments/utr_${utrNumber.trim()}.jpg`,
          isCorporateAccount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to record manual UPI payment.");
      }

      router.push(`/partner/orders/${params.id}/signature`);
    } catch (err: any) {
      setError(err.message || "Payment verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 max-w-xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h1 className="text-base font-black text-white">Manual UPI Payment Recording</h1>
          <p className="text-[11px] text-gray-400">Google Pay / Paytm / PhonePe UTR Reference</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
          <CreditCard className="w-5 h-5 text-brand-yellow" />
        </div>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitPayment} className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>UPI Payout Details</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Payment Amount (₹) * (Locked to Accepted Final Price)
              </label>
              <input
                type="number"
                placeholder="e.g. 49500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-base text-brand-yellow font-black p-3 rounded-xl focus:border-brand-yellow focus:outline-none font-price"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Customer UPI ID / PhonePe / Paytm Number *
              </label>
              <input
                type="text"
                placeholder="e.g. seller@okaxis or 6289477287@ybl"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                UPI UTR / Bank Reference Number * (12 Digits)
              </label>
              <input
                type="text"
                placeholder="e.g. 423891049281"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none font-mono"
                required
              />
            </div>

            {/* Corporate vs Partner Personal Account */}
            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCorporateAccount}
                  onChange={(e) => setIsCorporateAccount(e.target.checked)}
                  className="w-4 h-4 accent-brand-yellow rounded"
                />
                <span className="text-xs font-bold text-white">
                  Paid via CashALL Corporate UPI Account
                </span>
              </label>
              <p className="text-[10px] text-gray-400 leading-snug">
                Uncheck only if explicit CashALL authorization was granted to use field partner personal account.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Payment Screenshot Proof URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://cashall.in/uploads/payments/proof.jpg"
                value={paymentProofUrl}
                onChange={(e) => setPaymentProofUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-yellow text-brand-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-yellowHover shadow-yellowGlow transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Validating & Confirming Payment...</span>
          ) : (
            <>
              <span>Confirm Payment & Proceed to eSign</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
