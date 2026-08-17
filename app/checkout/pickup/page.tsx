"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { INITIAL_SERVICE_AREAS, OrderData, QuoteData, INITIAL_VARIANTS, INITIAL_MODELS, INITIAL_BRANDS } from "@/lib/store";
import {
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

function PickupCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = searchParams.get("quoteId") || "quote-demo";

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [pincode, setPincode] = useState("");
  const [serviceStatus, setServiceStatus] = useState<"IDLE" | "AVAILABLE" | "UNAVAILABLE">("IDLE");
  const [selectedState, setSelectedState] = useState("West Bengal");
  const [resolvedDeviceName, setResolvedDeviceName] = useState("");

  // Address fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");

  // Pickup slot
  const [pickupDate, setPickupDate] = useState("Tomorrow");
  const [pickupSlot, setPickupSlot] = useState("10 AM - 1 PM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("cashall_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setFullName(u.name || "");
          setPhone(u.phone || "");
        } catch (e) {
          console.error(e);
        }
      }

      const storedQuote = localStorage.getItem(`cashall_quote_${quoteId}`) || localStorage.getItem("cashall_latest_quote");
      if (storedQuote) {
        try {
          setQuote(JSON.parse(storedQuote));
        } catch (e) {
          console.error(e);
        }
      }

      // Pre-load current variant for device name resolution
      const storedVariant = localStorage.getItem("cashall_current_variant");
      if (storedVariant) {
        try {
          const sv = JSON.parse(storedVariant);
          if (sv?.modelName && sv?.brandName) {
            const varName = sv.storage ? `${sv.brandName} ${sv.modelName} (${sv.storage})` : `${sv.brandName} ${sv.modelName}`;
            setResolvedDeviceName(varName);
          }
        } catch (e) {}
      }
    }
  }, [quoteId]);

  const checkPincode = () => {
    const match = INITIAL_SERVICE_AREAS.find((s) => s.pincode === pincode.trim() && s.active);
    if (match) {
      setServiceStatus("AVAILABLE");
      setSelectedState(match.state);
    } else if (pincode.trim().length === 6) {
      setServiceStatus("AVAILABLE");
      setSelectedState("West Bengal");
    } else {
      setServiceStatus("UNAVAILABLE");
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory PIN code
    if (!pincode.trim() || pincode.trim().length !== 6) {
      alert("Please enter a valid 6-digit PIN code for pickup.");
      return;
    }

    // Validate phone — critical for cross-device sync
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    const finalName = fullName.trim() || "Customer";
    const finalPhone = cleanPhone; // Always use digits-only for DB storage
    const finalHouse = house.trim() || "Customer Address";
    const finalStreet = street.trim() || finalHouse;
    const finalArea = area.trim() || "West Bengal";
    const fullAddress = `${finalHouse}, ${finalStreet}, ${finalArea}${landmark ? ", " + landmark.trim() : ""}, ${selectedState} - ${pincode}`;

    // Resolve device name: priority order:
    // 1. resolvedDeviceName from cashall_current_variant (most accurate)
    // 2. quote.breakdownJson.deviceName (saved during assessment)
    // 3. Never use INITIAL_VARIANTS fallback (can be wrong model)
    let fullDeviceName = resolvedDeviceName;
    if (!fullDeviceName && quote?.breakdownJson) {
      try {
        const bd = JSON.parse(quote.breakdownJson);
        if (bd.deviceName) fullDeviceName = bd.deviceName;
      } catch {}
    }
    if (!fullDeviceName) fullDeviceName = "Customer Mobile Device";

    let createdOrderNum = "";
    let apiSuccess = false;

    // Try up to 2 times to reach the server
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch("/api/v1/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteId: quote?.id || quoteId,
            fullName: finalName,
            phone: finalPhone,
            house: finalHouse,
            street: finalStreet,
            area: finalArea,
            landmark,
            city: "Kolkata",
            state: selectedState,
            pincode,
            pickupDate,
            pickupTimeSlot: pickupSlot,
            deviceName: fullDeviceName,
            estimatedPrice: quote?.estimatedPrice || 32500,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.orderNumber) {
            createdOrderNum = json.data.orderNumber;
            apiSuccess = true;
            break; // Success — stop retrying
          }
        } else {
          console.warn(`Order API attempt ${attempt} failed: HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`Order API attempt ${attempt} error:`, err);
      }
      // Wait 1s before retry
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000));
    }

    // If API failed after retries, halt and inform user instead of generating fake local order
    if (!apiSuccess) {
      setIsSubmitting(false);
      alert("Could not connect to CashALL server. Please check your connection and try again.");
      return;
    }

    const newOrder: OrderData = {
      id: `ord-${Date.now()}`,
      orderNumber: createdOrderNum,
      quoteId: quote?.id || quoteId,
      userId: `u-${finalPhone}`,
      customerName: finalName,
      customerPhone: finalPhone,
      deviceName: fullDeviceName,   // Always store device name
      pincode,
      addressSummary: fullAddress,
      pickupDate,
      pickupTimeSlot: pickupSlot,
      status: "PICKUP_SCHEDULED",
      revisedPrice: quote?.estimatedPrice,
      estimatedPrice: quote?.estimatedPrice,
      declaredConditionSummary: fullDeviceName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_order_${createdOrderNum}`, JSON.stringify(newOrder));
      localStorage.setItem("cashall_latest_order", JSON.stringify(newOrder));

      const existing = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
      localStorage.setItem("cashall_all_orders", JSON.stringify([newOrder, ...existing]));

      // Save user session details
      localStorage.setItem("cashall_user", JSON.stringify({
        id: newOrder.userId,
        name: finalName,
        phone: finalPhone,
      }));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/order/${createdOrderNum}`);
    }, 600);
  };

  // Resolve display device name for sidebar - read from stored data, never fall back to INITIAL_VARIANTS[0]
  const sidebarDeviceName = (() => {
    if (resolvedDeviceName) return resolvedDeviceName;
    if (quote?.breakdownJson) {
      try {
        const bd = JSON.parse(quote.breakdownJson);
        if (bd.deviceName) return bd.deviceName;
      } catch {}
    }
    // Only use INITIAL_VARIANTS if variantId actually matches
    const matchedVariant = INITIAL_VARIANTS.find((v) => v.id === quote?.variantId);
    if (matchedVariant) {
      const matchedModel = INITIAL_MODELS.find((m) => m.id === matchedVariant.modelId);
      const matchedBrand = matchedModel ? INITIAL_BRANDS.find((b) => b.id === matchedModel.brandId) : null;
      if (matchedModel && matchedBrand) return `${matchedBrand.name} ${matchedModel.name} (${matchedVariant.storage})`;
    }
    return "Your Device";
  })();
  const sidebarStorage = (() => {
    if (resolvedDeviceName) return "";
    const matchedVariant = INITIAL_VARIANTS.find((v) => v.id === quote?.variantId);
    return matchedVariant?.storage || "128 GB";
  })();
  const sidebarImageUrl = (() => {
    const matchedVariant = INITIAL_VARIANTS.find((v) => v.id === quote?.variantId);
    if (matchedVariant) {
      const matchedModel = INITIAL_MODELS.find((m) => m.id === matchedVariant.modelId);
      return matchedModel?.imageUrl || null;
    }
    return null;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-3xl font-black text-brand-black">
              Schedule Fast Doorstep Pickup
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Complete your pickup address and select a convenient time slot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* ORDER FORM */}
            <form onSubmit={handleConfirmOrder} className="md:col-span-8 space-y-6">
              
              {/* STEP 1: SERVICEABILITY PIN CHECK */}
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MapPin className="w-5 h-5 text-brand-yellow shrink-0" />
                  <h2 className="text-base font-bold text-brand-black">1. Pickup PIN Code & Serviceability <span className="text-red-500">*</span></h2>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code *"
                    className="w-48 px-3.5 py-2 text-xs font-bold bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                  />
                  <button
                    type="button"
                    onClick={checkPincode}
                    className="px-4 py-2 bg-brand-black text-white text-xs font-bold rounded-xl hover:bg-brand-dark"
                  >
                    Check Area
                  </button>
                </div>

                {serviceStatus === "AVAILABLE" && (
                  <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-xs text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Fast Doorstep Pickup is <strong>Available</strong> in {selectedState} ({pincode}).</span>
                  </div>
                )}

                {serviceStatus === "UNAVAILABLE" && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>CashALL isn&apos;t available in PIN code {pincode} yet.</span>
                  </div>
                )}
              </div>

              {/* STEP 2: ADDRESS DETAILS */}
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Building className="w-5 h-5 text-brand-yellow shrink-0" />
                  <h2 className="text-base font-bold text-brand-black">2. Pickup Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Customer Name"
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-Digit Mobile"
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">
                      House / Flat / Building <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Heights"
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">
                      Street / Road <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. MG Road, Sector 15"
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">
                      Area / Locality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Shibpur / Kings Road"
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">
                      Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Metro Station"
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: PICKUP SLOT */}
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="w-5 h-5 text-brand-yellow shrink-0" />
                  <h2 className="text-base font-bold text-brand-black">3. Pickup Date & Time Slot</h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-black mb-2">Select Date</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Today", "Tomorrow", "Day After"].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setPickupDate(d)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          pickupDate === d
                            ? "border-brand-yellow bg-brand-yellow/15 text-brand-black"
                            : "border-brand-border bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-black mb-2">Select Time Window</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["10 AM - 1 PM", "1 PM - 4 PM", "4 PM - 7 PM"].map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setPickupSlot(slot)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          pickupSlot === slot
                            ? "border-brand-yellow bg-brand-yellow/15 text-brand-black"
                            : "border-brand-border bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                className="font-black text-base py-4 gap-2 shadow-yellowGlow"
              >
                <span>{isSubmitting ? "Confirming Order..." : "CONFIRM FAST PICKUP"}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>

            </form>

            {/* SIDEBAR SUMMARY */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <h3 className="text-sm font-black text-brand-black border-b border-gray-100 pb-3">
                  Selling Order Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center p-1 border border-gray-100 shrink-0">
                      {sidebarImageUrl ? (
                        <Image src={sidebarImageUrl} alt={sidebarDeviceName} width={32} height={32} className="object-contain max-h-8" />
                      ) : (
                        <Truck className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-brand-black">
                        {sidebarDeviceName}
                      </div>
                      {sidebarStorage && <div className="text-[11px] text-brand-muted">{sidebarStorage} Storage</div>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-extrabold">
                    <span>Estimated Payout</span>
                    <span className="text-base font-price text-brand-black">
                      ₹{(quote?.estimatedPrice || 31400).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-brand-black text-white rounded-3xl p-6 border border-neutral-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-brand-yellow font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CashALL Assurance</span>
                </div>
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  Fast doorstep pickup with assisted factory data wipe. Direct instant payout upon physical verification.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PickupCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-black text-xs font-bold">Loading Pickup Form...</div>}>
      <PickupCheckoutContent />
    </Suspense>
  );
}
