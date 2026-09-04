"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PriceUnlockModal } from "@/components/common/PriceUnlockModal";
import { VisualOptionCard } from "@/components/assessment/VisualOptionCard";
import { RadioQuestionItem } from "@/components/assessment/RadioQuestionItem";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { AssessmentSidebar } from "@/components/assessment/AssessmentSidebar";
import {
  INITIAL_BRANDS,
  INITIAL_MODELS,
  INITIAL_VARIANTS,
  QuoteData,
} from "@/lib/store";
import { saveQuoteToCart } from "@/lib/cart";
import { formatDeviceName } from "@/lib/device";
import { trackMetaCustomEvent, trackMetaStandardEvent } from "@/lib/analytics/meta";
import { ChevronRight } from "lucide-react";

const PROCESSOR_OPTIONS = [
  "Intel Core i3",
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "Intel Core Ultra 5",
  "Intel Core Ultra 7",
  "Intel Core Ultra 9",
  "Intel Core 2 Duo",
  "Intel Pentium / Celeron",
  "AMD Ryzen 3",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
  "AMD Ryzen 9",
  "AMD Athlon",
  "Apple M1",
  "Apple M1 Pro / Max",
  "Apple M2",
  "Apple M2 Pro / Max",
  "Apple M3",
  "Apple M3 Pro / Max",
  "Apple M4",
  "Other Dual Core"
];

const RAM_OPTIONS = [
  "512 MB",
  "1 GB",
  "2 GB",
  "3 GB",
  "4 GB",
  "6 GB",
  "8 GB",
  "12 GB",
  "16 GB",
  "24 GB",
  "32 GB",
  "64 GB"
];

const STORAGE_OPTIONS = [
  "60 GB HDD",
  "80 GB HDD",
  "120 GB HDD",
  "160 GB HDD",
  "250 GB HDD",
  "320 GB HDD",
  "500 GB HDD",
  "750 GB HDD",
  "1 TB HDD",
  "2 TB HDD",
  "64 GB SSD",
  "128 GB SSD",
  "256 GB SSD",
  "512 GB SSD",
  "1 TB SSD",
  "2 TB SSD",
  "4 TB SSD",
  "128 GB SSD + 1 TB HDD",
  "256 GB SSD + 1 TB HDD",
  "512 GB SSD + 1 TB HDD",
  "1 TB SSD + 1 TB HDD"
];

