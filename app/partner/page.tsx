"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Phone,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  LogOut,
  AlertCircle,
} from "lucide-react";

export default function PartnerPortalPage() {
  const router = useRouter();
  const [partnerUser, setPartnerUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cashall_partner_session");
      if (stored) {
        try {
          setPartnerUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/partner-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Partner authentication failed.");
      }

      const sessionObj = data.data?.partner || {
        id: `p_${Date.now()}`,
        name: name.trim() || `Executive ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        businessName: "CashALL Doorstep Logistics",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("cashall_partner_session", JSON.stringify(sessionObj));
      }
      setPartnerUser(sessionObj);
      router.push("/partner/orders");
    } catch (err: any) {
      setError(err.message || "Failed to log in to Partner Portal.");
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cashall_partner_session");
    }
    setPartnerUser(null);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full space-y-8 pt-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-yellow/20 rounded-3xl flex items-center justify-center mx-auto border border-brand-yellow/30">
            <Truck className="w-8 h-8 text-brand-yellow" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-price text-brand-yellow">
            CashALL Partner
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Field Inspection & Doorstep Pickup Portal
          </p>
        </div>

        {/* LOGGED IN VIEW */}
        {partnerUser ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 text-brand-yellow flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-brand-yellow">Logged In Executive</div>
                  <div className="text-sm font-extrabold text-white">{partnerUser.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono">+91 {partnerUser.phone}</div>
                </div>
              </div>

              <button
                onClick={handlePartnerLogout}
                className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-neutral-900 transition-colors"
                title="Switch Partner Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-brand-yellow uppercase tracking-wider">
                Field Executive Access
              </div>
              <h2 className="text-lg font-extrabold text-white">
                Assigned Doorstep Pickups
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Inspect devices, verify IMEIs, record manual UPI payments, and complete customer eSignatures on location.
              </p>
            </div>

            <Link
              href="/partner/orders"
              className="w-full py-4 bg-brand-yellow text-brand-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-yellowHover shadow-yellowGlow transition-all"
            >
              <span>View My Assigned Pickups</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* PARTNER LOGIN FORM */
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <div className="text-xs font-bold text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Executive Authentication</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">
                Log In to Partner Portal
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enter your registered mobile phone number to view your assigned field pickups.
              </p>
            </div>

            {error && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-2xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePartnerLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">
                  Registered Mobile Number *
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white pl-10 pr-3 py-3 rounded-xl focus:border-brand-yellow focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">
                  Executive Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full py-4 bg-brand-yellow text-brand-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-yellowHover shadow-yellowGlow transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating Executive...</span>
                ) : (
                  <>
                    <span>LOG IN TO PARTNER PORTAL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-3 pt-2 text-xs text-gray-400">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>Structured 15-Point Hardware Checklist</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>Automatic IMEI 1/2 Verification & Blacklist Check</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>Manual UPI Payment Proof & UTR Lock</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>Doorstep Seller e-KYC Identity Verification</span>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-gray-600 font-semibold py-4">
        © CashALL Recommerce • Partner Field Operations
      </div>
    </div>
  );
}
