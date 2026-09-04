"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PriceUnlockModal } from "@/components/common/PriceUnlockModal";
import { VisualOptionCard } from "@/components/assessment/VisualOptionCard";
import {
  TabletScreenIllustration,
  TabletHardwareIllustration,
} from "@/components/assessment/TabletIllustrations";
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

export default function TabletAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

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

  const cleanModelSlug = modelSlug.toLowerCase();
  const model = INITIAL_MODELS.find(
    (m) =>
      (m.slug.toLowerCase() === cleanModelSlug || m.id === modelSlug) &&
      m.category === "TABLET"
  ) || INITIAL_MODELS.find((m) => m.slug.toLowerCase() === cleanModelSlug) || {
    id: `m-tablet-${modelSlug}`,
    brandId: brand.id,
    brandSlug: brand.slug,
    name: modelSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    slug: modelSlug,
    imageUrl: `https://s3ng.cashify.in/cashify/product/img/xhdpi/${modelSlug}.jpg`,
    releaseYear: 2023,
    popular: true,
    active: true,
    contactForPrice: false,
    category: "TABLET",
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
  }, [variantIdParam, model.id, model.slug, resolvedVariant]);

  const variant = activeVariant || {
    id: `v-tablet-${model.slug}-128`,
    modelId: model.id,
    storage: "128 GB",
    basePrice: 24000,
    active: true,
  };

  const isLte =
    model.name.toLowerCase().includes("lte") ||
    model.name.toLowerCase().includes("cellular") ||
    model.name.toLowerCase().includes("5g") ||
    modelSlug.toLowerCase().includes("lte") ||
    modelSlug.toLowerCase().includes("cellular");

  const isStylusCompatible =
    model.name.toLowerCase().includes("ipad") ||
    model.name.toLowerCase().includes("tab s") ||
    model.name.toLowerCase().includes("oneplus pad") ||
    model.name.toLowerCase().includes("pen") ||
    model.name.toLowerCase().includes("pro");

  // ── WIZARD STATE ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<number>(1);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // STEP 1: Basic Tablet Checks
  const [switchesOn, setSwitchesOn] = useState<boolean | null>(true);
  const [networkWorking, setNetworkWorking] = useState<boolean | null>(isLte ? true : null);
  const [simTrayAvailable, setSimTrayAvailable] = useState<boolean | null>(isLte ? true : null);
  const [hasGstBill, setHasGstBill] = useState<boolean | null>(null);
  const [underWarranty, setUnderWarranty] = useState<boolean | null>(null);

  // STEP 2: Screen Condition (3 groups: Scratches, Discoloration, Spots & Lines)
  const [screenScratches, setScreenScratches] = useState<string>("no_scratches");
  const [screenDiscoloration, setScreenDiscoloration] = useState<string>("no_discoloration");
  const [screenSpotsLines, setScreenSpotsLines] = useState<string>("no_spots");

  // STEP 3: Tablet Functional Problems (Multi-select)
  const [functionalProblems, setFunctionalProblems] = useState<string[]>([]);

  // STEP 4: Tablet Body Defects (4 groups: Scratches, Dents, Bent/Loose, Panel)
  const [bodyScratches, setBodyScratches] = useState<string>("no_scratches");
  const [bodyDents, setBodyDents] = useState<string>("no_dents");
  const [bentLoose, setBentLoose] = useState<string>("not_bent");
  const [panelCondition, setPanelCondition] = useState<string>("no_defect");

  // STEP 5: Tablet Accessories (Multi-select)
  const [accessories, setAccessories] = useState<string[]>([
    "charger",
    "box",
    ...(isStylusCompatible ? ["stylus"] : []),
  ]);

  // STEP 6: Tablet Age (Conditional if underWarranty === true)
  const [tabletAge, setTabletAge] = useState<string>("Below 3 months");

  const totalSteps = underWarranty === true ? 6 : 5;

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

    // Step 1 Deductions
    if (switchesOn === false) addDeduction("Tablet Does Not Switch On", 65);
    if (isLte && networkWorking === false) addDeduction("Cellular Network Faulty", 12);
    if (isLte && simTrayAvailable === false) addDeduction("SIM Tray Missing", 4);
    if (hasGstBill === false) addDeduction("Missing Valid GST Invoice", 6);
    if (underWarranty === false) addDeduction("Out of Warranty", 8);

    // Step 2 Screen Condition
    if (screenScratches === "1_2_scratches") addDeduction("1-2 Screen Scratches", 4);
    if (screenScratches === "more_than_2") addDeduction("Major Screen Scratches", 8);
    if (screenScratches === "cracked_broken") addDeduction("Screen Cracked / Glass Broken", 26);

    if (screenDiscoloration === "minor") addDeduction("Minor Screen Discolouration", 6);
    if (screenDiscoloration === "major") addDeduction("Major Screen Discolouration", 14);

    if (screenSpotsLines === "minor_spots") addDeduction("1-2 White Spots on Screen", 6);
    if (screenSpotsLines === "heavy_spots") addDeduction("3+ Spots / Coloured Spots", 14);
    if (screenSpotsLines === "lines") addDeduction("Lines Visible on Screen", 18);
    if (screenSpotsLines === "light_leaks") addDeduction("Light Leaks Around Edges", 12);

    // Step 3 Functional Problems
    const tabletFuncMap: Record<string, { label: string; pct: number }> = {
      front_cam: { label: "Front Camera Faulty", pct: 8 },
      back_cam: { label: "Back Camera Faulty", pct: 10 },
      cam_glass: { label: "Camera Glass Broken/Missing", pct: 5 },
      finger_touch: { label: "Touch / Finger ID Faulty", pct: 8 },
      face_sensor: { label: "Face Sensor Faulty", pct: 8 },
      wifi: { label: "Wi-Fi Malfunction", pct: 8 },
      gps: { label: "GPS Not Working", pct: 5 },
      bluetooth: { label: "Bluetooth Malfunction", pct: 5 },
      audio_jack: { label: "Audio Jack Faulty", pct: 4 },
      volume_btn: { label: "Volume Button Faulty", pct: 4 },
      power_btn: { label: "Power Button Defective", pct: 5 },
      charging: { label: "Charging Defect", pct: 8 },
      battery: { label: "Battery Faulty / Weak", pct: 12 },
      mic: { label: "Microphone Not Working", pct: 6 },
      speaker: { label: "Speaker Cracked / Faulty", pct: 6 },
    };

    functionalProblems.forEach((pId) => {
      if (tabletFuncMap[pId]) {
        addDeduction(tabletFuncMap[pId].label, tabletFuncMap[pId].pct);
      }
    });

    // Step 4 Tablet Body Defects
    if (bodyScratches === "1_2_scratches") addDeduction("1-2 Body Scratches", 3);
    if (bodyScratches === "more_than_2") addDeduction("Heavy Body Scratches", 6);

    if (bodyDents === "minor_dents") addDeduction("1-2 Minor Dents", 4);
    if (bodyDents === "major_dents") addDeduction("Major Dent(s) / >2 Dents", 8);

    if (bentLoose === "bent") addDeduction("Device Body Bent", 15);
    if (bentLoose === "loose") addDeduction("Loose Display Screen", 10);

    if (panelCondition === "broken") addDeduction("Back Panel Broken / Shattered", 12);

    // Step 5 Accessories
    if (!accessories.includes("charger")) addDeduction("Original Charger Missing", 6);
    if (!accessories.includes("box")) addDeduction("Original Box Missing", 4);
    if (isStylusCompatible && !accessories.includes("stylus")) addDeduction("Original Stylus / Pencil Missing", 7);

    // Step 6 Tablet Age (when underWarranty === true)
    if (underWarranty === true) {
      if (tabletAge === "3 months - 6 months") addDeduction("Tablet Age (3-6 Months)", 3);
      if (tabletAge === "6 months - 11 months") addDeduction("Tablet Age (6-11 Months)", 7);
      if (tabletAge === "Above 11 months") addDeduction("Tablet Age (> 11 Months)", 10);
    }

    const totalDeductionAmount = Math.round((baseP * totalDeductionPct) / 100);
    const calculatedPrice = Math.max(Math.round(baseP * 0.15), Math.max(1800, baseP - totalDeductionAmount));

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
        content_category: "tablet",
        brand: brand.name,
        model: model.name,
        storage: variant.storage,
      }, { eventId: `assess_start_${variant.id}` });
    }
  }, [variant?.id]);

  const isStepValid = () => {
    if (step === 1) {
      if (switchesOn === null || hasGstBill === null || underWarranty === null) return false;
      if (isLte && (networkWorking === null || simTrayAvailable === null)) return false;
      return true;
    }
    return true;
  };

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
    const deviceFullName = formatDeviceName(brand.name, model.name, variant.storage);

    const answersSummary = {
      device: deviceFullName,
      switchesOn,
      networkWorking,
      simTrayAvailable,
      hasGstBill,
      underWarranty,
      screenScratches,
      screenDiscoloration,
      screenSpotsLines,
      functionalProblems,
      bodyScratches,
      bodyDents,
      bentLoose,
      panelCondition,
      accessories,
      tabletAge: underWarranty === true ? tabletAge : "Above 11 months",
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
          { label: "Base Tablet Market Valuation", amount: variant.basePrice },
          { label: "Condition & Hardware Deductions", amount: -totalDeductions },
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
        category: "TABLET",
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
      content_category: "tablet",
      brand: brand.name,
      model: model.name,
      estimated_value: estimatedPrice,
      currency: "INR",
    }, { eventId: `assess_done_${variant.id}` });

    trackMetaCustomEvent("QuoteGenerated", {
      quote_id: quoteNumber,
      content_name: deviceFullName,
      content_category: "tablet",
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
    { title: "Tell us more about your device?", subtitle: "Please answer a few questions about your device." },
    { title: "Tell us more about your device's screen defects?", subtitle: "Select physical condition, discoloration, and display defects" },
    { title: "Functional or Physical Problems", subtitle: "Please choose appropriate condition to get accurate quote" },
    { title: "Tell us more about your device's body defects?", subtitle: "Select body scratches, dents, and panel condition" },
    { title: "Do you have the following?", subtitle: "Please select accessories which are available" },
    { title: "What is your tablet age?", subtitle: "Select your device age as per valid GST invoice" },
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
            <Link href="/sell/tablet" className="hover:text-brand-black">Sell Tablet</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/tablet/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
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

              {/* ── STEP 1: Basic Tablet Checks ── */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <RadioQuestionItem
                    id="q-tab-power"
                    questionNumber={1}
                    question="Does the tablet switch on?"
                    hint="Make sure your tablet turns on and reaches the home screen."
                    options={["Yes", "No"]}
                    selectedValue={switchesOn}
                    onSelect={(val) => setSwitchesOn(val)}
                  />

                  {isLte && (
                    <>
                      <RadioQuestionItem
                        id="q-tab-network"
                        questionNumber={2}
                        question="Is your device's network working properly?"
                        hint="Check cellular calling, SIM data connectivity, and signal reception."
                        options={["Yes", "No"]}
                        selectedValue={networkWorking}
                        onSelect={(val) => setNetworkWorking(val)}
                      />
                      <RadioQuestionItem
                        id="q-tab-simtray"
                        questionNumber={3}
                        question="Is your device's SIM tray available?"
                        hint="Make sure the physical SIM tray is undamaged and present."
                        options={["Yes", "No"]}
                        selectedValue={simTrayAvailable}
                        onSelect={(val) => setSimTrayAvailable(val)}
                      />
                    </>
                  )}

                  <RadioQuestionItem
                    id="q-tab-gst"
                    questionNumber={isLte ? 4 : 2}
                    question="Do you have GST valid bill with the same IMEI?"
                    hint="A valid GST invoice with matching IMEI/Serial is required for warranty claims."
                    options={["Yes", "No"]}
                    selectedValue={hasGstBill}
                    onSelect={(val) => setHasGstBill(val)}
                  />

                  <RadioQuestionItem
                    id="q-tab-warranty"
                    questionNumber={isLte ? 5 : 3}
                    question="Is your device under manufacturer warranty?"
                    hint="Devices within official 1-year brand warranty fetch higher trade-in value."
                    options={["Yes", "No"]}
                    selectedValue={underWarranty}
                    onSelect={(val) => setUnderWarranty(val)}
                  />
                </div>
              )}

              {/* ── STEP 2: Screen Condition (3 Groups) ── */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Physical Scratches / Cracked */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Physical Screen Condition
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <VisualOptionCard
                        id="tab-scr-none"
                        label="No scratches on screen"
                        iconNode={<TabletScreenIllustration variant="no_scratches" />}
                        selected={screenScratches === "no_scratches"}
                        onClick={() => setScreenScratches("no_scratches")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-scr-1-2"
                        label="1-2 scratches on screen"
                        iconNode={<TabletScreenIllustration variant="1_2_scratches" />}
                        selected={screenScratches === "1_2_scratches"}
                        onClick={() => setScreenScratches("1_2_scratches")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-scr-more-2"
                        label="More than 2 scratches on screen"
                        iconNode={<TabletScreenIllustration variant="more_than_2" />}
                        selected={screenScratches === "more_than_2"}
                        onClick={() => setScreenScratches("more_than_2")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-scr-cracked"
                        label="Screen cracked/ glass broken"
                        iconNode={<TabletScreenIllustration variant="cracked_broken" />}
                        selected={screenScratches === "cracked_broken"}
                        onClick={() => setScreenScratches("cracked_broken")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Discoloration */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Discoloration on Screen
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="tab-disc-none"
                        label="No Discoloration"
                        iconNode={<TabletScreenIllustration variant="no_discoloration" />}
                        selected={screenDiscoloration === "no_discoloration"}
                        onClick={() => setScreenDiscoloration("no_discoloration")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-disc-minor"
                        label="Minor Discoloration"
                        iconNode={<TabletScreenIllustration variant="minor_discoloration" />}
                        selected={screenDiscoloration === "minor"}
                        onClick={() => setScreenDiscoloration("minor")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-disc-major"
                        label="Major Discoloration"
                        iconNode={<TabletScreenIllustration variant="major_discoloration" />}
                        selected={screenDiscoloration === "major"}
                        onClick={() => setScreenDiscoloration("major")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Spots & Lines */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Spots & Lines on Display
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <VisualOptionCard
                        id="tab-spot-none"
                        label="No Spot On Screen"
                        iconNode={<TabletScreenIllustration variant="no_spots" />}
                        selected={screenSpotsLines === "no_spots"}
                        onClick={() => setScreenSpotsLines("no_spots")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-spot-1-2"
                        label="1-2 very small white spots"
                        iconNode={<TabletScreenIllustration variant="minor_spots" />}
                        selected={screenSpotsLines === "minor_spots"}
                        onClick={() => setScreenSpotsLines("minor_spots")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-spot-3-more"
                        label="3 or more white spots / colored spots"
                        iconNode={<TabletScreenIllustration variant="heavy_spots" />}
                        selected={screenSpotsLines === "heavy_spots"}
                        onClick={() => setScreenSpotsLines("heavy_spots")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-lines"
                        label="Lines visible on screen"
                        iconNode={<TabletScreenIllustration variant="lines" />}
                        selected={screenSpotsLines === "lines"}
                        onClick={() => setScreenSpotsLines("lines")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-light-leaks"
                        label="Light leaks around edges of display"
                        iconNode={<TabletScreenIllustration variant="light_leaks" />}
                        selected={screenSpotsLines === "light_leaks"}
                        onClick={() => setScreenSpotsLines("light_leaks")}
                        multiSelect={false}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Tablet Functional Problems (15 Visual Cards) ── */}
              {step === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <VisualOptionCard
                      id="tab-prob-front-cam"
                      label="Front Camera not working"
                      iconNode={<TabletHardwareIllustration variant="front_cam" />}
                      selected={functionalProblems.includes("front_cam")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "front_cam"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-back-cam"
                      label="Back Camera not working"
                      iconNode={<TabletHardwareIllustration variant="back_cam" />}
                      selected={functionalProblems.includes("back_cam")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "back_cam"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-cam-glass"
                      label="Camera Glass Broken/Missing"
                      iconNode={<TabletHardwareIllustration variant="cam_glass" />}
                      selected={functionalProblems.includes("cam_glass")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "cam_glass"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-finger"
                      label="Finger/Touch ID Sensor not working"
                      iconNode={<TabletHardwareIllustration variant="finger_touch" />}
                      selected={functionalProblems.includes("finger_touch")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "finger_touch"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-face"
                      label="Face Sensor not working"
                      iconNode={<TabletHardwareIllustration variant="face_sensor" />}
                      selected={functionalProblems.includes("face_sensor")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "face_sensor"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-wifi"
                      label="Wifi not working"
                      iconNode={<TabletHardwareIllustration variant="wifi" />}
                      selected={functionalProblems.includes("wifi")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "wifi"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-gps"
                      label="GPS not working"
                      iconNode={<TabletHardwareIllustration variant="gps" />}
                      selected={functionalProblems.includes("gps")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "gps"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-bt"
                      label="Bluetooth not working"
                      iconNode={<TabletHardwareIllustration variant="bluetooth" />}
                      selected={functionalProblems.includes("bluetooth")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "bluetooth"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-jack"
                      label="Audio Jack not Working"
                      iconNode={<TabletHardwareIllustration variant="audio_jack" />}
                      selected={functionalProblems.includes("audio_jack")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "audio_jack"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-vol"
                      label="Volume Button Missing / Not Working"
                      iconNode={<TabletHardwareIllustration variant="volume_btn" />}
                      selected={functionalProblems.includes("volume_btn")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "volume_btn"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-power"
                      label="Power Button Broken/ Not working / Missing"
                      iconNode={<TabletHardwareIllustration variant="power_btn" />}
                      selected={functionalProblems.includes("power_btn")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "power_btn"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-charging"
                      label="Charging Defect; unable to charge"
                      iconNode={<TabletHardwareIllustration variant="charging" />}
                      selected={functionalProblems.includes("charging")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "charging"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-battery"
                      label="Battery Faulty or not working"
                      iconNode={<TabletHardwareIllustration variant="battery" />}
                      selected={functionalProblems.includes("battery")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "battery"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-mic"
                      label="Microphone not working"
                      iconNode={<TabletHardwareIllustration variant="microphone" />}
                      selected={functionalProblems.includes("mic")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "mic"))}
                    />
                    <VisualOptionCard
                      id="tab-prob-spk"
                      label="Speaker not working; faulty Or cracked sound"
                      iconNode={<TabletHardwareIllustration variant="speaker" />}
                      selected={functionalProblems.includes("speaker")}
                      onClick={() => setFunctionalProblems(toggleArrayItem(functionalProblems, "speaker"))}
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

              {/* ── STEP 4: Tablet Body Defects (4 Groups) ── */}
              {step === 4 && (
                <div className="space-y-6">
                  {/* Scratches */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Body Scratches
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="tab-body-no-scr"
                        label="No scratches"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Minor_Body_1.png"
                        selected={bodyScratches === "no_scratches"}
                        onClick={() => setBodyScratches("no_scratches")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-body-1-2-scr"
                        label="1-2 scratches"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/1-2_Minor_scratch_body.png"
                        selected={bodyScratches === "1_2_scratches"}
                        onClick={() => setBodyScratches("1_2_scratches")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-body-more-2-scr"
                        label="More than 2 scratches"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Heavy_scratch-body.png"
                        selected={bodyScratches === "more_than_2"}
                        onClick={() => setBodyScratches("more_than_2")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Dents */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Body Dents
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="tab-dent-none"
                        label="No dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Dents_on_top_panel.png"
                        selected={bodyDents === "no_dents"}
                        onClick={() => setBodyDents("no_dents")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-dent-1-2"
                        label="1-2 minor dents"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/1_Minor_Dent_1.png"
                        selected={bodyDents === "minor_dents"}
                        onClick={() => setBodyDents("minor_dents")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-dent-major"
                        label="Major dent(s) or more than 2"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Major_Dents_1.png"
                        selected={bodyDents === "major_dents"}
                        onClick={() => setBodyDents("major_dents")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Bent / Loose Screen */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Device Bent / Loose Screen
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <VisualOptionCard
                        id="tab-bent-none"
                        label="Not bent or loose screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Cracked_or_Loose_Panel.png"
                        selected={bentLoose === "not_bent"}
                        onClick={() => setBentLoose("not_bent")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-bent-body"
                        label="Body Bent"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Crack-Damage_Panel.png"
                        selected={bentLoose === "bent"}
                        onClick={() => setBentLoose("bent")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-loose-screen"
                        label="Loose Screen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Loose_Panel.png"
                        selected={bentLoose === "loose"}
                        onClick={() => setBentLoose("loose")}
                        multiSelect={false}
                      />
                    </div>
                  </div>

                  {/* Panel Condition */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-subtleCard space-y-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                      Side / Back Panel Condition
                    </h3>
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      <VisualOptionCard
                        id="tab-panel-nodefect"
                        label="No Defect in Panel"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/No_Cracked_or_Loose_Panel.png"
                        selected={panelCondition === "no_defect"}
                        onClick={() => setPanelCondition("no_defect")}
                        multiSelect={false}
                      />
                      <VisualOptionCard
                        id="tab-panel-broken"
                        label="Back panel broken/shattered"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Crack-Damage_Panel.png"
                        selected={panelCondition === "broken"}
                        onClick={() => setPanelCondition("broken")}
                        multiSelect={false}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Tablet Accessories ── */}
              {step === 5 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${isStylusCompatible ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
                    <VisualOptionCard
                      id="tab-acc-charger"
                      label="Charger Available"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Charger_Available.png"
                      selected={accessories.includes("charger")}
                      onClick={() => setAccessories(toggleArrayItem(accessories, "charger"))}
                      sublabel="Original charging brick and cable"
                    />
                    <VisualOptionCard
                      id="tab-acc-box"
                      label="Box with same IMEI"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Box_Available.png"
                      selected={accessories.includes("box")}
                      onClick={() => setAccessories(toggleArrayItem(accessories, "box"))}
                      sublabel="Retail packaging with matching serial/IMEI"
                    />
                    {isStylusCompatible && (
                      <VisualOptionCard
                        id="tab-acc-stylus"
                        label="Original Stylus / S Pen / Apple Pencil"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/6023a3a6f00e2.png"
                        selected={accessories.includes("stylus")}
                        onClick={() => setAccessories(toggleArrayItem(accessories, "stylus"))}
                        sublabel="Functional official pencil or stylus"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 6: Tablet Age (Conditional if underWarranty === true) ── */}
              {step === 6 && underWarranty === true && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <RadioQuestionItem
                    id="q-tab-age"
                    questionNumber={1}
                    question="What is your tablet age?"
                    hint="A valid GST invoice with matching serial number/IMEI is required for devices under warranty."
                    options={[
                      "Below 3 months",
                      "3 months - 6 months",
                      "6 months - 11 months",
                      "Above 11 months",
                    ]}
                    selectedValue={tabletAge}
                    onSelect={(val) => setTabletAge(val)}
                  />
                </div>
              )}
            </div>

            {/* LIVE VALUATION SIDEBAR (RIGHT 4 COLS) */}
            <div className="lg:col-span-4">
              <AssessmentSidebar
                deviceName={formatDeviceName(brand.name, model.name, variant.storage)}
                deviceImageUrl={model.imageUrl}
                storageOrSpecs={variant.storage}
                basePrice={variant.basePrice}
                estimatedPrice={estimatedPrice}
                onNext={handleNext}
                nextButtonText={step === totalSteps ? "Get Exact Value" : "Continue"}
                isNextDisabled={!isStepValid()}
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
        deviceName={formatDeviceName(brand.name, model.name, variant.storage)}
        deviceImageUrl={model.imageUrl}
        storage={variant.storage}
      />

      <Footer />
    </div>
  );
}