export default function LaptopAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "macbook-air-2022-m2";
  const variantIdParam = searchParams.get("variantId") || "";

  const brand = INITIAL_BRANDS.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase()) || {
    id: `b-${brandSlug}`,
    name: brandSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    slug: brandSlug,
    category: "LAPTOP",
    active: true,
  };

  const cleanModelSlug = modelSlug.toLowerCase();
  const model = INITIAL_MODELS.find(
    (m) =>
      m.slug.toLowerCase() === cleanModelSlug ||
      m.slug.toLowerCase() === `${brandSlug.toLowerCase()}-${cleanModelSlug}` ||
      m.name.toLowerCase().replace(/\s+/g, "-") === cleanModelSlug
  ) || {
    id: `m-${modelSlug}`,
    brandId: brand.id,
    brandSlug: brand.slug,
    name: modelSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    slug: modelSlug,
    imageUrl: `https://s3ng.cashify.in/cashify/product/img/xhdpi/${modelSlug}.jpg`,
    releaseYear: 2023,
    popular: true,
    active: true,
    contactForPrice: false,
    category: "LAPTOP",
  };

  const resolvedVariant = INITIAL_VARIANTS.find((v) => v.id === variantIdParam);
  const [activeVariant, setActiveVariant] = useState<any>(resolvedVariant || null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let foundVar = resolvedVariant;
      if (!foundVar) {
        try {
          const stored = localStorage.getItem("cashall_current_variant");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.modelId === model.id || parsed.id === variantIdParam || parsed.storage)) {
              foundVar = parsed;
            }
          }
        } catch (e) {}
      }

      if (!foundVar) {
        const matchByModel = INITIAL_VARIANTS.filter((v) => v.modelId === model.id);
        if (matchByModel.length > 0) {
          foundVar = matchByModel[0];
        } else {
          foundVar = {
            id: `v-laptop-${model.slug}-256`,
            modelId: model.id,
            storage: "8 GB / 256 GB SSD",
            basePrice: 42000,
            active: true,
          };
        }
      }

      setActiveVariant(foundVar);
    }
  }, [variantIdParam, model.id, model.slug, resolvedVariant]);

  const variant = activeVariant || {
    id: `v-laptop-${model.slug}-256`,
    modelId: model.id,
    storage: "8 GB / 256 GB SSD",
    basePrice: 42000,
    active: true,
  };

  // ── WIZARD STATE (7 STEPS) ────────────────────────────────────────────────
  const [step, setStep] = useState<number>(1);
  const totalSteps = 7;
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // STEP 1: Power Status
  const [turnsOn, setTurnsOn] = useState<boolean | null>(true);

  // STEP 2: System Configuration Details (Processor, RAM, Storage)
  const isApple = brandSlug.toLowerCase() === "apple" || model.name.toLowerCase().includes("macbook");
  const [processor, setProcessor] = useState<string>(isApple ? "Apple M2" : "Intel Core i3");
  const [ram, setRam] = useState<string>("512 MB");
  const [hardDisk, setHardDisk] = useState<string>("60 GB HDD");

  // STEP 3: Functional Problems (Multi-select)
  const [functionalProblems, setFunctionalProblems] = useState<string[]>([]);

  // STEP 4: Screen Condition (4 single-choice groups)
  const [screenScratches, setScreenScratches] = useState<string>("no_scratches");
  const [screenDiscoloration, setScreenDiscoloration] = useState<string>("no_discoloration");
  const [screenSpots, setScreenSpots] = useState<string>("no_spots");
  const [screenLines, setScreenLines] = useState<string>("no_lines");

  // STEP 5: Accessories (Multi-select)
  const [accessories, setAccessories] = useState<string[]>(["charger", "box"]);

  // STEP 6: Laptop Age
  const [laptopAge, setLaptopAge] = useState<string>("Less than 1 year (in warranty)");

  // STEP 7: Physical Body Condition (5 single-choice groups)
  const [bodyScratches, setBodyScratches] = useState<string>("no_scratches");
  const [topPanelDents, setTopPanelDents] = useState<string>("no_dents");
  const [basePanelDents, setBasePanelDents] = useState<string>("no_dents");
  const [looseHinges, setLooseHinges] = useState<string>("no_loose");
  const [panelCondition, setPanelCondition] = useState<string>("no_defect");

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  // ── MARKET PRICING PERCENTAGE DEDUCTIONS ───────────────────────────────────
  const calculatePricing = () => {
    const baseP = variant.basePrice;
    let totalDeductionPct = 0;
    const deductionsList: { label: string; amount: number }[] = [];

    const addDeduction = (label: string, pct: number) => {
      totalDeductionPct += pct;
      const amt = Math.round((baseP * pct) / 100);
      deductionsList.push({ label, amount: amt });
    };

    // Step 1 Power Status
    if (turnsOn === false) {
      addDeduction("Device Does Not Switch On", 65);
    }

    // Step 2 Configuration Adjustments
    if (["512 MB", "1 GB", "2 GB"].includes(ram)) {
      addDeduction(`Low RAM (${ram})`, 14);
    } else if (["3 GB", "4 GB"].includes(ram)) {
      addDeduction(`Entry RAM (${ram})`, 8);
    }

    if (["60 GB HDD", "80 GB HDD", "120 GB HDD", "160 GB HDD"].includes(hardDisk)) {
      addDeduction(`Legacy HDD (${hardDisk})`, 12);
    } else if (["250 GB HDD", "320 GB HDD", "500 GB HDD"].includes(hardDisk)) {
      addDeduction(`Standard HDD (${hardDisk})`, 6);
    }

    if (["Intel Core 2 Duo", "Intel Pentium / Celeron", "AMD Athlon"].includes(processor)) {
      addDeduction(`Legacy Processor (${processor})`, 10);
    }

    // Step 3 Functional Problems
    const funcMap: Record<string, { label: string; pct: number }> = {
      keyboard: { label: "Keyboard Defective", pct: 10 },
      cddvd: { label: "CD/DVD Drive Defective", pct: 3 },
      touchpad: { label: "Touchpad / Click Issue", pct: 8 },
      battery_dead: { label: "Battery Degraded / Backup < 60m", pct: 15 },
      speakers: { label: "Speakers Cracked/Faulty", pct: 6 },
      wifi: { label: "Wi-Fi Malfunction", pct: 7 },
      usb: { label: "USB Port Malfunction", pct: 5 },
      webcam: { label: "Webcam Not Working", pct: 4 },
      charging_port: { label: "Charging Port Issue", pct: 8 },
      hard_drive: { label: "Hard Drive / SSD Defective", pct: 18 },
      motherboard: { label: "Motherboard / Booting Issue", pct: 40 },
    };

    functionalProblems.forEach((pId) => {
      if (funcMap[pId]) {
        addDeduction(funcMap[pId].label, funcMap[pId].pct);
      }
    });

    // Step 4 Screen Condition Groups
    if (screenScratches === "1_2_scratches") addDeduction("1-2 Scratches on Screen", 4);
    if (screenScratches === "more_than_2") addDeduction("Major Scratches on Screen", 8);
    if (screenScratches === "cracked_broken") addDeduction("Screen Cracked or Broken", 28);

    if (screenDiscoloration === "minor") addDeduction("Minor Screen Discolouration", 6);
    if (screenDiscoloration === "major") addDeduction("Major Screen Discolouration", 14);

    if (screenSpots === "minor_spots") addDeduction("1-2 Minor Screen Spots", 6);
    if (screenSpots === "heavy_spots") addDeduction("Heavy Visible Spots on Screen", 14);

    if (screenLines === "visible_lines") addDeduction("Visible Lines on Screen", 18);
    if (screenLines === "flickering") addDeduction("Display Flickering Issue", 15);
    if (screenLines === "black_dots") addDeduction("Black Dots on Screen", 16);

    // Step 5 Accessories
    if (!accessories.includes("charger")) addDeduction("Original Charger Missing", 10);
    if (!accessories.includes("box")) addDeduction("Original Box Missing", 3);

    // Step 6 Laptop Age
    if (laptopAge === "Between 1 and 3 years") addDeduction("Device Age (1-3 Years)", 8);
    if (laptopAge === "More than 3 years") addDeduction("Device Age (> 3 Years)", 16);

    // Step 7 Physical Body Condition Groups
    if (bodyScratches === "minor") addDeduction("Minor Scratches on Body", 3);
    if (bodyScratches === "major") addDeduction("Major Scratches on Body", 7);

    if (topPanelDents === "upto_2") addDeduction("Upto 2 Minor Top Dents", 3);
    if (topPanelDents === "more_than_2") addDeduction("Multiple Minor Top Dents", 6);
    if (topPanelDents === "major") addDeduction("Major Top Panel Dent", 10);

    if (basePanelDents === "upto_2") addDeduction("Upto 2 Minor Base Dents", 3);
    if (basePanelDents === "more_than_2") addDeduction("Multiple Minor Base Dents", 6);
    if (basePanelDents === "major") addDeduction("Major Base Panel Dent", 10);

    if (looseHinges === "loose") addDeduction("Loose / Damaged Hinges", 6);

    if (panelCondition === "loose") addDeduction("Loose Device Panel", 5);
    if (panelCondition === "cracked") addDeduction("Cracked / Damaged Panel", 12);

    const totalDeductionAmount = Math.round((baseP * totalDeductionPct) / 100);
    const calculatedPrice = Math.max(Math.round(baseP * 0.15), Math.max(2500, baseP - totalDeductionAmount));

    return {
      estimatedPrice: calculatedPrice,
      totalDeductions: baseP - calculatedPrice,
      deductionsList,
    };
  };

  const { estimatedPrice, totalDeductions, deductionsList } = calculatePricing();

  useEffect(() => {
    if (brand && model && variant) {
      const deviceFullName = formatDeviceName(brand.name, model.name, variant.storage);
      trackMetaCustomEvent("AssessmentStarted", {
        content_name: deviceFullName,
        content_category: "laptop",
        brand: brand.name,
        model: model.name,
        storage: variant.storage,
      }, { eventId: `assess_start_${variant.id}` });
    }
  }, [variant?.id]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      handleFinalize();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleFinalize = () => {
    if (typeof window !== "undefined" && !localStorage.getItem("cashall_user")) {
      setUnlockModalOpen(true);
      return;
    }
    proceedWithQuote();
  };

  const proceedWithQuote = () => {
    const quoteId = `quote-${Date.now()}`;
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const quoteNumber = `CAQ${random5Digits}`;
    const currentConfigStr = `${processor} • ${ram} • ${hardDisk}`;
    const deviceFullName = formatDeviceName(brand.name, model.name, currentConfigStr);

    const answersSummary = {
      device: deviceFullName,
      turnsOn,
      processor,
      ram,
      hardDisk,
      functionalProblems,
      screenScratches,
      screenDiscoloration,
      screenSpots,
      screenLines,
      accessories,
      laptopAge,
      bodyScratches,
      topPanelDents,
      basePanelDents,
      looseHinges,
      panelCondition,
    };

    const newQuote: QuoteData = {
      id: quoteId,
      quoteNumber,
      variantId: variant.id,
      selectedAnswersJson: JSON.stringify(answersSummary),
      basePrice: variant.basePrice,
      totalDeductions,
      estimatedPrice,
      breakdownJson: JSON.stringify({
        deviceName: deviceFullName,
        basePrice: variant.basePrice,
        estimatedPrice,
        summary: [
          { label: "Base Laptop Market Valuation", amount: variant.basePrice },
          { label: "Hardware & Condition Deductions", amount: -totalDeductions },
        ],
      }),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    let userCustomerName = "";
    let userCustomerPhone = "";
    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_quote_${quoteId}`, JSON.stringify(newQuote));
      localStorage.setItem("cashall_latest_quote", JSON.stringify(newQuote));
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
        category: "LAPTOP",
        estimatedPrice,
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
        ...newQuote,
        customerName: userCustomerName,
        customerPhone: userCustomerPhone,
        deviceName: deviceFullName,
      }),
    }).catch((err) => console.error("Quote DB save error:", err));

    trackMetaCustomEvent("AssessmentCompleted", {
      content_name: deviceFullName,
      content_category: "laptop",
      brand: brand.name,
      model: model.name,
      estimated_value: estimatedPrice,
      currency: "INR",
    }, { eventId: `assess_done_${variant.id}` });

    trackMetaCustomEvent("QuoteGenerated", {
      quote_id: quoteNumber,
      content_name: deviceFullName,
      content_category: "laptop",
      brand: brand.name,
      model: model.name,
      value: estimatedPrice,
      currency: "INR",
    }, { eventId: `quote_${quoteNumber}` });

    trackMetaStandardEvent("AddToCart", {
      content_type: "product",
      content_name: deviceFullName,
      content_ids: [variant.id],
      value: estimatedPrice,
      currency: "INR",
    }, { eventId: `cart_${quoteNumber}` });

    router.push(`/quote/${quoteId}`);
  };

  const stepTitles = [
    { title: "Does the Laptop switch on?", subtitle: "We currently only accept devices that switch on without any issues." },
    { title: "System Configuration Details", subtitle: "Choose your laptop's processor, memory (RAM), and storage configuration from the options below." },
    { title: "Does your device function properly?", subtitle: "Please choose appropriate condition to get accurate quote" },
    { title: "Select the screen condition of your device?", subtitle: "Select options that best describe your screen" },
    { title: "Do you have the following?", subtitle: "Please select accessories which are available" },
    { title: "Age of your device", subtitle: "Let us know how old is your device. Valid bill is needed for devices less than 3 years." },
    { title: "Select the physical condition of your device?", subtitle: "Select body, hinge and panel condition" },
  ];

  const currentHeaderInfo = stepTitles[step - 1] || stepTitles[0];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/laptop" className="hover:text-brand-black">Sell Laptop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/laptop/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{model.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* WIZARD QUESTION CONTENT (LEFT 8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              <AssessmentHeader
                currentStep={step}
                totalSteps={totalSteps}
                stepTitle={currentHeaderInfo.title}
                stepSubtitle={currentHeaderInfo.subtitle}
                onBack={handleBack}
                canGoBack={step > 1}
              />

              {/* ── STEP 1: Power Status ── */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <RadioQuestionItem
                    id="q-laptop-power"
                    questionNumber={1}
                    question="Does the Laptop switch on?"
                    hint="We currently only accept devices that switch on without any issues."
                    options={["Yes", "No"]}
                    selectedValue={turnsOn}
                    onSelect={(val) => setTurnsOn(val)}
                  />
                </div>
              )}

              {/* ── STEP 2: System Configuration Details ── */}
              {step === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      System Configuration Details
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose your laptop's processor, memory (RAM), and storage configuration from the options below.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Processor Dropdown */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Processor <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="select-laptop-processor"
                          value={processor}
                          onChange={(e) => setProcessor(e.target.value)}
                          className="w-full bg-white border border-gray-200 hover:border-brand-yellow focus:border-brand-yellow rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 shadow-sm transition pr-10 cursor-pointer"
                        >
                          {PROCESSOR_OPTIONS.map((proc) => (
                            <option key={proc} value={proc}>
                              {proc}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* RAM Dropdown */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        RAM <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="select-laptop-ram"
                          value={ram}
                          onChange={(e) => setRam(e.target.value)}
                          className="w-full bg-white border border-gray-200 hover:border-brand-yellow focus:border-brand-yellow rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 shadow-sm transition pr-10 cursor-pointer"
                        >
                          {RAM_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Hard Disk Dropdown */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Hard Disk <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="select-laptop-harddisk"
                          value={hardDisk}
                          onChange={(e) => setHardDisk(e.target.value)}
                          className="w-full bg-white border border-gray-200 hover:border-brand-yellow focus:border-brand-yellow rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 shadow-sm transition pr-10 cursor-pointer"
                        >
                          {STORAGE_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Selected: <strong>{processor}</strong> • <strong>{ram} RAM</strong> • <strong>{hardDisk}</strong></span>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Functional Problems (11 Visual Cards) ── */}
              {step === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <VisualOptionCard
                      id="prob-laptop-kb"
                      label="Keyboard not working; key(s) missing/not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9d8f386a4.png"
                      selected={functionalProblems.includes("keyboard")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "keyboard"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-cddvd"
                      label="CD/DVD Drive not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9cb0aceb0.png"
                      selected={functionalProblems.includes("cddvd")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "cddvd"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-touchpad"
                      label="Touchpad not working; Left/Right click faulty"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9cad03f51.png"
                      selected={functionalProblems.includes("touchpad")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "touchpad"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-battery"
                      label="Battery dead, backup < 60 mins, health < 80%, cycle count > 800"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9cab2beab.png"
                      selected={functionalProblems.includes("battery_dead")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "battery_dead"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-speakers"
                      label="Speakers not working; faulty/cracked sound"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9ceeabfbd.png"
                      selected={functionalProblems.includes("speakers")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "speakers"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-wifi"
                      label="Wi-Fi not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9d25e5a56.png"
                      selected={functionalProblems.includes("wifi")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "wifi"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-usb"
                      label="USB Port not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9ddc6abb4.png"
                      selected={functionalProblems.includes("usb")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "usb"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-webcam"
                      label="Web Cam not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/60ab9e0f2bf81.png"
                      selected={functionalProblems.includes("webcam")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "webcam"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-charging"
                      label="Charging Port not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/6148560d0c3b3.png"
                      selected={functionalProblems.includes("charging_port")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "charging_port"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-harddrive"
                      label="Hard Drive Missing/Defective"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/61487866ea5a5.png"
                      selected={functionalProblems.includes("hard_drive")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "hard_drive"))}
                    />
                    <VisualOptionCard
                      id="prob-laptop-mobo"
                      label="Motherboard issue - auto restart, hanging, heating/not booting"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/62e0d8a3d520e.png"
                      selected={functionalProblems.includes("motherboard")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "motherboard"))}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {functionalProblems.length === 0 ? "No hardware defects selected" : `${functionalProblems.length} issue(s) reported`}
                    </p>
                    {functionalProblems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFunctionalProblems([])}
                        className="text-xs font-bold text-gray-500 hover:text-red-600 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 4: Screen Condition (4 Groups of Single Choice Visual Cards) ── */}
              {step === 4 && (
                <div className="space-y-6">
                  {/* Group 1: Scratch or Broken on Screen */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Scratch or Broken on Screen
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <VisualOptionCard
                        id="scr-no-scratches"
                        label="No scratches on screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Scratches_on_screen.png"
                        selected={screenScratches === "no_scratches"}
                        onClick={() => setScreenScratches("no_scratches")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="scr-1-2-scratches"
                        label="1-2 scratches on screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Minor_scratches.png"
                        selected={screenScratches === "1_2_scratches"}
                        onClick={() => setScreenScratches("1_2_scratches")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="scr-more-2-scratches"
                        label="More than 2 scratches on screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Major_scratches.png"
                        selected={screenScratches === "more_than_2"}
                        onClick={() => setScreenScratches("more_than_2")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="scr-cracked-broken"
                        label="Screen Cracked or Broken"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Screen_Cracked.png"
                        selected={screenScratches === "cracked_broken"}
                        onClick={() => setScreenScratches("cracked_broken")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Group 2: Discolouration on Screen */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Discolouration on Screen
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="disc-no"
                        label="No Discolouration"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Discoloration.png"
                        selected={screenDiscoloration === "no_discoloration"}
                        onClick={() => setScreenDiscoloration("no_discoloration")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="disc-minor"
                        label="Minor Discolouration"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Minor_Discoloration.png"
                        selected={screenDiscoloration === "minor"}
                        onClick={() => setScreenDiscoloration("minor")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="disc-major"
                        label="Major Discolouration"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Major_Discoloration.png"
                        selected={screenDiscoloration === "major"}
                        onClick={() => setScreenDiscoloration("major")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Group 3: Spots on Screen */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Spots on Screen
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="spot-no"
                        label="No spots on screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Spots.png"
                        selected={screenSpots === "no_spots"}
                        onClick={() => setScreenSpots("no_spots")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="spot-minor"
                        label="1-2 minor spots on screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/1-2_Spots_on_Screen-Display.png"
                        selected={screenSpots === "minor_spots"}
                        onClick={() => setScreenSpots("minor_spots")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="spot-heavy"
                        label="Large/ heavy visible spots on screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Heavy_Spots_on_Screen-Display.png"
                        selected={screenSpots === "heavy_spots"}
                        onClick={() => setScreenSpots("heavy_spots")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Group 4: Line on Screen */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Line on Screen
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <VisualOptionCard
                        id="line-no"
                        label="No Lines"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Lines.png"
                        selected={screenLines === "no_lines"}
                        onClick={() => setScreenLines("no_lines")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="line-visible"
                        label="Visible lines on Screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Visible_lines_on_Screen.png"
                        selected={screenLines === "visible_lines"}
                        onClick={() => setScreenLines("visible_lines")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="line-flickering"
                        label="Display Flickering"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Display_Flickering.png"
                        selected={screenLines === "flickering"}
                        onClick={() => setScreenLines("flickering")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="line-blackdots"
                        label="Black Dots on Screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Screen_Cracked_1.png"
                        selected={screenLines === "black_dots"}
                        onClick={() => setScreenLines("black_dots")}
                        multiSelect={false}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Laptop Accessories ── */}
              {step === 5 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <VisualOptionCard
                      id="laptop-acc-box"
                      label="Original Box with same serial number"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Box_Available.png"
                      selected={accessories.includes("box")}
                      onClick={() => setAccessories(toggleArrayItem(accessories, "box"))}
                      sublabel="Original retail packaging with matching serial tag"
                    />
                    <VisualOptionCard
                      id="laptop-acc-charger"
                      label="Original charger available"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Charger_Available.png"
                      selected={accessories.includes("charger")}
                      onClick={() => setAccessories(toggleArrayItem(accessories, "charger"))}
                      sublabel="Official power adapter and charging cord"
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 6: Laptop Age ── */}
              {step === 6 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <RadioQuestionItem
                    id="q-laptop-age"
                    questionNumber={1}
                    question="Age of your device"
                    hint="Let us know how old is your device. Valid bill is needed for devices less than 3 years."
                    options={[
                      "Less than 1 year (in warranty)",
                      "Between 1 and 3 years",
                      "More than 3 years",
                    ]}
                    selectedValue={laptopAge}
                    onSelect={(val) => setLaptopAge(val)}
                  />
                </div>
              )}

              {/* ── STEP 7: Physical Body Condition (5 Groups) ── */}
              {step === 7 && (
                <div className="space-y-6">
                  {/* Group 1: Scratch on Body */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Scratch on Body
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="bodyscr-no"
                        label="No Scratches"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Minor_Body_1.png"
                        selected={bodyScratches === "no_scratches"}
                        onClick={() => setBodyScratches("no_scratches")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="bodyscr-minor"
                        label="Minor Scratch on Body"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/1-2_Minor_scratch_body.png"
                        selected={bodyScratches === "minor"}
                        onClick={() => setBodyScratches("minor")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="bodyscr-major"
                        label="Major Scratch on Body"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Heavy_scratch-body.png"
                        selected={bodyScratches === "major"}
                        onClick={() => setBodyScratches("major")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Group 2: Dent on Top Panel */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Dent on Top Panel
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <VisualOptionCard
                        id="topdent-no"
                        label="No Dents on top panel"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Dents_on_top_panel.png"
                        selected={topPanelDents === "no_dents"}
                        onClick={() => setTopPanelDents("no_dents")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="topdent-upto2"
                        label="Upto 2 Minor Dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/1_Minor_Dent_1.png"
                        selected={topPanelDents === "upto_2"}
                        onClick={() => setTopPanelDents("upto_2")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="topdent-more2"
                        label="More than 2 Minor Dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Multiple_Minor_Dents_1.png"
                        selected={topPanelDents === "more_than_2"}
                        onClick={() => setTopPanelDents("more_than_2")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="topdent-major"
                        label="1 or more Major Dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Major_Dents_1.png"
                        selected={topPanelDents === "major"}
                        onClick={() => setTopPanelDents("major")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Group 3: Dent on Base Panel */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Dent on Base Panel
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <VisualOptionCard
                        id="basedent-no"
                        label="No Dents on base panel"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Dents_on_base_panel.png"
                        selected={basePanelDents === "no_dents"}
                        onClick={() => setBasePanelDents("no_dents")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="basedent-upto2"
                        label="Upto 2 Minor Dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/1_Minor_Dent_Base.png"
                        selected={basePanelDents === "upto_2"}
                        onClick={() => setBasePanelDents("upto_2")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="basedent-more2"
                        label="More than 2 Minor Dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Multiple_Minor_Dents_Base.png"
                        selected={basePanelDents === "more_than_2"}
                        onClick={() => setBasePanelDents("more_than_2")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="basedent-major"
                        label="1 or more Major Dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Major_Dents_base.png"
                        selected={basePanelDents === "major"}
                        onClick={() => setBasePanelDents("major")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Group 4: Loose Hinges */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Loose Hinges
                    </h3>
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      <VisualOptionCard
                        id="hinges-no"
                        label="No Loose Hinges"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Hinges-No.png"
                        selected={looseHinges === "no_loose"}
                        onClick={() => setLooseHinges("no_loose")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="hinges-yes"
                        label="Yes - Loose Hinges"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Hinges_-Yes.png"
                        selected={looseHinges === "loose"}
                        onClick={() => setLooseHinges("loose")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Group 5: Cracked or Loose Panel */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Cracked or Loose Panel
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="panel-no"
                        label="No Cracked or Loose Panel"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Cracked_or_Loose_Panel.png"
                        selected={panelCondition === "no_defect"}
                        onClick={() => setPanelCondition("no_defect")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="panel-loose"
                        label="Loose Panel"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Loose_Panel.png"
                        selected={panelCondition === "loose"}
                        onClick={() => setPanelCondition("loose")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="panel-crack"
                        label="Crack/Damage Panel"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Crack-Damage_Panel.png"
                        selected={panelCondition === "cracked"}
                        onClick={() => setPanelCondition("cracked")}
                        multiSelect={false}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE VALUATION SIDEBAR (RIGHT 4 COLS) */}
            <div className="lg:col-span-4">
              <AssessmentSidebar
                deviceName={formatDeviceName(brand.name, model.name, `${processor} • ${ram} • ${hardDisk}`)}
                deviceImageUrl={model.imageUrl}
                storageOrSpecs={`${processor} • ${ram} • ${hardDisk}`}
                basePrice={variant.basePrice}
                estimatedPrice={estimatedPrice}
                onNext={handleNext}
                nextButtonText={step === totalSteps ? "Get Exact Value" : "Continue"}
                onBack={handleBack}
                currentStep={step}
                totalSteps={totalSteps}
                deductionBreakdown={deductionsList}
              />
            </div>
          </div>
        </div>
      </main>

      <PriceUnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onSuccess={() => {
          setUnlockModalOpen(false);
          proceedWithQuote();
        }}
        deviceName={formatDeviceName(brand.name, model.name, `${processor} • ${ram} • ${hardDisk}`)}
        deviceImageUrl={model.imageUrl}
        storage={`${processor} • ${ram} • ${hardDisk}`}
      />

      <Footer />
    </div>
  );
}
