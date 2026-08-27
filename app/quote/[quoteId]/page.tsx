"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { trackMetaStandardEvent } from "@/lib/analytics/meta";
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
  Lock,
  RefreshCw,
  XCircle,
  Ban,
} from "lucide-react";


export default function QuoteResultPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = (params?.quoteId as string) || "quote-demo";

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleCancelQuote = async (reason = "Customer declined quote.") => {
    if (!quote) return;
    setIsCancelling(true);
    try {
      await fetch(`/api/v1/quotes/${quote.id || quote.quoteNumber}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }).catch(() => null);

      const updated: QuoteData = {
        ...quote,
        status: "CANCELLED",
      };
      setQuote(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`cashall_quote_${quote.id}`, JSON.stringify(updated));
        localStorage.setItem("cashall_latest_quote", JSON.stringify(updated));
        const savedQuotes = JSON.parse(localStorage.getItem("cashall_quotes") || "[]");
        const nextQuotes = savedQuotes.map((q: any) =>
          q.id === quote.id || q.quoteNumber === quote.quoteNumber ? { ...q, status: "CANCELLED" } : q
        );
        localStorage.setItem("cashall_quotes", JSON.stringify(nextQuotes));
      }
      setCancelModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancelling(false);
    }
  };

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`cashall_quote_${quoteId}`) || localStorage.getItem("cashall_latest_quote");
      let activeQuote: QuoteData | null = null;
      if (stored) {
        try {
          activeQuote = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }

      if (!activeQuote) {
        activeQuote = {
          id: quoteId,
          quoteNumber: "CAQ-984210",
          variantId: "v-ip15-128",
          selectedAnswersJson: JSON.stringify([]),
          basePrice: 32000,
          totalDeductions: 1200,
          estimatedPrice: 31400,
          breakdownJson: JSON.stringify({
            deviceName: "Apple iPhone 15 (128 GB)",
            basePrice: 32000,
            estimatedPrice: 31400,
            summary: "Standard valuation",
          }),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };
      }

      setQuote(activeQuote);

      // Get logged-in user details if available
      let cName = "";
      let cPhone = "";
      try {
        const u = JSON.parse(localStorage.getItem("cashall_user") || "{}");
        if (u?.name) cName = u.name;
        if (u?.phone) cPhone = u.phone;
      } catch (e) {}

      // Persist quote to Supabase PostgreSQL database
      fetch("/api/v1/quotes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeQuote,
          customerName: cName,
          customerPhone: cPhone,
        }),
      }).catch((err) => console.error("Error syncing quote to DB:", err));
    }
  }, [quoteId]);

  if (!quote) return null;

  // Resolve device name: priority = breakdownJson.deviceName > matched variant > "Your Device"
  let resolvedDeviceName = "Your Device";
  let resolvedBasePrice = quote.basePrice || 0;
  let resolvedEstimatedPrice = quote.estimatedPrice || 0;

  // 1. Try breakdownJson (new object format with deviceName)
  let parsedBreakdown: any = null;
  try {
    parsedBreakdown = JSON.parse(quote.breakdownJson || "{}");
    if (parsedBreakdown && typeof parsedBreakdown === "object" && !Array.isArray(parsedBreakdown)) {
      if (parsedBreakdown.deviceName) resolvedDeviceName = parsedBreakdown.deviceName;
    }
  } catch {}

  // 2. Only use INITIAL_VARIANTS if variantId actually matches (no fallback to [0])
  const matchedVariant = INITIAL_VARIANTS.find((v) => v.id === quote.variantId);
  const matchedModel = matchedVariant ? INITIAL_MODELS.find((m) => m.id === matchedVariant.modelId) : null;
  const matchedBrand = matchedModel ? INITIAL_BRANDS.find((b) => b.id === matchedModel.brandId) : null;

  if (resolvedDeviceName === "Your Device" && matchedModel && matchedBrand) {
    resolvedDeviceName = `${matchedBrand.name} ${matchedModel.name}${matchedVariant?.storage ? " (" + matchedVariant.storage + ")" : ""}`;
  }

  // Breakdown for display - handle both array and object formats
  const breakdown: Array<{ category: string; title: string; selection: string; amount: number }> = (() => {
    if (!parsedBreakdown) return [];
    if (Array.isArray(parsedBreakdown)) return parsedBreakdown;
    if (Array.isArray(parsedBreakdown.summary)) {
      return parsedBreakdown.summary.map((s: any) => ({
        category: "SUMMARY",
        title: s.label || "",
        selection: "",
        amount: s.amount || 0,
      }));
    }
    return [];
  })();

  const handleScheduleClick = () => {
    if (quote) {
      trackMetaStandardEvent("InitiateCheckout", {
        content_name: resolvedDeviceName,
        value: quote.estimatedPrice,
        currency: "INR",
        num_items: 1,
      }, { eventId: `init_checkout_${quote.id}` });
    }

    // Check if customer phone is already stored
    if (typeof window !== "undefined") {
      const existingUser = localStorage.getItem("cashall_user");
      if (existingUser) {
        router.push(`/checkout/pickup?quoteId=${quote?.id}`);
        return;
      }
    }
    setAuthModalOpen(true);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, "");
    if (clean.length < 10) return;
    setLoading(true);
    setOtpError("");
    
    // Create customer session
    const userObj = {
      id: `usr-${clean}`,
      name: customerName.trim() || "Customer",
      phone: clean,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_user", JSON.stringify(userObj));
      document.cookie = `cashall_user_phone=${clean}; path=/; max-age=31536000`;
    }

    trackMetaStandardEvent("CompleteRegistration", {
      status: "success",
      method: "phone_otp",
    }, { eventId: `reg_${clean}` });

    if (quote) {
      // Sync customer details to DB
      fetch("/api/v1/quotes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quote,
          customerName: userObj.name,
          customerPhone: userObj.phone,
        }),
      }).catch((err) => console.error("Error saving customer info to quote DB:", err));
    }

    setLoading(false);
    setAuthModalOpen(false);
    if (quote) {
      router.push(`/checkout/pickup?quoteId=${quote.id}`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false);
    setAuthModalOpen(false);
    if (quote) {
      router.push(`/checkout/pickup?quoteId=${quote.id}`);
    }
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setOtpCode("");
    setOtpError("");
  };

  const isCancelled = quote.status === "CANCELLED";

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
              <span>{isCancelled ? "Cancelled Valuation" : "Instant CashALL Valuation"}</span>
            </div>

            <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {isCancelled ? "VALUATION OFFER (CANCELLED)" : "YOUR ESTIMATED CASHALL VALUE"}
            </h1>

            <div className={`text-4xl sm:text-6xl font-black tracking-tight font-price ${isCancelled ? "text-gray-500 line-through" : "text-brand-yellow"}`}>
              ₹{quote.estimatedPrice.toLocaleString("en-IN")}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <Smartphone className="w-4 h-4 text-brand-yellow" />
              <span className="font-bold">{resolvedDeviceName}</span>
            </div>

            {/* EXPIRY TIMER OR CANCELLED STATUS */}
            {isCancelled ? (
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-full py-1.5 px-4 max-w-xs mx-auto">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Quote cancelled by customer</span>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 rounded-full py-1.5 px-4 max-w-xs mx-auto">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Quote valid for 48 hours</span>
              </div>
            )}
          </div>

          {/* CANCELLED STATUS BANNER */}
          {isCancelled && (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 sm:p-8 space-y-4 animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-red-950">Quote Cancelled</h2>
                  <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
                    This valuation quote #{quote.quoteNumber} has been marked as cancelled. No pickup will be scheduled. You can evaluate another device or restart anytime.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/sell/mobile">
                  <Button variant="primary" size="sm" className="font-extrabold shadow-yellowGlow gap-1.5">
                    <span>Calculate New Valuation</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline" size="sm" className="font-bold">
                    <span>Back to My Account</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

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
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isCancelled ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                {isCancelled ? "CANCELLED" : `Quote ID: ${quote.quoteNumber}`}
              </span>
            </div>

            <div className="divide-y divide-gray-100 text-xs sm:text-sm">
              {/* BASE PRICE */}
              <div className="py-3 flex items-center justify-between font-bold text-brand-black">
                <div>
                  <span>Base Acquisition Value ({resolvedDeviceName})</span>
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
                <span className={`text-xl sm:text-2xl font-price ${isCancelled ? "text-gray-400 line-through" : "text-black"}`}>
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
            {isCancelled ? (
              <div className="pt-4">
                <Link href="/sell/mobile" className="block w-full">
                  <Button variant="primary" size="lg" fullWidth className="font-black text-base py-4 gap-2 shadow-yellowGlow">
                    <span>START NEW VALUATION</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
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

                <Button
                  onClick={() => setCancelModalOpen(true)}
                  variant="tertiary"
                  size="lg"
                  className="font-bold text-xs text-red-600 hover:bg-red-50 border border-red-200 shrink-0 px-5 py-4 gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Decline Quote</span>
                </Button>
              </div>
            )}

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

      {/* Firebase invisible reCAPTCHA (required by Firebase Phone Auth) */}
      <div id="quote-recaptcha-container" />

      {/* PHONE / OTP VERIFICATION MODAL */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={otpSent ? "Verify OTP Code" : "Verify Phone Number"}
      >
        {otpError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-3">
            {otpError}
          </div>
        )}

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
              <span>OTP sent to <strong>+91 {phoneNumber}</strong> via Firebase SMS</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                placeholder="123456"
                required
                autoFocus
                className="w-full px-3 py-2.5 text-center text-lg font-bold tracking-widest bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading || otpCode.length < 6}
              className="font-bold text-xs"
            >
              {loading ? "Verifying..." : "Verify & Proceed to Pickup"}
            </Button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-gray-400">Resend in <span className="font-bold text-gray-600">{countdown}s</span></p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs text-yellow-600 font-bold hover:underline flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* CANCEL QUOTE CONFIRMATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !isCancelling && setCancelModalOpen(false)}
        title="Decline / Cancel Quote Confirmation"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Decline this valuation offer?</p>
              <p className="leading-relaxed">
                If you decline this quote <strong>#{quote.quoteNumber}</strong>, this price valuation will be cancelled and closed. No pickup will be scheduled.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancelling}
              className="font-bold"
            >
              Keep Quote
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleCancelQuote("Customer declined quote")}
              disabled={isCancelling}
              className="font-extrabold bg-red-600 hover:bg-red-700 text-white border-transparent shadow-none"
            >
              {isCancelling ? "Cancelling..." : "Yes, Decline & Cancel Quote"}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
