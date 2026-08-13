"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Lock,
  XCircle,
} from "lucide-react";

export default function PartnerVerificationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const [idType, setIdType] = useState<"AADHAAR" | "PAN" | "VOTER_ID" | "DRIVING_LICENSE">("AADHAAR");
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        const ord = data.order || data.data?.order;
        setOrder(ord);
        if (ord?.user?.name) setFullName(ord.user.name);
        
        // If already identity verified, proceed to signature
        if (ord?.status === "IDENTITY_VERIFIED") {
          router.push(`/partner/orders/${params.id}/signature`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim() || idNumber.length < 4) {
      setError("Please enter a valid government ID number.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/orders/${params.id}/verify-identity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idType,
          idNumber: idNumber.trim(),
          fullName: fullName.trim() || "CashALL Customer",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Seller identity verification failed.");
      }

      if (data.data?.verification?.status === "VERIFIED" || data.data?.order?.status === "IDENTITY_VERIFIED") {
        router.push(`/partner/orders/${params.id}/signature`);
      } else {
        setError(`Identity verification result: ${data.data?.verification?.status || "PENDING"}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to trigger seller identity verification.");
    } finally {
      setVerifying(false);
    }
  };

  // Customer Offer Simulation helper for doorstep demo
  const handleSimulateCustomerAcceptance = async (accept: boolean) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/orders/${params.id}/accept-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      if (res.ok) {
        await fetchOrder();
      } else {
        const d = await res.json();
        setError(d.message || "Failed to update offer response.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-brand-yellow mr-2" />
        <span className="text-xs text-gray-400 font-semibold">Loading Seller Verification...</span>
      </div>
    );
  }

  const isRejected = order?.status === "REJECTED" || order?.status === "DECLINED";
  const isPendingCustomer = order?.status === "FINAL_OFFER";
  const finalPrice = order?.finalPrice || order?.quote?.estimatedPrice || 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 max-w-xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h1 className="text-base font-black text-white">SELLER VERIFICATION</h1>
          <p className="text-[11px] text-gray-400">Order #{order?.orderNumber || params.id}</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
          <UserCheck className="w-5 h-5 text-brand-yellow" />
        </div>
      </div>

      {/* FINAL PURCHASE PRICE BADGE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Final Purchase Price</span>
          <span className="text-2xl font-black text-brand-yellow font-price">
            ₹{finalPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Order Status</span>
          <span className="text-xs font-black text-white px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700">
            {order?.status?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* CASE 1: REJECTED BY CUSTOMER */}
      {isRejected && (
        <div className="bg-red-950 border border-red-800 text-red-300 p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm">
            <XCircle className="w-5 h-5" />
            <span>TRANSACTION TERMINATED</span>
          </div>
          <p className="text-xs leading-relaxed text-red-200">
            The customer declined the final offer of ₹{finalPrice.toLocaleString("en-IN")}.
            No seller identity verification, eSign, or payment will be processed.
          </p>
        </div>
      )}

      {/* CASE 2: AWAITING CUSTOMER ACCEPTANCE */}
      {isPendingCustomer && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-brand-yellow font-extrabold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Awaiting Customer Final Offer Acceptance</span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Final offer of <strong>₹{finalPrice.toLocaleString("en-IN")}</strong> submitted.
            Please ask the customer to accept the offer on their CashALL app/device before proceeding to identity verification.
          </p>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 space-y-3">
            <div className="text-[11px] text-gray-400 font-bold uppercase">Customer Response Action (Doorstep Executive Helper)</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSimulateCustomerAcceptance(true)}
                className="py-3 bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
              >
                CUSTOMER ACCEPTS OFFER
              </button>
              <button
                type="button"
                onClick={() => handleSimulateCustomerAcceptance(false)}
                className="py-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs rounded-xl transition-all"
              >
                CUSTOMER DECLINES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASE 3: READY FOR ID VERIFICATION */}
      {!isRejected && !isPendingCustomer && (
        <form onSubmit={handleStartVerification} className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5">
            <div className="space-y-1 border-b border-neutral-800 pb-3">
              <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Government Seller Identification</span>
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed pt-1">
                Before completing the sale, CashALL requires verification of the seller&apos;s identity.
                Please ask the customer to provide the required government ID.
              </p>
            </div>

            {error && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-2xl font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1.5">
                  Select Government ID Type *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "AADHAAR", label: "Aadhaar Card" },
                    { id: "PAN", label: "PAN Card" },
                    { id: "VOTER_ID", label: "Voter ID" },
                    { id: "DRIVING_LICENSE", label: "Driving License" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setIdType(t.id as any)}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        idType === t.id
                          ? "bg-brand-yellow/15 border-brand-yellow text-brand-yellow"
                          : "bg-neutral-950 border-neutral-800 text-gray-400 hover:border-neutral-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">
                  Seller Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="Full Legal Name on Government ID"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">
                  ID Number (Aadhaar / PAN / Driving License) *
                </label>
                <input
                  type="text"
                  placeholder={idType === "AADHAAR" ? "12-Digit Aadhaar Number" : "Government ID Reference"}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none font-mono"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  🔒 Data Minimization: CashALL masks sensitive identity numbers and never displays full raw Aadhaar numbers.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-4 bg-brand-yellow text-brand-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-yellowHover shadow-yellowGlow transition-all disabled:opacity-50"
          >
            {verifying ? (
              <span>Connecting to Identity e-KYC Provider...</span>
            ) : (
              <>
                <span>START ID VERIFICATION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
