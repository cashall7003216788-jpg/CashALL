"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  QuoteData,
  INITIAL_VARIANTS,
  INITIAL_MODELS,
  INITIAL_BRANDS,
} from "@/lib/store";
import {
  ShieldCheck,
  Truck,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Smartphone,
  Phone,
  CheckCircle2,
} from "lucide-react";

export default function QuoteResultPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = (params?.quoteId as string) || "quote-demo";

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`cashall_quote_${quoteId}`) || localStorage.getItem("cashall_latest_quote");
      if (stored) {
        try {
          setQuote(JSON.parse(stored));
          return;
        } catch (e) {
          console.error(e);
        }
      }

      // Fallback demo quote
      const fallbackQuote: QuoteData = {
        id: quoteId,
        quoteNumber: "CAQ-984210",
        variantId: "v-ip15-128",
        selectedAnswersJson: JSON.stringify([]),
        basePrice: 32000,
        totalDeductions: 1200,
        estimatedPrice: 31400,
        breakdownJson: JSON.stringify([
          { category: "BASIC", title: "Does phone power on?", selection: "Turns ON normally", amount: 0 },
          { category: "SCREEN", title: "Screen condition", selection: "Minor Scratches", amount: -1200 },
          { category: "BODY", title: "Body condition", selection: "Flawless Body", amount: 300 },
          { category: "ACCESSORIES", title: "Accessories", selection: "Original Box + Charger", amount: 600 },
        ]),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };
      setQuote(fallbackQuote);
    }
  }, [quoteId]);

  if (!quote) return null;

  const variant = INITIAL_VARIANTS.find((v) => v.id === quote.variantId) || INITIAL_VARIANTS[0];
  const model = INITIAL_MODELS.find((m) => m.id === variant.modelId) || INITIAL_MODELS[0];
  const brand = INITIAL_BRANDS.find((b) => b.id === model.brandId) || INITIAL_BRANDS[0];

  const breakdown: Array<{ category: string; title: string; selection: string; amount: number }> =
    JSON.parse(quote.breakdownJson || "[]");

  const handleScheduleClick = () => {
    // Check if customer phone is already stored
    if (typeof window !== "undefined") {
      const existingUser = localStorage.getItem("cashall_user");
      if (existingUser) {
        router.push(`/checkout/pickup?quoteId=${quote.id}`);
        return;
      }
    }
    setAuthModalOpen(true);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        alert(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, code: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        const userObj = {
          id: `u-${Date.now()}`,
          name: customerName || "Phone Seller",
          phone: phoneNumber,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("cashall_user", JSON.stringify(userObj));
        }
        setAuthModalOpen(false);
        router.push(`/checkout/pickup?quoteId=${quote.id}`);
      } else {
        alert(data.error || "Invalid OTP code. Please check and try again.");
      }
    } catch (err) {
      alert("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* QUOTE RESULT HEADER */}
          <div className="bg-brand-black text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-2xl relative overflow-hidden text-center space-y-4">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant CashALL Valuation</span>
            </div>

            <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              YOUR ESTIMATED CASHALL VALUE
            </h1>

            <div className="text-4xl sm:text-6xl font-black text-brand-yellow tracking-tight font-price">
              ₹{quote.estimatedPrice.toLocaleString("en-IN")}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <Smartphone className="w-4 h-4 text-brand-yellow" />
              <span className="font-bold">{brand.name} {model.name}</span>
              <span className="text-gray-500">•</span>
              <span>{variant.storage} Storage</span>
            </div>

            {/* EXPIRY TIMER */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 rounded-full py-1.5 px-4 max-w-xs mx-auto">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Quote valid for 48 hours</span>
            </div>
          </div>

          {/* TRANSPARENT PRICE BREAKDOWN CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-brand-black">
                  Transparent Price Calculation
                </h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  Line-item breakdown of how your estimated price was derived
                </p>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                Quote ID: {quote.quoteNumber}
              </span>
            </div>

            <div className="divide-y divide-gray-100 text-xs sm:text-sm">
              {/* BASE PRICE */}
              <div className="py-3 flex items-center justify-between font-bold text-brand-black">
                <div>
                  <span>Base Acquisition Value ({variant.storage})</span>
                  <div className="text-[11px] font-normal text-brand-muted">Market baseline for flawless unit</div>
                </div>
                <span className="font-price text-base">₹{quote.basePrice.toLocaleString("en-IN")}</span>
              </div>

              {/* DEDUCTIONS & BONUSES */}
              {breakdown.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand-black">{item.title}</span>
                    <span className="text-gray-400 ml-2">({item.selection})</span>
                  </div>
                  <span
                    className={`font-bold font-price ${
                      item.amount > 0 ? "text-green-600" : item.amount < 0 ? "text-red-600" : "text-gray-400"
                    }`}
                  >
                    {item.amount > 0 ? `+₹${item.amount}` : item.amount < 0 ? `-₹${Math.abs(item.amount)}` : "₹0"}
                  </span>
                </div>
              ))}

              {/* TOTAL ESTIMATED VALUE */}
              <div className="pt-4 pb-2 flex items-center justify-between font-black text-base sm:text-lg text-brand-black">
                <span>Estimated CashALL Value</span>
                <span className="text-xl sm:text-2xl font-price text-black">
                  ₹{quote.estimatedPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* TRUST BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Truck className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>Fast Doorstep Pickup</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Zap className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>Payment Upon Verification</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button
                onClick={handleScheduleClick}
                variant="primary"
                size="lg"
                fullWidth
                className="font-black text-base py-4 gap-2 shadow-yellowGlow"
              >
                <span>SCHEDULE FAST PICKUP</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

          </div>

          {/* MANDATORY DISCLAIMER BOX (Section 25) */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950">Transparent Inspection Disclaimer</h4>
              <p className="leading-relaxed">
                This is an estimated price based on the information you provided. Your final price will be confirmed after physical inspection at your doorstep. If the physical condition differs, CashALL will show you the revised price and reason before you decide whether to sell.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* PHONE / OTP VERIFICATION MODAL */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={otpSent ? "Verify OTP Code" : "Verify Phone Number"}
      >
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-xs text-brand-muted">
              Enter your mobile number to schedule pickup and save your quote.
            </p>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-3 py-2.5 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">10-Digit Mobile Number</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-gray-500">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  placeholder="9876543210"
                  required
                  className="w-full pl-12 pr-3 py-2.5 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading || phoneNumber.length < 10}
              className="font-bold text-xs"
            >
              {loading ? "Sending OTP..." : "Get Verification OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-xs text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Verification OTP sent to <strong>+91 {phoneNumber}</strong>. Enter the 6-digit code.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                placeholder="123456"
                required
                className="w-full px-3 py-2.5 text-center text-lg font-bold tracking-widest bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading}
              className="font-bold text-xs"
            >
              {loading ? "Verifying..." : "Verify & Proceed to Pickup"}
            </Button>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
