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

export default function MobileAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "iphone-15";
  const variantIdParam = searchParams.get("variantId") || "";

  const brand = INITIAL_BRANDS.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase()) || {
    id: `b-${brandSlug}`,
    name: brandSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    slug: brandSlug,
    category: "MOBILE",
    active: true,
  };

  const cleanModelSlug = modelSlug.toLowerCase();
  const model = INITIAL_MODELS.find(
    (m) =>
      m.slug.toLowerCase() === cleanModelSlug ||
      m.slug.toLowerCase() === `${brandSlug.toLowerCase()}-${cleanModelSlug}` ||
      m.slug.toLowerCase().replace(`${brandSlug.toLowerCase()}-`, "") === cleanModelSlug.replace(`${brandSlug.toLowerCase()}-`, "") ||
      m.slug.toLowerCase().replace("note-", "") === cleanModelSlug.replace("note-", "") ||
      m.name.toLowerCase().replace(/\s+/g, "-") === cleanModelSlug
  ) || {
    id: `m-${modelSlug}`,
    brandId: brand.id,
    brandSlug: brand.slug,
    name: modelSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    slug: modelSlug,
    imageUrl: `https://s3ng.cashify.in/cashify/product/img/xhdpi/${modelSlug}.jpg`,
    releaseYear: 2024,
    popular: true,
    active: true,
    contactForPrice: false,
    category: "MOBILE",
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
            id: `v-${model.slug}-128`,
            modelId: model.id,
            storage: "128 GB",
            basePrice: modelSlug.includes("10a") ? 28000 : (modelSlug.includes("15") ? 52000 : 25000),
            active: true,
          };
        }
      }

      setActiveVariant(foundVar);
    }
  }, [variantIdParam, model.id, model.slug, resolvedVariant]);

  const variant = activeVariant || {
    id: `v-${model.slug}-128`,
    modelId: model.id,
    storage: "128 GB",
    basePrice: modelSlug.includes("10a") ? 28000 : 25000,
    active: true,
  };

  const isApple = brand.slug.toLowerCase().includes("apple") || model.name.toLowerCase().includes("iphone");
  const isSamsungNoteOrUltra =
    brand.slug.toLowerCase().includes("samsung") &&
    (model.name.toLowerCase().includes("note") || model.name.toLowerCase().includes("ultra"));

  // ── WIZARD STATE ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<number>(1);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // STEP 1: Basic Functionality Check
  const [canMakeCalls, setCanMakeCalls] = useState<boolean | null>(null);
  const [touchScreenWorking, setTouchScreenWorking] = useState<boolean | null>(null);
  const [isScreenOriginal, setIsScreenOriginal] = useState<boolean | null>(null);
  const [underWarranty, setUnderWarranty] = useState<boolean | null>(null);
  const [hasGstBill, setHasGstBill] = useState<boolean | null>(null);

  // STEP 2: Screen & Body Defects (Multi-select)
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);

  // STEP 3: Functional or Physical Problems (Multi-select)
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  // STEP 4: Accessories (Multi-select)
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([
    "box",
    "charger",
    ...(isSamsungNoteOrUltra ? ["spen"] : []),
  ]);

  // STEP 5: Mobile Age (Conditional when underWarranty === true)
  const [mobileAge, setMobileAge] = useState<string>("Below 3 months");

  const totalSteps = underWarranty === true ? 5 : 4;

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
    if (canMakeCalls === false) {
      addDeduction("Calling / Network Faulty", 18);
    }
    if (touchScreenWorking === false) {
      addDeduction("Touch Screen Defective", 22);
    }
    if (isScreenOriginal === false) {
      addDeduction("Screen Replaced (Non-Original)", 18);
    }
    if (underWarranty === false) {
      addDeduction("Out of Warranty", 8);
    }
    if (underWarranty === true && hasGstBill === false) {
      addDeduction("Missing Valid GST Invoice", 6);
    }

    // Step 2 Screen & Body Defects
    if (selectedDefects.includes("broken_screen")) {
      addDeduction("Broken / Scratched Screen", 22);
    }
    if (selectedDefects.includes("dead_spot_lines")) {
      addDeduction("Dead Spots / Screen Lines", 28);
    }
    if (selectedDefects.includes("body_dent_scratch")) {
      addDeduction("Body Dents / Scratches", 8);
    }
    if (selectedDefects.includes("panel_missing")) {
      addDeduction("Device Panel Missing / Broken", 14);
    }

    // Step 3 Functional Problems
    const functionalDeductionMap: Record<string, { label: string; pct: number }> = {
      front_camera: { label: "Front Camera Faulty", pct: 8 },
      back_camera: { label: "Back Camera Faulty", pct: 10 },
      volume_button: { label: "Volume Button Issue", pct: 4 },
      finger_touch: { label: "Fingerprint Sensor Issue", pct: 8 },
      wifi: { label: "Wi-Fi Malfunction", pct: 8 },
      speaker: { label: "Speaker Cracked/Faulty", pct: 6 },
      silent_button: { label: "Silent Switch Defect", pct: 4 },
      face_sensor: { label: "Face ID / Sensor Issue", pct: 8 },
      power_button: { label: "Power Button Faulty", pct: 5 },
      charging_port: { label: "Charging Port Faulty", pct: 7 },
      audio_receiver: { label: "Audio Receiver Issue", pct: 4 },
      camera_glass: { label: "Camera Glass Broken", pct: 5 },
      microphone: { label: "Microphone Faulty", pct: 6 },
      bluetooth: { label: "Bluetooth Issue", pct: 5 },
      vibrator: { label: "Vibrator Not Working", pct: 4 },
      proximity_sensor: { label: "Proximity Sensor Issue", pct: 4 },
      battery_service: { label: "Battery Health < 80%", pct: 12 },
      esim_issue: { label: "e-SIM / Cellular Not Working", pct: 6 },
    };

    selectedProblems.forEach((probId) => {
      const item = functionalDeductionMap[probId];
      if (item) {
        addDeduction(item.label, item.pct);
      }
    });

    // Step 4 Accessories
    if (!selectedAccessories.includes("box")) {
      addDeduction("Original Box Missing", 4);
    }
    if (!selectedAccessories.includes("charger")) {
      addDeduction("Original Charger Missing", 5);
    }
    if (isSamsungNoteOrUltra && !selectedAccessories.includes("spen")) {
      addDeduction("Original S Pen Missing", 6);
    }

    // Step 5 Mobile Age (when underWarranty === true)
    if (underWarranty === true) {
      if (mobileAge === "3 months - 6 months") addDeduction("Device Age (3-6 Months)", 3);
      if (mobileAge === "6 months - 11 months") addDeduction("Device Age (6-11 Months)", 7);
      if (mobileAge === "Above 11 months") addDeduction("Device Age (> 11 Months)", 10);
    }

    // Market minimum floor: at least 15% of base price or ₹1,500
    const totalDeductionAmount = Math.round((baseP * totalDeductionPct) / 100);
    const calculatedPrice = Math.max(Math.round(baseP * 0.15), Math.max(1500, baseP - totalDeductionAmount));

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
        content_category: "mobile",
        brand: brand.name,
        model: model.name,
        storage: variant.storage,
      }, { eventId: `assess_start_${variant.id}` });
    }
  }, [variant?.id]);

  // Check if current step can proceed
  const isStepValid = () => {
    if (step === 1) {
      if (canMakeCalls === null || touchScreenWorking === null || isScreenOriginal === null || underWarranty === null) {
        return false;
      }
      if (underWarranty === true && hasGstBill === null) {
        return false;
      }
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
      canMakeCalls,
      touchScreenWorking,
      isScreenOriginal,
      underWarranty,
      hasGstBill,
      selectedDefects,
      selectedProblems,
      selectedAccessories,
      mobileAge: underWarranty === true ? mobileAge : "Above 11 months",
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
          { label: "Base Device Market Valuation", amount: variant.basePrice },
          { label: "Defects & Condition Deductions", amount: -totalDeductions },
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
        category: "MOBILE",
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
      content_category: "mobile",
      brand: brand.name,
      model: model.name,
      estimated_value: estimatedPrice,
      currency: "INR",
    }, { eventId: `assess_done_${variant.id}` });

    trackMetaCustomEvent("QuoteGenerated", {
      quote_id: quoteNumber,
      content_name: deviceFullName,
      content_category: "mobile",
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

  // STEP TITLES
  const stepTitles = [
    { title: "Tell us more about your device?", subtitle: "Please answer a few questions about your device." },
    { title: "Select screen/body defects that are applicable!", subtitle: "Please provide correct details" },
    { title: "Functional or Physical Problems", subtitle: "Please choose appropriate condition to get accurate quote" },
    { title: "Do you have the following?", subtitle: "Please select accessories which are available" },
    { title: "What is your mobile age?", subtitle: "Select your device age as per valid GST invoice" },
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
            <Link href="/sell/mobile" className="hover:text-brand-black">Sell Mobile</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/mobile/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
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

              {/* ── STEP 1: Basic Device Functionality Check ── */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <RadioQuestionItem
                    id="q-calls"
                    questionNumber={1}
                    question="Are you able to make and receive calls?"
                    hint="Check your device for cellular network connectivity issues."
                    options={["Yes", "No"]}
                    selectedValue={canMakeCalls}
                    onSelect={(val) => setCanMakeCalls(val)}
                  />

                  <RadioQuestionItem
                    id="q-touch"
                    questionNumber={2}
                    question="Is your device's touch screen working properly?"
                    hint="Check the touch screen functionality of your phone."
                    options={["Yes", "No"]}
                    selectedValue={touchScreenWorking}
                    onSelect={(val) => setTouchScreenWorking(val)}
                  />

                  <RadioQuestionItem
                    id="q-screen-orig"
                    questionNumber={3}
                    question="Is your phone's screen original?"
                    hint="Pick 'Yes' if screen was never changed or was changed by Authorized Service Center. Pick 'No' if screen was changed at local shop."
                    options={["Yes", "No"]}
                    selectedValue={isScreenOriginal}
                    onSelect={(val) => setIsScreenOriginal(val)}
                  />

                  <RadioQuestionItem
                    id="q-warranty"
                    questionNumber={4}
                    question="Is your device under manufacturer warranty?"
                    hint="You can get a better price for your device if it's under manufacturer warranty with a GST valid bill."
                    options={["Yes", "No"]}
                    selectedValue={underWarranty}
                    onSelect={(val) => setUnderWarranty(val)}
                  />

                  {underWarranty === true && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <RadioQuestionItem
                        id="q-gst-bill"
                        questionNumber={5}
                        question="Do you have GST valid bill with the same IMEI?"
                        hint="Make sure your bill has device IMEI mentioned on it."
                        options={["Yes", "No"]}
                        selectedValue={hasGstBill}
                        onSelect={(val) => setHasGstBill(val)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: Screen & Body Defects (Visual Cards Multi-select) ── */}
              {step === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <VisualOptionCard
                      id="defect-screen-broken"
                      label="Broken/scratch on device screen"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/62a31a9a6c17e.png"
                      selected={selectedDefects.includes("broken_screen")}
                      onClick={() => setSelectedDefects(toggleArrayItem(selectedDefects, "broken_screen"))}
                    />
                    <VisualOptionCard
                      id="defect-dead-spot"
                      label="Dead Spot/Visible line and Discoloration on screen"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/62a31ad88c473.png"
                      selected={selectedDefects.includes("dead_spot_lines")}
                      onClick={() => setSelectedDefects(toggleArrayItem(selectedDefects, "dead_spot_lines"))}
                    />
                    <VisualOptionCard
                      id="defect-body-dent"
                      label="Scratch/Dent on device body"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/62a31b0b3b18d.png"
                      selected={selectedDefects.includes("body_dent_scratch")}
                      onClick={() => setSelectedDefects(toggleArrayItem(selectedDefects, "body_dent_scratch"))}
                    />
                    <VisualOptionCard
                      id="defect-panel-broken"
                      label="Device panel missing/broken"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/62a87a14b538f.png"
                      selected={selectedDefects.includes("panel_missing")}
                      onClick={() => setSelectedDefects(toggleArrayItem(selectedDefects, "panel_missing"))}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {selectedDefects.length === 0 ? "No defects selected (Flawless condition)" : `${selectedDefects.length} defect(s) selected`}
                    </p>
                    {selectedDefects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedDefects([])}
                        className="text-xs font-bold text-gray-500 hover:text-red-600 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Functional or Physical Problems (18 Visual Cards) ── */}
              {step === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <VisualOptionCard
                      id="prob-front-cam"
                      label="Front Camera not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d2440e1d4b31.jpg"
                      selected={selectedProblems.includes("front_camera")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "front_camera"))}
                    />
                    <VisualOptionCard
                      id="prob-back-cam"
                      label="Back Camera not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d2441a16cca9.jpg"
                      selected={selectedProblems.includes("back_camera")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "back_camera"))}
                    />
                    <VisualOptionCard
                      id="prob-vol-button"
                      label="Volume Button not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d2443731c3db.jpg"
                      selected={selectedProblems.includes("volume_button")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "volume_button"))}
                    />
                    <VisualOptionCard
                      id="prob-finger-touch"
                      label="Finger Touch not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d2444092bce8.jpg"
                      selected={selectedProblems.includes("finger_touch")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "finger_touch"))}
                    />
                    <VisualOptionCard
                      id="prob-wifi"
                      label="WiFi not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d2442d22fa49.jpg"
                      selected={selectedProblems.includes("wifi")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "wifi"))}
                    />
                    <VisualOptionCard
                      id="prob-speaker"
                      label="Speaker Faulty"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d244674ced62.jpg"
                      selected={selectedProblems.includes("speaker")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "speaker"))}
                    />
                    <VisualOptionCard
                      id="prob-silent-button"
                      label="Silent Button not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5df0e69829e5c.png"
                      selected={selectedProblems.includes("silent_button")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "silent_button"))}
                    />
                    <VisualOptionCard
                      id="prob-face-sensor"
                      label="Face Sensor not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d2448e9ec9d0.jpg"
                      selected={selectedProblems.includes("face_sensor")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "face_sensor"))}
                    />
                    <VisualOptionCard
                      id="prob-power-button"
                      label="Power Button not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d244762197f4.jpg"
                      selected={selectedProblems.includes("power_button")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "power_button"))}
                    />
                    <VisualOptionCard
                      id="prob-charging-port"
                      label="Charging Port not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d24486306b57.jpg"
                      selected={selectedProblems.includes("charging_port")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "charging_port"))}
                    />
                    <VisualOptionCard
                      id="prob-audio-receiver"
                      label="Audio Receiver not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5dfb2607b7889.png"
                      selected={selectedProblems.includes("audio_receiver")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "audio_receiver"))}
                    />
                    <VisualOptionCard
                      id="prob-camera-glass"
                      label="Camera Glass Broken"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5f868584a1a09.png"
                      selected={selectedProblems.includes("camera_glass")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "camera_glass"))}
                    />
                    <VisualOptionCard
                      id="prob-mic"
                      label="Microphone not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/6023a3ef18975.png"
                      selected={selectedProblems.includes("microphone")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "microphone"))}
                    />
                    <VisualOptionCard
                      id="prob-bluetooth"
                      label="Bluetooth not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/6023a363ad07d.png"
                      selected={selectedProblems.includes("bluetooth")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "bluetooth"))}
                    />
                    <VisualOptionCard
                      id="prob-vibrator"
                      label="Vibrator is not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/6023a3a6f00e2.png"
                      selected={selectedProblems.includes("vibrator")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "vibrator"))}
                    />
                    <VisualOptionCard
                      id="prob-prox-sensor"
                      label="Proximity Sensor not working"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/6023a5bda784d.png"
                      selected={selectedProblems.includes("proximity_sensor")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "proximity_sensor"))}
                    />
                    <VisualOptionCard
                      id="prob-bat-service"
                      label="Battery in Service (Health is less than 80%)"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d244621b86f8.jpg"
                      selected={selectedProblems.includes("battery_service")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "battery_service"))}
                    />
                    <VisualOptionCard
                      id="prob-esim"
                      label="e-SIM / Cellular Not Working"
                      imageUrl="https://s3n.cashify.in/cashify/productLinePartVariation/img/xhdpi/SIM_card_tray_broken_missing.png"
                      selected={selectedProblems.includes("esim_issue")}
                      onClick={() => setSelectedProblems(toggleArrayItem(selectedProblems, "esim_issue"))}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {selectedProblems.length === 0 ? "No hardware issues selected" : `${selectedProblems.length} problem(s) reported`}
                    </p>
                    {selectedProblems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProblems([])}
                        className="text-xs font-bold text-gray-500 hover:text-red-600 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 4: Accessories (Multi-select) ── */}
              {step === 4 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSamsungNoteOrUltra ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
                    <VisualOptionCard
                      id="acc-box"
                      label="Original Box with same IMEI"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/5d244b6c82230.jpg"
                      selected={selectedAccessories.includes("box")}
                      onClick={() => setSelectedAccessories(toggleArrayItem(selectedAccessories, "box"))}
                      sublabel="Original retail packaging with matching IMEI barcode"
                    />
                    <VisualOptionCard
                      id="acc-charger"
                      label="Original Charger of Device"
                      imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/Charger_Available.png"
                      selected={selectedAccessories.includes("charger")}
                      onClick={() => setSelectedAccessories(toggleArrayItem(selectedAccessories, "charger"))}
                      sublabel="Working original power adapter & cable"
                    />
                    {isSamsungNoteOrUltra && (
                      <VisualOptionCard
                        id="acc-spen"
                        label="Original S Pen"
                        imageUrl="https://s3ng.cashify.in/cashify/productLinePartVariation/img/xhdpi/6023a3a6f00e2.png"
                        selected={selectedAccessories.includes("spen")}
                        onClick={() => setSelectedAccessories(toggleArrayItem(selectedAccessories, "spen"))}
                        sublabel="Official Samsung stylus pen in working condition"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 5: Mobile Age (Conditional: If Warranty = Yes) ── */}
              {step === 5 && underWarranty === true && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-subtleCard space-y-4">
                  <RadioQuestionItem
                    id="q-mobile-age"
                    questionNumber={1}
                    question="What is your mobile age?"
                    hint="A valid GST invoice with matching IMEI is mandatory for devices under manufacturer warranty."
                    options={[
                      "Below 3 months",
                      "3 months - 6 months",
                      "6 months - 11 months",
                      "Above 11 months",
                    ]}
                    selectedValue={mobileAge}
                    onSelect={(val) => setMobileAge(val)}
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
