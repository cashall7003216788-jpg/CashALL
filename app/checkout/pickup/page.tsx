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
  const [pincode, setPincode] = useState("110001");
  const [serviceStatus, setServiceStatus] = useState<"IDLE" | "AVAILABLE" | "UNAVAILABLE">("AVAILABLE");
  const [selectedCity, setSelectedCity] = useState("New Delhi");

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
    }
  }, [quoteId]);

  const checkPincode = () => {
    const match = INITIAL_SERVICE_AREAS.find((s) => s.pincode === pincode.trim() && s.active);
    if (match) {
      setServiceStatus("AVAILABLE");
      setSelectedCity(match.city);
    } else if (pincode.length === 6) {
      setServiceStatus("AVAILABLE");
      setSelectedCity("New Delhi");
    } else {
      setServiceStatus("UNAVAILABLE");
    }
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!house || !street || !area) return;

    setIsSubmitting(true);
    const orderNum = `CA${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: OrderData = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      quoteId: quote?.id || quoteId,
      userId: `u-${Date.now()}`,
      customerName: fullName || "Phone Seller",
      customerPhone: phone || "+91 9876543210",
      pincode,
      addressSummary: `${house}, ${street}, ${area}, ${landmark ? landmark + ", " : ""}${selectedCity} - ${pincode}`,
      pickupDate,
      pickupTimeSlot: pickupSlot,
      status: "PICKUP_SCHEDULED",
      revisedPrice: quote?.estimatedPrice,
      declaredConditionSummary: "Customer Declared Valuation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_order_${orderNum}`, JSON.stringify(newOrder));
      localStorage.setItem("cashall_latest_order", JSON.stringify(newOrder));

      const existing = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
      localStorage.setItem("cashall_all_orders", JSON.stringify([newOrder, ...existing]));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/order/${orderNum}`);
    }, 800);
  };

  const variant = INITIAL_VARIANTS.find((v) => v.id === quote?.variantId) || INITIAL_VARIANTS[0];
  const model = INITIAL_MODELS.find((m) => m.id === variant.modelId) || INITIAL_MODELS[0];
  const brand = INITIAL_BRANDS.find((b) => b.id === model.brandId) || INITIAL_BRANDS[0];

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
                  <h2 className="text-base font-bold text-brand-black">1. Pickup PIN Code & Serviceability</h2>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
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
                    <span>Fast Doorstep Pickup is <strong>Available</strong> in {selectedCity} ({pincode}).</span>
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
                      placeholder="e.g. Connaught Place"
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
                      {model.imageUrl ? (
                        <Image src={model.imageUrl} alt={model.name} width={32} height={32} className="object-contain max-h-8" />
                      ) : (
                        <Truck className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-brand-black">
                        {brand.name} {model.name}
                      </div>
                      <div className="text-[11px] text-brand-muted">{variant.storage} Storage</div>
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
