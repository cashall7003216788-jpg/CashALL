"use client";

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
import { saveQuoteToCart } from "@/lib/cart";
import { formatDeviceName } from "@/lib/device";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tablet,
  Smartphone,
  Check,
  X,
  Volume2,
  Wifi,
  Sparkles,
  Layers,
  Sliders,
  Package,
  FileCheck,
  Camera,
  Battery,
  Lock,
} from "lucide-react";

export default function TabletConditionAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "ipad-air-1st-gen-wi-fi-only";
  const variantIdParam = searchParams.get("variantId") || "";

  const brand = INITIAL_BRANDS.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase()) || {
    id: `b-${brandSlug}`,
    name: brandSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    slug: brandSlug,
    category: "TABLET",
    active: true,
  };

  const model = INITIAL_MODELS.find(
    (m) =>
      (m.slug.toLowerCase() === modelSlug.toLowerCase() || m.id === modelSlug) &&
      m.category === "TABLET"
  ) || INITIAL_MODELS.find((m) => m.slug.toLowerCase() === modelSlug.toLowerCase()) || {
    id: `m-tablet-${modelSlug}`,
    brandId: brand.id,
    brandSlug: brand.slug,
    name: modelSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    slug: modelSlug,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop",
    releaseYear: 2024,
    popular: true,
    active: true,
    contactForPrice: false,
    category: "TABLET",
  };

  let resolvedVariant = INITIAL_VARIANTS.find((v) => v.id === variantIdParam);

  const [activeVariant, setActiveVariant] = useState<any>(resolvedVariant || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("cashall_user"));

      let foundVar = resolvedVariant;
      if (!foundVar) {
        const matchByModel = INITIAL_VARIANTS.filter((v) => v.modelId === model.id);
        if (matchByModel.length > 0) {
          foundVar = matchByModel[0];
        } else {
          foundVar = {
            id: `v-tablet-${model.slug}-128`,
            modelId: model.id,
            storage: "128 GB",
            basePrice: 24000,
            active: true,
          };
        }
      }

      setActiveVariant(foundVar);
    }
  }, [variantIdParam, model.id, model.slug]);

  const variant = activeVariant || {
    id: `v-tablet-${model.slug}-128`,
    modelId: model.id,
    storage: "128 GB",
    basePrice: 24000,
    active: true,
  };

  // WIZARD STATE (Steps 1 to 5)
  const [step, setStep] = useState<number>(1);

  // STEP 1: BASIC HEALTH (YES/NO)
  const [underWarranty, setUnderWarranty] = useState<boolean | null>(null);
  const [validBill, setValidBill] = useState<boolean | null>(null);
  const [powerWorking, setPowerWorking] = useState<boolean | null>(null);
  const [callsWorking, setCallsWorking] = useState<boolean | null>(null);
  const [touchWorking, setTouchWorking] = useState<boolean | null>(null);
  const [screenOriginal, setScreenOriginal] = useState<boolean | null>(null);

  // STEP 2: MAJOR DEFECTS (MULTI-SELECT)
  const [selectedMajorDefects, setSelectedMajorDefects] = useState<string[]>([]);

  // STEP 3: SCRATCHES & DENTS
  const [scratchLevel, setScratchLevel] = useState<string>("no_scratches");
  const [dentLevel, setDentLevel] = useState<string>("no_dents");

  // STEP 4: FUNCTIONAL & HARDWARE PROBLEMS (MULTI-SELECT)
  const [selectedFunctionalIssues, setSelectedFunctionalIssues] = useState<string[]>([]);

  // STEP 5: ACCESSORIES (MULTI-SELECT)
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(["charger", "box"]);

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const getRuleDeduction = (questionId: string, optionId: string): number => {
    const rule = INITIAL_PRICING_RULES.find(
      (r) => r.questionId === questionId && r.optionId === optionId
    );
    if (!rule) return 0;
    return rule.adjustmentType === "PERCENTAGE_DEDUCTION" ? rule.adjustmentValue : 0;
  };

  const calculateEstimatedPrice = () => {
    const baseP = variant.basePrice;
    let totalDeductionPct = 0;

    // Step 1
    if (underWarranty === false) totalDeductionPct += getRuleDeduction("q-warranty", "o-w-no");
    if (validBill === false) totalDeductionPct += getRuleDeduction("q-gst-bill", "o-gb-no");
    if (powerWorking === false) totalDeductionPct += getRuleDeduction("q-power", "o-p-no");
    if (callsWorking === false) totalDeductionPct += getRuleDeduction("q-calls", "o-c-no");
    if (touchWorking === false) totalDeductionPct += getRuleDeduction("q-touch", "o-t-no");
    if (screenOriginal === false) totalDeductionPct += getRuleDeduction("q-screen-orig", "o-so-no");

    // Step 2
    if (selectedMajorDefects.includes("screen_broken")) totalDeductionPct += getRuleDeduction("q-screen-defect", "o-s-cracked");
    if (selectedMajorDefects.includes("screen_lines")) totalDeductionPct += getRuleDeduction("q-screen-defect", "o-s-lines");
    if (selectedMajorDefects.includes("panel_missing")) totalDeductionPct += getRuleDeduction("q-screen-defect", "o-s-backpanel");

    // Step 3
    if (scratchLevel === "more_than_2") totalDeductionPct += getRuleDeduction("q-scratches", "o-sc-deep");
    if (scratchLevel === "1_2_scratches") totalDeductionPct += getRuleDeduction("q-scratches", "o-sc-minor");

    if (dentLevel === "major_dents") totalDeductionPct += getRuleDeduction("q-dents", "o-d-major");
    if (dentLevel === "1_2_dents") totalDeductionPct += getRuleDeduction("q-dents", "o-d-minor");

    // Step 4
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

    // Step 5
    if (!selectedAccessories.includes("charger")) totalDeductionPct += getRuleDeduction("q-acc-charger", "o-ac-no");
    if (!selectedAccessories.includes("box")) totalDeductionPct += getRuleDeduction("q-acc-box", "o-ab-no");

    const totalDeductionAmount = Math.round((baseP * totalDeductionPct) / 100);
    const finalPrice = Math.max(Math.round(baseP * 0.15), baseP - totalDeductionAmount);

    return finalPrice;
  };

  const currentPrice = calculateEstimatedPrice();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const handleGenerateQuote = () => {
    if (typeof window !== "undefined" && !localStorage.getItem("cashall_user")) {
      setUnlockModalOpen(true);
      return;
    }

    const quoteId = `quote-${Date.now()}`;
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const quoteNumber = `CAQ${random5Digits}`;

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

    const deviceFullName = formatDeviceName(brand.name, model.name, variant.storage);

    const newQuote: QuoteData = {
      id: quoteId,
      quoteNumber,
      variantId: variant.id,
      selectedAnswersJson: JSON.stringify(selectedAnswersSummary),
      basePrice: variant.basePrice,
      totalDeductions: variant.basePrice - currentPrice,
      estimatedPrice: currentPrice,
      breakdownJson: JSON.stringify({
        basePrice: variant.basePrice,
        deductions: variant.basePrice - currentPrice,
        finalEstimate: currentPrice,
        brandName: brand.name,
        modelName: model.name,
        storage: variant.storage,
        imageUrl: model.imageUrl,
        category: "TABLET",
      }),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    let userCustomerName = "";
    let userCustomerPhone = "";
    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_quote", JSON.stringify(newQuote));
      try {
        const u = JSON.parse(localStorage.getItem("cashall_user") || "{}");
        if (u?.name) userCustomerName = u.name;
        if (u?.phone) userCustomerPhone = u.phone;
      } catch (e) {}

      saveQuoteToCart({
        quoteId,
        quoteNumber,
        variantId: variant.id,
        brandName: brand.name,
        modelName: model.name,
        storage: variant.storage,
        imageUrl: model.imageUrl,
        category: "TABLET",
        estimatedPrice: currentPrice,
        basePrice: variant.basePrice,
        customerName: userCustomerName,
        customerPhone: userCustomerPhone,
        selectedAnswersJson: newQuote.selectedAnswersJson,
        breakdownJson: newQuote.breakdownJson,
        createdAt: newQuote.createdAt,
      });
    }

    fetch("/api/v1/quotes/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteNumber,
        variantId: variant.id,
        selectedAnswersJson: JSON.stringify(selectedAnswersSummary),
        basePrice: variant.basePrice,
        totalDeductions: variant.basePrice - currentPrice,
        estimatedPrice: currentPrice,
        breakdownJson: newQuote.breakdownJson,
        deviceName: deviceFullName,
        deviceImageUrl: model.imageUrl,
        category: "TABLET",
        customerName: userCustomerName,
        customerPhone: userCustomerPhone,
        createdAt: newQuote.createdAt,
      }),
    }).catch((err) => console.error("Error saving tablet quote:", err));

    router.push(`/quote/${quoteNumber}`);
  };

  const isStep1Complete =
    underWarranty !== null &&
    validBill !== null &&
    powerWorking !== null &&
    callsWorking !== null &&
    touchWorking !== null &&
    screenOriginal !== null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/tablet" className="hover:text-brand-black">Sell Tablet</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/tablet/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/tablet/${brand.slug}/${model.slug}`} className="hover:text-brand-black">{model.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">Assessment</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT MAIN WIZARD COLUMN */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEPS PROGRESS BAR */}
              <div className="bg-white rounded-2xl p-4 border border-brand-border shadow-subtleCard flex items-center justify-between">
                {[
                  { num: 1, label: "Health & Warranty" },
                  { num: 2, label: "Display & Screen" },
                  { num: 3, label: "Body & Frame" },
                  { num: 4, label: "Hardware" },
                  { num: 5, label: "Accessories" },
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        step === s.num
                          ? "bg-brand-yellow text-brand-black shadow-sm"
                          : step > s.num
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                    </div>
                    <span className="hidden md:inline text-xs font-bold text-gray-600">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1: BASIC QUESTIONS */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-brand-black">
                      Basic Health &amp; Operational Status
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Answer the following questions about your {brand.name} {model.name}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Q1: WARRANTY */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">
                        1. Is your tablet under manufacturer warranty?
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setUnderWarranty(true)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            underWarranty === true
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Under Warranty (&lt; 11 Months)
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnderWarranty(false)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            underWarranty === false
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Out of Warranty (&gt; 11 Months)
                        </button>
                      </div>
                    </div>

                    {/* Q2: GST BILL */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">
                        2. Do you have a valid GST invoice matching this device?
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setValidBill(true)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            validBill === true
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Yes, Valid Bill Available
                        </button>
                        <button
                          type="button"
                          onClick={() => setValidBill(false)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            validBill === false
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          No Invoice / Lost Bill
                        </button>
                      </div>
                    </div>

                    {/* Q3: POWER */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">
                        3. Does the tablet turn ON normally?
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPowerWorking(true)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            powerWorking === true
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Yes, Powers Up Normally
                        </button>
                        <button
                          type="button"
                          onClick={() => setPowerWorking(false)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            powerWorking === false
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          No / Boot Issue
                        </button>
                      </div>
                    </div>

                    {/* Q4: CALLS / CONNECTIVITY */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">
                        4. Do speakers, microphone and Wi-Fi / cellular work?
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCallsWorking(true)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            callsWorking === true
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Yes, Working Perfectly
                        </button>
                        <button
                          type="button"
                          onClick={() => setCallsWorking(false)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            callsWorking === false
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Speaker / Mic / Wi-Fi Issue
                        </button>
                      </div>
                    </div>

                    {/* Q5: TOUCH */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">
                        5. Is the touch screen completely responsive across all areas?
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTouchWorking(true)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            touchWorking === true
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Yes, Smooth Touch Everywhere
                        </button>
                        <button
                          type="button"
                          onClick={() => setTouchWorking(false)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            touchWorking === false
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Unresponsive / Ghost Touch
                        </button>
                      </div>
                    </div>

                    {/* Q6: SCREEN ORIGINAL */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">
                        6. Is the display original factory fitted?
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setScreenOriginal(true)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            screenOriginal === true
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Original Factory Fitted Screen
                        </button>
                        <button
                          type="button"
                          onClick={() => setScreenOriginal(false)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                            screenOriginal === false
                              ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Replaced / Non-Original Screen
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!isStep1Complete}
                      variant="primary"
                      size="lg"
                      className="font-black text-sm px-8 shadow-yellowGlow"
                    >
                      Next: Screen &amp; Display &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: SCREEN & DISPLAY DEFECTS */}
              {step === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-brand-black">
                      Screen &amp; Display Condition
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Select all defects that apply to your tablet&apos;s screen. (Leave unselected if flawless).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "screen_broken", title: "Glass Cracked / Broken", desc: "Cracks on outer front glass panel" },
                      { id: "screen_lines", title: "Display Lines / Ink Spots", desc: "Color lines, dark patches or bleed" },
                      { id: "panel_missing", title: "Back Panel Damaged", desc: "Cracks on back casing or missing glass" },
                      { id: "body_defects", title: "Noticeable Body Scratches / Dents", desc: "Physical wear on edges & casing" },
                    ].map((item) => {
                      const isSelected = selectedMajorDefects.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedMajorDefects(toggleArrayItem(selectedMajorDefects, item.id))}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-brand-yellow bg-brand-yellow/10 shadow-sm"
                              : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-extrabold text-brand-black">{item.title}</span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? "bg-brand-black border-brand-black text-brand-yellow" : "border-gray-300 bg-white"}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-xs text-brand-muted">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button onClick={() => setStep(1)} variant="secondary" size="md">
                      &larr; Back
                    </Button>
                    <Button onClick={() => setStep(3)} variant="primary" size="lg" className="font-black text-sm px-8 shadow-yellowGlow">
                      Next: Body Condition &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: BODY WEAR */}
              {step === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-brand-black">
                      Body Wear, Scratches &amp; Dents
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Inspect your tablet&apos;s physical frame under direct light.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* SCRATCHES */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">Screen Surface Scratches</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: "no_scratches", label: "Flawless (No Scratches)" },
                          { id: "1_2_scratches", label: "1-2 Light Scratches" },
                          { id: "more_than_2", label: "Multiple Deep Scratches" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setScratchLevel(item.id)}
                            className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                              scratchLevel === item.id
                                ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                                : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DENTS */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="text-sm font-extrabold text-brand-black">Side Frame &amp; Corner Dents</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: "no_dents", label: "Flawless (No Dents)" },
                          { id: "1_2_dents", label: "1-2 Minor Dents" },
                          { id: "major_dents", label: "Major Dents / Bent Frame" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDentLevel(item.id)}
                            className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                              dentLevel === item.id
                                ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-sm"
                                : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button onClick={() => setStep(2)} variant="secondary" size="md">
                      &larr; Back
                    </Button>
                    <Button onClick={() => setStep(4)} variant="primary" size="lg" className="font-black text-sm px-8 shadow-yellowGlow">
                      Next: Hardware Status &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: FUNCTIONAL PROBLEMS */}
              {step === 4 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-brand-black">
                      Hardware &amp; Functional Problems
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Select any broken components. (Leave all unchecked if everything is working fine).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "front_camera", label: "Front Selfie Camera Faulty" },
                      { id: "back_camera", label: "Rear Main Camera Faulty" },
                      { id: "battery", label: "Battery Drains Fast / Health &lt; 80%" },
                      { id: "fingerprint", label: "Touch ID / Face ID Issue" },
                      { id: "speaker", label: "Speaker / Audio Muffled" },
                      { id: "wifi", label: "Wi-Fi / Bluetooth Issue" },
                    ].map((item) => {
                      const isSelected = selectedFunctionalIssues.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedFunctionalIssues(toggleArrayItem(selectedFunctionalIssues, item.id))}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-brand-yellow bg-brand-yellow/10 shadow-sm"
                              : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xs font-bold text-brand-black">{item.label}</span>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? "bg-brand-black border-brand-black text-brand-yellow" : "border-gray-300 bg-white"}`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button onClick={() => setStep(3)} variant="secondary" size="md">
                      &larr; Back
                    </Button>
                    <Button onClick={() => setStep(5)} variant="primary" size="lg" className="font-black text-sm px-8 shadow-yellowGlow">
                      Next: Accessories &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: ACCESSORIES */}
              {step === 5 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-brand-black">
                      Original Accessories Included
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1">
                      Check which original accessories you have available with your tablet.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "charger", title: "Original Fast Charger", desc: "Original brand power adapter and charging cable" },
                      { id: "box", title: "Original Device Box", desc: "Matching IMEI/Serial box packaging" },
                    ].map((item) => {
                      const isSelected = selectedAccessories.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedAccessories(toggleArrayItem(selectedAccessories, item.id))}
                          className={`p-5 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-brand-yellow bg-brand-yellow/10 shadow-sm"
                              : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-base font-extrabold text-brand-black">{item.title}</span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? "bg-brand-black border-brand-black text-brand-yellow" : "border-gray-300 bg-white"}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-xs text-brand-muted">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <Button onClick={() => setStep(4)} variant="secondary" size="md">
                      &larr; Back
                    </Button>
                    <Button
                      onClick={handleGenerateQuote}
                      variant="primary"
                      size="lg"
                      className="font-black text-sm px-10 shadow-yellowGlow flex items-center gap-2"
                    >
                      <span>Get Instant Valuation</span>
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR: DEVICE EVALUATION STICKY CARD */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium space-y-6">
                
                {/* DEVICE SPECS HEADER */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100 shrink-0">
                    <img
                      src={model.imageUrl || "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop"}
                      alt={model.name}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-icon flex flex-col items-center justify-center text-gray-400';
                          fallback.innerHTML = '<svg class="w-10 h-10 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
                          parent.appendChild(fallback);
                        }
                      }}
                      className="object-contain max-h-12"
                    />
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
                    Tablet Evaluation Summary
                  </h4>

                  {/* SUMMARY POINTS */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-brand-black">Device Health</div>
                    <ul className="space-y-1 text-gray-600 pl-2">
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${powerWorking === false ? "bg-red-500" : "bg-emerald-500"}`} />
                        <span>Power: {powerWorking === null ? "Pending" : powerWorking ? "Turns ON" : "Power Issue (-50%)"}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${touchWorking ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>Touch: {touchWorking === null ? "Pending" : touchWorking ? "Working" : "Faulty"}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${screenOriginal ? "bg-emerald-500" : "bg-orange-500"}`} />
                        <span>Screen: {screenOriginal === null ? "Pending" : screenOriginal ? "Original Screen" : "Replaced Screen"}</span>
                      </li>
                    </ul>
                  </div>

                  {/* ACCESSORIES */}
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
                          + Original Box
                        </span>
                      )}
                      {selectedAccessories.length === 0 && (
                        <span className="text-gray-400 text-[11px]">Tablet Only</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ESTIMATED PRICE CARD */}
                {isLoggedIn ? (
                  <div className="bg-brand-black text-white rounded-2xl p-5 border border-brand-yellow/30 text-center space-y-2 shadow-md">
                    <span className="text-[11px] font-bold text-brand-yellow uppercase tracking-wider block">
                      Instant Cash Valuation
                    </span>
                    <div className="text-3xl font-black text-brand-yellow font-price">
                      ₹{currentPrice.toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-gray-300">
                      Fast Doorstep Pickup &amp; Instant Payment Upon Verification
                    </p>
                  </div>
                ) : (
                  <div className="bg-brand-black text-white rounded-2xl p-5 border border-neutral-800 text-center space-y-2 shadow-md">
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
