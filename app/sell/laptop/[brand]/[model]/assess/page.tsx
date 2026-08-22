"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { PriceUnlockModal } from "@/components/common/PriceUnlockModal";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS, QuoteData } from "@/lib/store";
import { saveQuoteToCart } from "@/lib/cart";
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Laptop,
  Check,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

// ── SVG LINE ART ICONS FOR LAPTOP DEFECTS ─────────────────────────────────
function LaptopScreenDefectIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-brand-black shrink-0">
      <rect x="8" y="10" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M4 48H60V50C60 52 58 54 56 54H8C6 54 4 52 4 50V48Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
      <path d="M18 18L34 34M34 18L18 34" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LaptopKeyboardIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-brand-black shrink-0">
      <rect x="6" y="14" width="52" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <rect x="12" y="20" width="8" height="6" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="24" y="20" width="8" height="6" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="36" y="20" width="8" height="6" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="48" y="20" width="4" height="6" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="12" y="30" width="8" height="6" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="24" y="30" width="16" height="6" rx="1" fill="#EF4444" />
      <rect x="44" y="30" width="8" height="6" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function LaptopBatteryIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-brand-black shrink-0">
      <rect x="10" y="20" width="40" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M50 28V36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 26V38M30 26V38" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LaptopTrackpadIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-brand-black shrink-0">
      <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <line x1="32" y1="36" x2="32" y2="48" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="28" r="4" fill="#EF4444" />
    </svg>
  );
}

function LaptopSpeakerIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-brand-black shrink-0">
      <path d="M16 26H24L36 16V48L24 38H16V26Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M44 24C46.5 26.5 46.5 37.5 44 40" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LaptopPortsIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-brand-black shrink-0">
      <rect x="8" y="24" width="48" height="16" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <rect x="16" y="29" width="12" height="6" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="36" y="29" width="12" height="6" rx="1" fill="#EF4444" />
    </svg>
  );
}

function LaptopBodyDefectIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-brand-black shrink-0">
      <rect x="10" y="12" width="44" height="30" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M6 46H58V48C58 50 56 52 54 52H10C8 52 6 50 6 48V46Z" stroke="currentColor" strokeWidth="2" />
      <path d="M42 20L48 26M48 20L42 26" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LaptopAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "macbook-retina-early-2015";
  const variantId = searchParams.get("variantId") || "";

  const brand = INITIAL_BRANDS.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase()) || INITIAL_BRANDS[0];
  const model = INITIAL_MODELS.find((m) => m.slug.toLowerCase() === modelSlug.toLowerCase() || m.id === modelSlug) ||
    INITIAL_MODELS.find((m) => m.category === "LAPTOP" && m.brandSlug?.toLowerCase() === brandSlug.toLowerCase()) ||
    INITIAL_MODELS.find((m) => m.category === "LAPTOP") || INITIAL_MODELS[0];
  const variant = INITIAL_VARIANTS.find((v) => v.id === variantId) ||
    INITIAL_VARIANTS.find((v) => v.modelId === model?.id) || INITIAL_VARIANTS[0];

  const basePrice = variant?.basePrice || 24000;

  // ── STEP STATE ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cashall_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u && (u.phone || u.name)) {
            setIsLoggedIn(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [modalOpen]);

  // Step 1: Core Functional & Warranty Questions
  const [turnsOn, setTurnsOn] = useState<string>("yes"); // yes | no
  const [warranty, setWarranty] = useState<string>("above1year"); // under3m | 3to11m | above1year
  const [hasCharger, setHasCharger] = useState<string>("yes"); // yes | no
  const [hasBill, setHasBill] = useState<string>("yes"); // yes | no

  // Step 2: Display & Screen Issues (Multi-select)
  const [screenDefects, setScreenDefects] = useState<string[]>([]);

  // Step 3: Functional & Hardware Issues (Multi-select)
  const [hardwareDefects, setHardwareDefects] = useState<string[]>([]);

  // Step 4: Physical Body Condition (Single select)
  const [bodyCondition, setBodyCondition] = useState<string>("flawless"); // flawless | minor | major

  // Step 5: Included Accessories (Multi-select)
  const [accessories, setAccessories] = useState<string[]>(["charger", "box", "bill"]);

  // ── DEDUCTION CALCULATION ───────────────────────────────────────────────
  const calculateFinalPrice = () => {
    let price = basePrice;

    if (turnsOn === "no") price *= 0.35; // 65% drop if dead

    // Screen defects
    if (screenDefects.includes("cracked")) price -= 4500;
    if (screenDefects.includes("lines")) price -= 2500;
    if (screenDefects.includes("bleeding")) price -= 2000;
    if (screenDefects.includes("scratches")) price -= 1000;

    // Hardware defects
    if (hardwareDefects.includes("keyboard")) price -= 1800;
    if (hardwareDefects.includes("trackpad")) price -= 1500;
    if (hardwareDefects.includes("battery")) price -= 2500;
    if (hardwareDefects.includes("speaker")) price -= 1200;
    if (hardwareDefects.includes("ports")) price -= 1200;

    // Body condition
    if (bodyCondition === "minor") price -= 1200;
    if (bodyCondition === "major") price -= 3000;

    // Warranty additions
    if (warranty === "under3m") price += 2000;
    if (warranty === "3to11m") price += 1000;

    // Missing accessories
    if (!accessories.includes("charger")) price -= 1500;
    if (!accessories.includes("box")) price -= 500;
    if (!accessories.includes("bill")) price -= 1000;

    return Math.max(Math.round(price), 2500);
  };

  const finalPrice = calculateFinalPrice();

  const handleGenerateLaptopQuote = () => {
    const quoteId = `quote-${Date.now()}`;
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const quoteNumber = `CAQ${random5Digits}`;

    const selectedAnswersSummary = {
      turnsOn,
      warranty,
      hasCharger,
      hasBill,
      screenDefects,
      hardwareDefects,
      bodyCondition,
      accessories,
    };

    const deviceFullName = `${brand.name} ${model?.name || "Laptop"}${variant?.storage ? " (" + variant.storage + ")" : ""}`;

    const newQuote: QuoteData = {
      id: quoteId,
      quoteNumber,
      variantId: variant?.id || "",
      selectedAnswersJson: JSON.stringify(selectedAnswersSummary),
      basePrice: basePrice,
      totalDeductions: basePrice - finalPrice,
      estimatedPrice: finalPrice,
      breakdownJson: JSON.stringify({
        basePrice: basePrice,
        deductions: basePrice - finalPrice,
        finalEstimate: finalPrice,
        brandName: brand.name,
        modelName: model?.name || "Laptop",
        storage: variant?.storage,
        imageUrl: model?.imageUrl,
        category: "LAPTOP",
      }),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    let userCustomerName = "";
    let userCustomerPhone = "";
    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_quote", JSON.stringify(newQuote));
      localStorage.setItem("cashall_latest_quote", JSON.stringify(newQuote));
      try {
        const u = JSON.parse(localStorage.getItem("cashall_user") || "{}");
        if (u?.name) userCustomerName = u.name;
        if (u?.phone) userCustomerPhone = u.phone;
      } catch (e) {}

      saveQuoteToCart({
        quoteId,
        quoteNumber,
        variantId: variant?.id,
        brandName: brand.name,
        modelName: model?.name || "Laptop",
        storage: variant?.storage,
        imageUrl: model?.imageUrl || undefined,
        category: "LAPTOP",
        estimatedPrice: finalPrice,
        basePrice: basePrice,
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
        variantId: variant?.id,
        selectedAnswersJson: JSON.stringify(selectedAnswersSummary),
        basePrice: basePrice,
        totalDeductions: basePrice - finalPrice,
        estimatedPrice: finalPrice,
        breakdownJson: newQuote.breakdownJson,
        deviceName: deviceFullName,
        deviceImageUrl: model?.imageUrl,
        category: "LAPTOP",
        customerName: userCustomerName,
        customerPhone: userCustomerPhone,
      }),
    }).catch((err) => console.error("Error saving laptop quote:", err));

    router.push(`/checkout/pickup?quoteId=${quoteNumber}`);
  };

  const toggleMultiSelect = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (item === "none") {
      setList([]);
      return;
    }
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list.filter((i) => i !== "none"), item]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />

      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/laptop" className="hover:text-brand-black">Sell Laptop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/laptop/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{model?.name}</span>
          </div>

          {/* DEVICE BAR */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-brand-border shadow-subtleCard flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100 shrink-0">
                {model?.imageUrl ? (
                  <Image src={model.imageUrl} alt={model.name} width={60} height={60} className="object-contain" />
                ) : (
                  <Laptop className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-brand-black">{brand.name} {model?.name}</h1>
                <p className="text-xs text-brand-muted font-medium mt-0.5">{variant?.storage || "Standard Specs"}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Valuation Progress</span>
              <span className="text-xs font-extrabold text-brand-yellow font-mono">Step {currentStep} of 5</span>
            </div>
          </div>

          {/* STEP 1: CORE FUNCTIONAL & WARRANTY */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-black">Step 1: General Laptop Condition</h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">Tell us about basic functionality, warranty, charger &amp; bill availability.</p>
              </div>

              {/* Question 1: Turns ON */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-extrabold text-brand-black flex items-center gap-2">
                  <span>1. Does the Laptop turn ON and boot properly?</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setTurnsOn("yes")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      turnsOn === "yes" ? "border-brand-yellow bg-yellow-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-extrabold text-brand-black">Yes (Powers ON)</span>
                    {turnsOn === "yes" && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurnsOn("no")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      turnsOn === "no" ? "border-brand-yellow bg-yellow-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-extrabold text-brand-black">No (Dead / No Power)</span>
                    {turnsOn === "no" && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                  </button>
                </div>
              </div>

              {/* Question 2: Warranty Status */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-extrabold text-brand-black flex items-center gap-2">
                  <span>2. What is the Manufacturer Warranty status?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "under3m", label: "Under 3 Months" },
                    { id: "3to11m", label: "3 to 11 Months" },
                    { id: "above1year", label: "Out of Warranty (> 1 Year)" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWarranty(w.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        warranty === w.id ? "border-brand-yellow bg-yellow-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xs font-bold text-brand-black">{w.label}</span>
                      {warranty === w.id && <CheckCircle2 className="w-4 h-4 text-brand-black fill-brand-yellow shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Original Charger */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-extrabold text-brand-black">3. Do you have the Original Working Laptop Charger?</label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setHasCharger("yes")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      hasCharger === "yes" ? "border-brand-yellow bg-yellow-50/50" : "border-gray-200"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold">Yes, Original Charger Available</span>
                    {hasCharger === "yes" && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasCharger("no")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      hasCharger === "no" ? "border-brand-yellow bg-yellow-50/50" : "border-gray-200"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold">No Charger / Damaged</span>
                    {hasCharger === "no" && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                  </button>
                </div>
              </div>

              {/* Question 4: GST Invoice */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-extrabold text-brand-black">4. Do you have valid Purchase Invoice / Bill?</label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setHasBill("yes")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      hasBill === "yes" ? "border-brand-yellow bg-yellow-50/50" : "border-gray-200"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold">Yes, Bill Available</span>
                    {hasBill === "yes" && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasBill("no")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      hasBill === "no" ? "border-brand-yellow bg-yellow-50/50" : "border-gray-200"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold">No Bill</span>
                    {hasBill === "no" && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <Button variant="primary" size="lg" onClick={() => setCurrentStep(2)} className="font-extrabold px-8">
                  CONTINUE TO STEP 2 &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SCREEN & DISPLAY ISSUES */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-black">Step 2: Laptop Display &amp; Screen Condition</h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">Select any issues present on your laptop screen panel (or select No Defects).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "scratches", title: "Screen Scratches", desc: "Visible scratches on laptop display panel", icon: <LaptopScreenDefectIcon /> },
                  { id: "lines", title: "Dead Pixels / Lines / Spots", desc: "Black dots, vertical or horizontal lines on screen", icon: <LaptopScreenDefectIcon /> },
                  { id: "bleeding", title: "Screen Bleeding / Spotting", desc: "Uneven backlight or yellow/white light bleeding", icon: <LaptopScreenDefectIcon /> },
                  { id: "cracked", title: "Cracked / Broken Display", desc: "Physical crack or shattered glass on laptop screen", icon: <LaptopScreenDefectIcon /> },
                ].map((item) => {
                  const isSelected = screenDefects.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleMultiSelect(item.id, screenDefects, setScreenDefects)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                        isSelected ? "border-brand-yellow bg-yellow-50/40 shadow-subtleCard" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {item.icon}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-brand-black">{item.title}</h3>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                        </div>
                        <p className="text-xs text-brand-muted mt-1 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-bold text-gray-500 hover:text-black">
                  &larr; Back to Step 1
                </button>
                <Button variant="primary" size="lg" onClick={() => setCurrentStep(3)} className="font-extrabold px-8">
                  CONTINUE TO STEP 3 &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: FUNCTIONAL & HARDWARE COMPONENTS */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-black">Step 3: Hardware &amp; Component Functional Issues</h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">Select hardware problems on your laptop (leave empty if all components work fine).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "keyboard", title: "Keyboard Keys Faulty / Sticky", desc: "One or more keys fail to respond or stick", icon: <LaptopKeyboardIcon /> },
                  { id: "trackpad", title: "Trackpad / Touchpad Not Working", desc: "Cursor jumps or touchpad click does not work", icon: <LaptopTrackpadIcon /> },
                  { id: "battery", title: "Battery Faulty / Service Battery", desc: "Laptop shuts down quickly or battery doesn't charge", icon: <LaptopBatteryIcon /> },
                  { id: "speaker", title: "Speakers Crackling / Distorted", desc: "No audio or distorted speaker sound", icon: <LaptopSpeakerIcon /> },
                  { id: "ports", title: "USB / HDMI / Charging Port Faulty", desc: "Port loose or fails to transfer data/power", icon: <LaptopPortsIcon /> },
                ].map((item) => {
                  const isSelected = hardwareDefects.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleMultiSelect(item.id, hardwareDefects, setHardwareDefects)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                        isSelected ? "border-brand-yellow bg-yellow-50/40 shadow-subtleCard" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {item.icon}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-brand-black">{item.title}</h3>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                        </div>
                        <p className="text-xs text-brand-muted mt-1 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-bold text-gray-500 hover:text-black">
                  &larr; Back to Step 2
                </button>
                <Button variant="primary" size="lg" onClick={() => setCurrentStep(4)} className="font-extrabold px-8">
                  CONTINUE TO STEP 4 &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PHYSICAL BODY CONDITION */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-black">Step 4: Laptop Physical Body Condition</h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">Select overall cosmetic condition of the outer casing, lid &amp; hinges.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: "flawless", title: "Flawless / Like New", desc: "No visible scratches, zero dents or discoloration on body." },
                  { id: "minor", title: "Minor Scratches / Normal Wear", desc: "Light scratches or hairline marks from everyday usage." },
                  { id: "major", title: "Heavy Dents / Cracked Body / Loose Hinge", desc: "Deep dents, cracked corner casing, or broken screen hinge." },
                ].map((cond) => {
                  const isSelected = bodyCondition === cond.id;
                  return (
                    <div
                      key={cond.id}
                      onClick={() => setBodyCondition(cond.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                        isSelected ? "border-brand-yellow bg-yellow-50/40 shadow-subtleCard" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <LaptopBodyDefectIcon />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-brand-black">{cond.title}</h3>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                        </div>
                        <p className="text-xs text-brand-muted mt-1">{cond.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-bold text-gray-500 hover:text-black">
                  &larr; Back to Step 3
                </button>
                <Button variant="primary" size="lg" onClick={() => setCurrentStep(5)} className="font-extrabold px-8">
                  CONTINUE TO STEP 5 &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: ACCESSSORIES & UNLOCK FINAL PRICE */}
          {currentStep === 5 && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-black">Step 5: Included Laptop Accessories</h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">Check original accessories you will hand over during doorstep pickup.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "charger", title: "Original Brand Charger", desc: "Working official power brick & cable" },
                  { id: "box", title: "Original Packaging Box", desc: "Original box matching laptop serial number" },
                  { id: "bill", title: "Purchase Invoice / Bill", desc: "Original tax invoice matching purchase" },
                ].map((acc) => {
                  const isSelected = accessories.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleMultiSelect(acc.id, accessories, setAccessories)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected ? "border-brand-yellow bg-yellow-50/40 shadow-subtleCard" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-extrabold text-brand-black">{acc.title}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />}
                      </div>
                      <p className="text-xs text-brand-muted mt-1 leading-snug">{acc.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* PRICE DISPLAY CARD - SHOWN ONLY AFTER LOGIN */}
              {isLoggedIn ? (
                <div className="bg-brand-black text-white rounded-3xl p-6 sm:p-8 border border-brand-yellow/40 shadow-yellowGlow space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-brand-yellow uppercase tracking-wider block">
                        Unlocked Instant Cash Valuation
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-brand-yellow font-mono mt-1 block">
                        &#8377;{finalPrice.toLocaleString("en-IN")}
                      </span>
                      <p className="text-xs text-gray-300 mt-1">
                        Includes free doorstep pickup &amp; direct instant payment upon physical verification
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleGenerateLaptopQuote}
                      className="font-black px-8 py-4 text-sm shadow-yellowGlow shrink-0"
                    >
                      BOOK FREE PICKUP &rarr;
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-black text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 text-center space-y-4">
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-brand-yellow text-xl border border-neutral-800">
                      🔒
                    </div>
                    <span className="text-xs font-extrabold text-brand-yellow uppercase tracking-wider block">
                      Best Price Guarantee
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Login to View Instant Valuation Price
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Please login or enter your mobile number to unlock your instant cash valuation quote and schedule free doorstep pickup.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    className="font-black px-8 py-4 text-sm shadow-yellowGlow"
                  >
                    🔒 UNLOCK PRICE &amp; CONTINUE &rarr;
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button type="button" onClick={() => setCurrentStep(4)} className="text-xs font-bold text-gray-500 hover:text-black">
                  &larr; Back to Step 4
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* PRICE UNLOCK MODAL */}
      <PriceUnlockModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(userData) => {
          setModalOpen(false);
          setIsLoggedIn(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("cashall_user", JSON.stringify(userData));
          }
        }}
        deviceName={`${brand.name} ${model?.name || "Laptop"}`}
        storage={variant?.storage || "Standard Specs"}
      />
    </div>
  );
}
