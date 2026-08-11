
"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { PriceUnlockModal } from "@/components/common/PriceUnlockModal";
import {
  INITIAL_BRANDS,
  INITIAL_MODELS,
  INITIAL_VARIANTS,
  INITIAL_PRICING_RULES,
  QuoteData,
} from "@/lib/store";
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Wifi,
  Volume2,
  VolumeX,
  BatteryCharging,
  Camera,
  Mic,
  Bluetooth,
  Vibrate,
  ShieldAlert,
  Zap,
  Box,
  Radio,
  Sliders,
  Check,
} from "lucide-react";

function BrokenScreenIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="10" width="50" height="100" rx="10" stroke="#1E293B" strokeWidth="3" fill="#FFFFFF" />
      <rect x="20" y="20" width="40" height="80" rx="4" stroke="#64748B" strokeWidth="1.5" fill="#F8FAFC" />
      <line x1="34" y1="15" x2="46" y2="15" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 32 30 L 45 48 L 38 60 L 52 75 L 42 90" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 45 48 L 56 42" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 38 60 L 26 68" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DeadSpotLinesIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="10" width="50" height="100" rx="10" stroke="#1E293B" strokeWidth="3" fill="#FFFFFF" />
      <rect x="20" y="20" width="40" height="80" rx="4" stroke="#64748B" strokeWidth="1.5" fill="#F8FAFC" />
      <line x1="34" y1="15" x2="46" y2="15" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="20" x2="32" y2="100" stroke="#EF4444" strokeWidth="2.5" />
      <line x1="42" y1="20" x2="42" y2="100" stroke="#10B981" strokeWidth="1.5" />
      <circle cx="48" cy="65" r="3.5" fill="#10B981" />
    </svg>
  );
}

function BodyDefectsIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 22 15 L 56 10 C 61 9 65 13 65 18 L 65 98 C 65 103 61 107 56 107 L 22 112 Z" stroke="#1E293B" strokeWidth="3" fill="#FFFFFF" />
      <path d="M 15 20 L 22 15 L 22 112 L 15 106 C 13 104 12 100 12 96 L 12 26 C 12 22 13 18 15 20 Z" stroke="#1E293B" strokeWidth="2" fill="#F1F5F9" />
      <rect x="26" y="22" width="10" height="22" rx="4" stroke="#1E293B" strokeWidth="2" fill="#E2E8F0" />
      <circle cx="31" cy="27" r="2.5" fill="#1E293B" />
      <circle cx="31" cy="37" r="2.5" fill="#1E293B" />
      <line x1="8" y1="35" x2="14" y2="33" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="45" x2="14" y2="43" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="75" x2="14" y2="73" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PanelMissingIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="10" width="14" height="100" rx="5" stroke="#1E293B" strokeWidth="3" fill="#F8FAFC" />
      <rect x="18" y="30" width="2" height="12" rx="1" fill="#1E293B" />
      <rect x="18" y="50" width="2" height="8" rx="1" fill="#1E293B" />
      <rect x="34" y="20" width="5" height="22" rx="2" stroke="#1E293B" strokeWidth="2" fill="#CBD5E1" />
      <path d="M 48 18 L 48 102" stroke="#1E293B" strokeWidth="2.5" strokeDasharray="3 3" />
      <circle cx="56" cy="60" r="10" stroke="#1E293B" strokeWidth="2" fill="#FFFFFF" />
      <line x1="51" y1="60" x2="61" y2="60" stroke="#000000" strokeWidth="2" />
      <line x1="56" y1="55" x2="56" y2="65" stroke="#000000" strokeWidth="2" />
    </svg>
  );
}

