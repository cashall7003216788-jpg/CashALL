"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { INITIAL_SERVICE_AREAS, OrderData, QuoteData, INITIAL_VARIANTS, INITIAL_MODELS, INITIAL_BRANDS } from "@/lib/store";
import { removeQuoteFromCart } from "@/lib/cart";
import { SERVICEABLE_DISTRICTS, isPincodeServiced, getPincodeDetails } from "@/lib/serviceability";
import {
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function PickupCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = searchParams.get("quoteId") || "quote-demo";

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [pincode, setPincode] = useState("");
  const [serviceStatus, setServiceStatus] = useState<"IDLE" | "AVAILABLE" | "UNAVAILABLE">("IDLE");
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [city, setCity] = useState("Kolkata");
  const [selectedState, setSelectedState] = useState("West Bengal");
  const [resolvedDeviceName, setResolvedDeviceName] = useState("");

  // Address fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");

  // Pickup slot
  const [pickupDate, setPickupDate] = useState("Tomorrow");
  const [pickupSlot, setPickupSlot] = useState("10 AM - 1 PM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ALL_INDIAN_STATES = [
    "West Bengal",
    "Uttar Pradesh",
  ];

  const checkPincode = (pinToCheck?: string) => {
    const pinStr = (typeof pinToCheck === "string" ? pinToCheck : pincode).trim();
    if (!pinStr || pinStr.length !== 6) {
      setServiceStatus("UNAVAILABLE");
      return;
    }

    if (isPincodeServiced(pinStr)) {
      const details = getPincodeDetails(pinStr);
      if (details) {
        setCity(details.city);
        setSelectedState(details.state);
      }
      setServiceStatus("AVAILABLE");
    } else {
      setServiceStatus("UNAVAILABLE");
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setPincode(val);
    if (val.length === 6) {
      checkPincode(val);
    } else if (serviceStatus !== "IDLE") {
      setServiceStatus("IDLE");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("cashall_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setFullName(u.name || "");
          setPhone(u.phone || "");
          setEmail(u.email || "");
        } catch (e) {
          console.error(e);
        }
      }

      let foundQuote: QuoteData | null = null;
      const storedQuote = localStorage.getItem(`cashall_quote_${quoteId}`) || localStorage.getItem("cashall_active_quote") || localStorage.getItem("cashall_latest_quote");
      if (storedQuote) {
        try {
          foundQuote = JSON.parse(storedQuote);
        } catch (e) {
          console.error(e);
        }
      }

      if (!foundQuote) {
        try {
          const cart = JSON.parse(localStorage.getItem("cashall_cart_quotes") || "[]");
          const item = cart.find((c: any) => c.quoteNumber === quoteId || c.quoteId === quoteId);
          if (item) {
            foundQuote = {
              id: item.quoteId,
              quoteNumber: item.quoteNumber,
              variantId: item.variantId || "",
              estimatedPrice: item.estimatedPrice,
              basePrice: item.basePrice || item.estimatedPrice,
              totalDeductions: (item.basePrice || item.estimatedPrice) - item.estimatedPrice,
              breakdownJson: item.breakdownJson || JSON.stringify({ deviceName: `${item.brandName} ${item.modelName}` }),
              selectedAnswersJson: item.selectedAnswersJson || "{}",
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: "ACTIVE",
              createdAt: item.createdAt,
            };
            if (item.brandName && item.modelName) {
              setResolvedDeviceName(`${item.brandName} ${item.modelName}${item.storage ? " (" + item.storage + ")" : ""}`);
            }
          }
        } catch (e) {}
      }

      if (foundQuote) {
        setQuote(foundQuote);
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

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory PIN code
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length !== 6) {
      alert("Please enter a valid 6-digit PIN code for pickup.");
      return;
    }

    if (!isPincodeServiced(cleanPin)) {
      setServiceStatus("UNAVAILABLE");
      alert(`Currently, we only serve Ballia, Gorakhpur, Kolkata, Barrackpore, and Ranchi. PIN code ${cleanPin} is outside our service area.`);
      return;
    }

    // Validate phone — critical for cross-device sync
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Validate mandatory email address
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address to receive your official Tax Invoice and Bill.");
      return;
    }

    setIsSubmitting(true);

    const finalName = fullName.trim() || "Customer";
    const finalPhone = cleanPhone;
    const finalEmail = email.trim();
    const finalHouse = house.trim() || "Customer Address";
    const finalStreet = street.trim() || "Doorstep Location";
    const finalArea = area.trim() || selectedState;
    const finalCity = city.trim() || "Kolkata";
    const fullDeviceName = resolvedDeviceName || quote?.breakdownJson ? (JSON.parse(quote?.breakdownJson || "{}").deviceName || "Mobile Device") : "Mobile Device";

    // Update user profile in local storage with email
    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_user", JSON.stringify({ name: finalName, phone: finalPhone, email: finalEmail }));
    }

    let createdOrderNum = "";
    let apiSuccess = false;

    let serverErrorMsg = "";
    // Try up to 2 times to reach the server
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch("/api/v1/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteId: quote?.id || quoteId,
            quoteNumber: quote?.quoteNumber || "",
            fullName: finalName,
            phone: finalPhone,
            email: finalEmail,
            house: finalHouse,
            street: finalStreet,
            area: finalArea,
            landmark,
            city: finalCity,
            state: selectedState,
            pincode,
            pickupDate,
            pickupTimeSlot: pickupSlot,
            deviceName: fullDeviceName,
            estimatedPrice: quote?.estimatedPrice || 32500,
          }),
        });

        const json = await res.json().catch(() => null);

        if (json && json.success && json.data?.orderNumber) {
          createdOrderNum = json.data.orderNumber;
          apiSuccess = true;
          break; // Success — stop retrying
        } else if (json && json.error) {
          serverErrorMsg = json.error;
          console.warn(`Order API attempt ${attempt} returned error: ${json.error}`);
        } else {
          console.warn(`Order API attempt ${attempt} failed: HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`Order API attempt ${attempt} error:`, err);
      }
      // Wait 1s before retry
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000));
    }

    // If API failed after retries, halt and inform user
    if (!apiSuccess) {
      setIsSubmitting(false);
      alert(serverErrorMsg || "Unable to process order right now. Please check your details and try again.");
      return;
    }

    const fullAddress = `${finalHouse}, ${finalStreet}, ${finalArea}${landmark ? ", " + landmark.trim() : ""}, ${finalCity}, ${selectedState} - ${pincode}`;

    const newOrder: OrderData = {
      id: `ord-${Date.now()}`,
      orderNumber: createdOrderNum,
      quoteId: quote?.id || quoteId,
      userId: `u-${finalPhone}`,
      customerName: finalName,
      customerPhone: finalPhone,
      customerEmail: finalEmail,
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
        email: finalEmail,
      }));

      // Remove converted quote from customer Cart
      if (quote?.quoteNumber) {
        removeQuoteFromCart(quote.quoteNumber);
      }
      if (quoteId) {
        removeQuoteFromCart(quoteId);
      }
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
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-yellow shrink-0" />
                    <h2 className="text-base font-bold text-brand-black">1. Pickup PIN Code & Serviceability <span className="text-red-500">*</span></h2>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {SERVICEABLE_DISTRICTS.length} Districts Serviced
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code *"
                    className={`w-52 px-3.5 py-2.5 text-xs font-bold rounded-xl border focus:outline-none transition-colors ${
                      serviceStatus === "AVAILABLE"
                        ? "border-green-500 bg-green-50/30 text-green-900 focus:border-green-600"
                        : serviceStatus === "UNAVAILABLE"
                        ? "border-red-400 bg-red-50/30 text-red-900 focus:border-red-500"
                        : "border-brand-border bg-white text-brand-black focus:border-brand-yellow"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => checkPincode()}
                    className="px-5 py-2.5 bg-brand-black text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
                  >
                    Check Serviceability
                  </button>
                </div>

                {serviceStatus === "AVAILABLE" && (
                  <div className="bg-green-50/90 border border-green-200 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
                    <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-green-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-green-900">
                        Doorstep Pickup Available!
                      </h3>
                      <p className="text-xs text-green-800 mt-0.5">
                        CashALL doorstep pickup is active in <strong className="font-bold">{city}, {selectedState}</strong> (PIN: <span className="font-mono font-bold">{pincode}</span>). Free doorstep verification & instant payment.
                      </p>
                    </div>
                  </div>
                )}

                {serviceStatus === "UNAVAILABLE" && (
                  <div className="bg-gradient-to-br from-red-50/90 to-amber-50/60 border border-red-200/90 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-extrabold text-red-900">
                          We Don&apos;t Serve Here Yet
                        </h3>
                        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                          Sorry! CashALL doorstep pickup is currently not available for PIN code <strong className="font-mono font-bold underline decoration-red-400">{pincode || "entered"}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-red-200/60">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-brand-black flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-brand-yellow" />
                          <span>Our Servicable Districts ({SERVICEABLE_DISTRICTS.length}):</span>
                        </p>
                        <span className="text-[10px] text-gray-500 font-medium">Click a district to view PINs</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {SERVICEABLE_DISTRICTS.map((dist) => {
                          const isExpanded = expandedDistrict === dist.id;
                          return (
                            <div
                              key={dist.id}
                              className="bg-white/95 border border-red-200/70 hover:border-brand-yellow/60 rounded-xl p-3 shadow-xs transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-black text-brand-black block">{dist.name}</span>
                                  <span className="text-[11px] text-gray-500">{dist.state}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setExpandedDistrict(isExpanded ? null : dist.id)}
                                  className="text-[10px] font-extrabold px-2.5 py-1 bg-neutral-100 hover:bg-brand-yellow hover:text-brand-black text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <span>{dist.count} PINs</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="mt-2.5 pt-2.5 border-t border-gray-100 max-h-36 overflow-y-auto pr-1">
                                  <p className="text-[10px] text-gray-400 font-semibold mb-1">Click a PIN code to test/select:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {dist.pincodes.map((pin) => (
                                      <button
                                        type="button"
                                        key={pin}
                                        onClick={() => {
                                          setPincode(pin);
                                          checkPincode(pin);
                                        }}
                                        className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-neutral-100 hover:bg-brand-yellow text-brand-black rounded transition-colors"
                                        title={`Select ${dist.name} - ${pin}`}
                                      >
                                        {pin}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@gmail.com"
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
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Ahmedabad, Kolkata, Howrah"
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow font-bold text-brand-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">
                      State / Union Territory <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow font-bold text-brand-black cursor-pointer"
                    >
                      {ALL_INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
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