export default function ConditionAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "iphone-15";
  const variantIdParam = searchParams.get("variantId") || "v-ip15-128";

  const brand = INITIAL_BRANDS.find((b) => b.slug === brandSlug) || INITIAL_BRANDS[0];
  const model =
    INITIAL_MODELS.find((m) => m.slug === modelSlug) ||
    INITIAL_MODELS.find((m) => m.slug === "iphone-15")!;
  const variant =
    INITIAL_VARIANTS.find((v) => v.id === variantIdParam) ||
    INITIAL_VARIANTS.find((v) => v.modelId === model.id) ||
    INITIAL_VARIANTS[0];

  // AUTH CHECK STATE
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("cashall_user"));
    }
  }, []);

  // WIZARD STATE
  const [step, setStep] = useState<number>(1);

  // STEP 1: BASIC QUESTIONS (YES/NO)
  const [underWarranty, setUnderWarranty] = useState<boolean | null>(null);
  const [validBill, setValidBill] = useState<boolean | null>(null);
  const [powerWorking, setPowerWorking] = useState<boolean | null>(null);
  const [callsWorking, setCallsWorking] = useState<boolean | null>(null);
  const [touchWorking, setTouchWorking] = useState<boolean | null>(null);
  const [screenOriginal, setScreenOriginal] = useState<boolean | null>(null);

  // STEP 2: MAJOR DEFECT CATEGORIES (MULTI-SELECT)
  const [selectedMajorDefects, setSelectedMajorDefects] = useState<string[]>([]);

  // STEP 3: SCRATCHES & DENTS SUB-STEP
  const [scratchLevel, setScratchLevel] = useState<string>("no_scratches"); // "more_than_2", "1_2_scratches", "no_scratches"
  const [dentLevel, setDentLevel] = useState<string>("no_dents"); // "major_dents", "1_2_dents", "no_dents"

  // STEP 4: FUNCTIONAL & HARDWARE PROBLEMS (MULTI-SELECT)
  const [selectedFunctionalIssues, setSelectedFunctionalIssues] = useState<string[]>([]);

  // STEP 5: ACCESSORIES (MULTI-SELECT)
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(["charger", "box"]);

  // TOGGLE MULTI-SELECT HELPER
  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const getRuleDeduction = (questionId: string, optionId: string): number => {
    const rule = INITIAL_PRICING_RULES.find((r) => r.questionId === questionId && r.optionId === optionId);
    if (!rule) return 0;
    return rule.adjustmentType === "PERCENTAGE_DEDUCTION" ? rule.adjustmentValue : 0;
  };

  // CALCULATE DYNAMIC ESTIMATED PRICE (Linked to Admin Pricing Rules Matrix)
  const calculateEstimatedPrice = () => {
    const baseP = variant.basePrice;
    let totalDeductionPct = 0;

    // Step 1 Percentage Deductions
    if (underWarranty === false) totalDeductionPct += getRuleDeduction("q-warranty", "o-w-no");
    if (validBill === false) totalDeductionPct += getRuleDeduction("q-gst-bill", "o-gb-no");
    if (powerWorking === false) totalDeductionPct += getRuleDeduction("q-power", "o-p-no");
    if (callsWorking === false) totalDeductionPct += getRuleDeduction("q-calls", "o-c-no");
    if (touchWorking === false) totalDeductionPct += getRuleDeduction("q-touch", "o-t-no");
    if (screenOriginal === false) totalDeductionPct += getRuleDeduction("q-screen-orig", "o-so-no");

    // Step 2 Major Defect Percentage Deductions
    if (selectedMajorDefects.includes("screen_broken")) totalDeductionPct += getRuleDeduction("q-screen-defect", "o-s-cracked");
    if (selectedMajorDefects.includes("screen_lines")) totalDeductionPct += getRuleDeduction("q-screen-defect", "o-s-lines");
    if (selectedMajorDefects.includes("panel_missing")) totalDeductionPct += getRuleDeduction("q-screen-defect", "o-s-backpanel");

    // Step 3 Scratches & Dents Percentage Deductions
    if (scratchLevel === "more_than_2") totalDeductionPct += getRuleDeduction("q-scratches", "o-sc-deep");
    if (scratchLevel === "1_2_scratches") totalDeductionPct += getRuleDeduction("q-scratches", "o-sc-minor");

    if (dentLevel === "major_dents") totalDeductionPct += getRuleDeduction("q-dents", "o-d-major");
    if (dentLevel === "1_2_dents") totalDeductionPct += getRuleDeduction("q-dents", "o-d-minor");

    // Step 4 Functional Issues
    if (selectedFunctionalIssues.includes("front_camera") || selectedFunctionalIssues.includes("back_camera")) {
      totalDeductionPct += getRuleDeduction("q-func-camera", "o-fc-faulty");
    }
    if (selectedFunctionalIssues.includes("battery")) {
      totalDeductionPct += getRuleDeduction("q-func-battery", "o-fb-weak");
    }
    if (selectedFunctionalIssues.includes("fingerprint") || selectedFunctionalIssues.includes("face_id")) {
      totalDeductionPct += getRuleDeduction("q-func-biometric", "o-fbio-faulty");
    }
    if (selectedFunctionalIssues.includes("speaker") || selectedFunctionalIssues.includes("mic")) {
      totalDeductionPct += getRuleDeduction("q-func-speaker", "o-fs-faulty");
    }
    if (selectedFunctionalIssues.includes("wifi") || selectedFunctionalIssues.includes("bluetooth")) {
      totalDeductionPct += getRuleDeduction("q-func-connectivity", "o-fconn-faulty");
    }

    // Step 5 Accessories Deductions
    if (!selectedAccessories.includes("charger")) totalDeductionPct += getRuleDeduction("q-acc-charger", "o-ac-no");
    if (!selectedAccessories.includes("box")) totalDeductionPct += getRuleDeduction("q-acc-box", "o-ab-no");

    const totalDeductionAmount = Math.round((baseP * totalDeductionPct) / 100);
    const finalPrice = Math.max(Math.round(baseP * 0.15), baseP - totalDeductionAmount);

    return finalPrice;
  };

  const currentPrice = calculateEstimatedPrice();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // GENERATE FINAL QUOTE & REDIRECT
  const handleGenerateQuote = () => {
    if (typeof window !== "undefined" && !localStorage.getItem("cashall_user")) {
      setUnlockModalOpen(true);
      return;
    }

    const quoteId = `quote-${Date.now()}`;
    const quoteNumber = `CAQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const selectedAnswersSummary = {
      callsWorking: callsWorking ? "Yes" : "No",
      touchWorking: touchWorking ? "Yes" : "No",
      screenOriginal: screenOriginal ? "Yes" : "No",
      majorDefects: selectedMajorDefects,
      scratchLevel,
      dentLevel,
      functionalIssues: selectedFunctionalIssues,
      accessories: selectedAccessories,
    };

    const newQuote: QuoteData = {
      id: quoteId,
      quoteNumber,
      variantId: variant.id,
      selectedAnswersJson: JSON.stringify(selectedAnswersSummary),
      basePrice: variant.basePrice,
      totalDeductions: variant.basePrice - currentPrice,
      estimatedPrice: currentPrice,
      breakdownJson: JSON.stringify([
        { label: "Base Device Market Valuation", amount: variant.basePrice },
        { label: "Condition & Defect Adjustments", amount: currentPrice - variant.basePrice },
      ]),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_quote_${quoteId}`, JSON.stringify(newQuote));
      localStorage.setItem("cashall_latest_quote", JSON.stringify(newQuote));
    }

    router.push(`/quote/${quoteId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/mobile" className="hover:text-brand-black">Sell Mobile</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/mobile/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{model.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* WIZARD QUESTION STEPS (LEFT 8 COLUMNS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP PROGRESS BAR */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-brand-border shadow-subtleCard flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Step {step} of 5
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold text-brand-black">
                    {step === 1 && "Basic Device Questions"}
                    {step === 2 && "Screen & Body Defects"}
                    {step === 3 && "Scratches & Dents Severity"}
                    {step === 4 && "Functional or Physical Problems"}
                    {step === 5 && "Accessories & Original Box"}
                  </h2>
                </div>
                <div className="w-32 sm:w-48 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-yellow h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(step / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: BASIC QUESTIONS (YES / NO) */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-8">
                  
                  {/* QUESTION 0A: MANUFACTURER WARRANTY */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-brand-black">
                      Is your device under manufacturer warranty?
                    </h3>
                    <p className="text-xs text-brand-muted">
                      You can get a better price for your device if it&apos;s under manufacturer warranty with a GST valid bill.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
                      <button
                        onClick={() => setUnderWarranty(true)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          underWarranty === true
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setUnderWarranty(false)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          underWarranty === false
                            ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* QUESTION 0B: GST VALID BILL WITH SAME IMEI */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-brand-black">
                      Do you have GST valid bill with the same IMEI?
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Make sure your bill has device IMEI mentioned on it.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
                      <button
                        onClick={() => setValidBill(true)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          validBill === true
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setValidBill(false)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          validBill === false
                            ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* QUESTION 1: POWER / SWITCH ON */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-brand-black">
                      Does your phone switch on?
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Turn on the device screen and check basic power status.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
                      <button
                        onClick={() => setPowerWorking(true)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          powerWorking === true
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setPowerWorking(false)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          powerWorking === false
                            ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* QUESTION 2: CALLS */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-brand-black">
                      Are you able to make and receive calls?
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Check your device for cellular network connectivity issues.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
                      <button
                        onClick={() => setCallsWorking(true)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          callsWorking === true
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setCallsWorking(false)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          callsWorking === false
                            ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* QUESTION 2: TOUCH SCREEN */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-brand-black">
                      Is your device&apos;s touch screen working properly?
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Check the touch screen functionality of your phone.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
                      <button
                        onClick={() => setTouchWorking(true)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          touchWorking === true
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setTouchWorking(false)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          touchWorking === false
                            ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* QUESTION 3: ORIGINAL SCREEN */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-brand-black">
                      Is your phone&apos;s screen original?
                    </h3>
                    <p className="text-xs text-brand-muted leading-relaxed">
                      Pick &quot;Yes&quot; if screen was never changed or was changed by Authorized Service Center. Pick &quot;No&quot; if screen was changed at local shop.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
                      <button
                        onClick={() => setScreenOriginal(true)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          screenOriginal === true
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setScreenOriginal(false)}
                        className={`py-3.5 px-6 rounded-2xl border-2 font-black text-sm transition-all ${
                          screenOriginal === false
                            ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* CONTINUE ACTION */}
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={underWarranty === null || validBill === null || callsWorking === null || touchWorking === null || screenOriginal === null}
                      variant="primary"
                      size="lg"
                      className="font-extrabold px-8 gap-2 shadow-yellowGlow"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>

                </div>
              )}

              {/* STEP 2: MAJOR DEFECT CATEGORIES WITH CASHIFY SVG OPTION ICONS */}
              {step === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-brand-black">
                      Select screen/body defects that are applicable!
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Please provide correct details for accurate valuation
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        id: "screen_broken",
                        title: "Broken/scratch on device screen",
                        subtitle: "Cracks or deep scratches on front display glass",
                        icon: <BrokenScreenIcon className="w-14 h-14" />,
                      },
                      {
                        id: "screen_lines",
                        title: "Dead Spot/Visible line and Discoloration on screen",
                        subtitle: "Colored vertical lines, black patches or screen bleed",
                        icon: <DeadSpotLinesIcon className="w-14 h-14" />,
                      },
                      {
                        id: "body_defects",
                        title: "Scratch/Dent on device body",
                        subtitle: "Scratches, scuffs or dents on side metal frame & back panel",
                        icon: <BodyDefectsIcon className="w-14 h-14" />,
                      },
                      {
                        id: "panel_missing",
                        title: "Device panel missing/broken",
                        subtitle: "Back panel detached, cracked or camera lens missing",
                        icon: <PanelMissingIcon className="w-14 h-14" />,
                      },
                    ].map((item) => {
                      const isSelected = selectedMajorDefects.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedMajorDefects(toggleArrayItem(selectedMajorDefects, item.id))}
                          className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-between min-h-[220px] ${
                            isSelected
                              ? "border-brand-yellow bg-brand-yellow/10 shadow-subtleCard"
                              : "border-brand-border bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="w-full flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center p-2 mb-3 border border-gray-100">
                              {item.icon}
                            </div>
                            <h3 className="text-xs sm:text-sm font-extrabold text-brand-black mb-1 leading-snug">
                              {item.title}
                            </h3>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-3 ${
                              isSelected ? "border-brand-black bg-brand-yellow" : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-black stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* NAVIGATION */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-black hover:bg-gray-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <Button
                      onClick={() => {
                        if (selectedMajorDefects.includes("body_defects")) {
                          setStep(3); // Go to scratch & dent granular breakdown
                        } else {
                          setStep(4); // Skip to functional checklist directly
                        }
                      }}
                      variant="primary"
                      size="lg"
                      className="font-extrabold px-8 gap-2 shadow-yellowGlow"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: GRANULAR SCRATCHES & DENTS SUB-STEP */}
              {step === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-8">
                  
                  {/* SCRATCHES SUB-SECTION */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-black text-brand-black">1. Scratches on device Body</h2>
                      <p className="text-xs text-brand-muted mt-0.5">Check for scratches on device body</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: "more_than_2", title: "More than 2 scratches", sub: "Multiple visible scratches" },
                        { id: "1_2_scratches", title: "1-2 scratches", sub: "Light minor scratches" },
                        { id: "no_scratches", title: "No scratches", sub: "Flawless smooth back body" },
                      ].map((opt) => {
                        const isSelected = scratchLevel === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setScratchLevel(opt.id)}
                            className={`p-5 rounded-2xl border-2 text-center transition-all ${
                              isSelected
                                ? "border-brand-yellow bg-brand-yellow/10 shadow-subtleCard"
                                : "border-brand-border bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              {opt.id === "no_scratches" ? <Sparkles className="w-5 h-5 text-brand-yellow" /> : <Smartphone className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div className="text-xs font-black text-brand-black">{opt.title}</div>
                            <div className="text-[11px] text-brand-muted mt-1">{opt.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* DENTS SUB-SECTION */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-black text-brand-black">2. Dents on device Body</h2>
                      <p className="text-xs text-brand-muted mt-0.5">Check for dents on device body</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: "major_dents", title: "Major dent(s) or more than 2", sub: "Noticeable deep frame dents" },
                        { id: "1_2_dents", title: "1-2 minor dents", sub: "Small corner scuffs" },
                        { id: "no_dents", title: "No dents", sub: "Flawless side housing" },
                      ].map((opt) => {
                        const isSelected = dentLevel === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setDentLevel(opt.id)}
                            className={`p-5 rounded-2xl border-2 text-center transition-all ${
                              isSelected
                                ? "border-brand-yellow bg-brand-yellow/10 shadow-subtleCard"
                                : "border-brand-border bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              {opt.id === "no_dents" ? <Sparkles className="w-5 h-5 text-brand-yellow" /> : <ShieldAlert className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div className="text-xs font-black text-brand-black">{opt.title}</div>
                            <div className="text-[11px] text-brand-muted mt-1">{opt.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* NAVIGATION */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-black hover:bg-gray-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <Button
                      onClick={() => setStep(4)}
                      variant="primary"
                      size="lg"
                      className="font-extrabold px-8 gap-2 shadow-yellowGlow"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: FUNCTIONAL PROBLEMS CHECKLIST */}
              {step === 4 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-brand-black">
                      Functional or Physical Problems
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Please choose appropriate condition to get accurate quote
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "wifi", title: "WiFi not working", icon: Wifi },
                      { id: "speaker", title: "Speaker Faulty", icon: VolumeX },
                      { id: "silent_btn", title: "Silent Button not working", icon: Sliders },
                      { id: "face_sensor", title: "Face Sensor not working", icon: Smartphone },
                      { id: "power_btn", title: "Power Button not working", icon: Radio },
                      { id: "charging_port", title: "Charging Port not working", icon: BatteryCharging },
                      { id: "receiver", title: "Audio Receiver not working", icon: Volume2 },
                      { id: "camera_glass", title: "Camera Glass Broken", icon: Camera },
                      { id: "microphone", title: "Microphone not working", icon: Mic },
                      { id: "bluetooth", title: "Bluetooth not working", icon: Bluetooth },
                      { id: "vibrator", title: "Vibrator is not working", icon: Vibrate },
                      ...(brandSlug === "apple"
                        ? [{ id: "battery_health", title: "Battery Health Below 80%", icon: BatteryCharging }]
                        : []),
                      { id: "front_camera", title: "Front Camera not working", icon: Camera },
                      { id: "back_camera", title: "Back Camera not working", icon: Camera },
                    ].map((item) => {
                      const isSelected = selectedFunctionalIssues.includes(item.id);
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedFunctionalIssues(toggleArrayItem(selectedFunctionalIssues, item.id))}
                          className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between ${
                            isSelected
                              ? "border-red-500 bg-red-50/70 shadow-sm"
                              : "border-brand-border bg-white hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                              isSelected ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className={`text-xs font-extrabold ${isSelected ? "text-red-900" : "text-brand-black"}`}>
                            {item.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* NAVIGATION */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (selectedMajorDefects.includes("body_defects")) {
                          setStep(3);
                        } else {
                          setStep(2);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-black hover:bg-gray-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <Button
                      onClick={() => setStep(5)}
                      variant="primary"
                      size="lg"
                      className="font-extrabold px-8 gap-2 shadow-yellowGlow"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: ACCESSORIES */}
              {step === 5 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-brand-black">
                      Do you have the following?
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Please select accessories which are available with your device
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: "charger",
                        title: "Original Charger of Device",
                        subtitle: "Original power adapter cable included in working condition",
                        icon: Zap,
                      },
                      {
                        id: "box",
                        title: "Original Box with same IMEI",
                        subtitle: "Original retail packaging box with matching IMEI barcode sticker",
                        icon: Box,
                      },
                    ].map((item) => {
                      const isSelected = selectedAccessories.includes(item.id);
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedAccessories(toggleArrayItem(selectedAccessories, item.id))}
                          className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/80 shadow-subtleCard"
                              : "border-brand-border bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  isSelected ? "bg-emerald-600 text-white" : "bg-gray-100 text-brand-black"
                                }`}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? "border-emerald-700 bg-emerald-500 text-white" : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                            <h3 className="text-sm font-extrabold text-brand-black mb-1">{item.title}</h3>
                            <p className="text-xs text-brand-muted leading-relaxed">{item.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* FINAL QUOTE GENERATION ACTION */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setStep(4)}
                      className="px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-black hover:bg-gray-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <Button
                      onClick={handleGenerateQuote}
                      variant="primary"
                      size="lg"
                      className="font-extrabold px-8 gap-2 shadow-yellowGlow text-base"
                    >
                      <span>Get Instant Valuation</span>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR: "DEVICE EVALUATION" LIVE STICKY CARD */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium space-y-6">
                
                {/* DEVICE SPECS HEADER */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100 shrink-0">
                    {model.imageUrl ? (
                      <Image src={model.imageUrl} alt={model.name} width={50} height={50} className="object-contain max-h-12" />
                    ) : (
                      <Smartphone className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-brand-black leading-tight">
                      {brand.name} {model.name}
                    </h3>
                    <div className="text-xs text-brand-muted mt-1 font-medium">
                      ({variant.storage})
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-brand-black uppercase tracking-wider text-gray-500 text-[11px]">
                    Device Evaluation Summary
                  </h4>

                  {/* DEVICE DETAILS */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-brand-black">Device Details</div>
                    <ul className="space-y-1 text-gray-600 pl-2">
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${powerWorking === false ? "bg-red-500" : "bg-emerald-500"}`} />
                        <span>Power: {powerWorking === null ? "Pending" : powerWorking ? "Turns ON" : "Power / Boot Issue (-50%)"}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${callsWorking ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>Calls: {callsWorking === null ? "Pending" : callsWorking ? "Working" : "Not Able to Make Calls"}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${touchWorking ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>Touch Screen: {touchWorking === null ? "Pending" : touchWorking ? "Touch Working" : "Touch Faulty"}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${screenOriginal ? "bg-emerald-500" : "bg-orange-500"}`} />
                        <span>Screen: {screenOriginal === null ? "Pending" : screenOriginal ? "Original Screen" : "Local Screen"}</span>
                      </li>
                    </ul>
                  </div>

                  {/* OVERALL CONDITION */}
                  <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                    <div className="font-bold text-brand-black">Phone&apos;s Overall Condition</div>
                    <ul className="space-y-1 text-gray-600 pl-2">
                      {selectedMajorDefects.includes("body_defects") && (
                        <>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                            <span>Scratches: {scratchLevel.replace(/_/g, " ")}</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                            <span>Dents: {dentLevel.replace(/_/g, " ")}</span>
                          </li>
                        </>
                      )}
                      {!selectedMajorDefects.includes("body_defects") && (
                        <li className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>No major body defects</span>
                        </li>
                      )}
                      {selectedFunctionalIssues.length > 0 && (
                        <li className="flex items-center gap-1.5 text-red-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>{selectedFunctionalIssues.length} functional issue(s)</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* ACCESSORIES SUMMARY */}
                  <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                    <div className="font-bold text-brand-black">Accessories Included</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAccessories.includes("charger") && (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold text-[11px]">
                          + Original Charger
                        </span>
                      )}
                      {selectedAccessories.includes("box") && (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold text-[11px]">
                          + Original Box (Same IMEI)
                        </span>
                      )}
                      {selectedAccessories.length === 0 && (
                        <span className="text-gray-400 text-[11px]">Device Only (No Charger/Box)</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* ESTIMATED PRICE CARD - SHOWN ONLY AFTER LOGIN */}
                {isLoggedIn ? (
                  <div className="bg-brand-black text-white rounded-2xl p-5 border border-brand-yellow/30 text-center space-y-2">
                    <span className="text-[11px] font-bold text-brand-yellow uppercase tracking-wider block">
                      Estimated Cash Valuation
                    </span>
                    <div className="text-3xl font-black text-brand-yellow font-price">
                      ₹{currentPrice.toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-gray-300">
                      Fast Doorstep Pickup & Direct Payment upon Physical Verification
                    </p>
                  </div>
                ) : (
                  <div className="bg-brand-black text-white rounded-2xl p-5 border border-neutral-800 text-center space-y-2">
                    <span className="text-[11px] font-bold text-brand-yellow uppercase tracking-wider block">
                      Best Value Guarantee
                    </span>
                    <div className="text-lg font-black text-gray-200">
                      🔒 Login to Unlock Price
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Complete assessment and login to reveal your instant cash valuation.
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </main>

      <PriceUnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onSuccess={() => {
          setUnlockModalOpen(false);
          handleGenerateQuote();
        }}
        deviceName={`${brand.name} ${model.name}`}
        deviceImageUrl={model.imageUrl}
        storage={variant.storage}
      />

      <Footer />
    </div>
  );
}
