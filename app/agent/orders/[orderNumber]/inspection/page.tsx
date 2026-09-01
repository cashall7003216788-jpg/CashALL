"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Save,
  Loader2,
  User,
  Phone,
  MapPin,
  Barcode,
  Mail,
  IndianRupee,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function AgentOrderInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumberParam = params.orderNumber as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agentSession, setAgentSession] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Customer declared answers & Agent inspected state
  const [declaredAnswers, setDeclaredAnswers] = useState<any>({});
  const [basePrice, setBasePrice] = useState<number>(30000);

  // Toggleable QC Options
  const [underWarranty, setUnderWarranty] = useState<boolean>(false);
  const [validBill, setValidBill] = useState<boolean>(false);
  const [powerWorking, setPowerWorking] = useState<boolean>(true);
  const [callsWorking, setCallsWorking] = useState<boolean>(true);
  const [touchWorking, setTouchWorking] = useState<boolean>(true);
  const [screenOriginal, setScreenOriginal] = useState<boolean>(true);
  const [selectedMajorDefects, setSelectedMajorDefects] = useState<string[]>([]);
  const [scratchLevel, setScratchLevel] = useState<string>("no_scratches");
  const [dentLevel, setDentLevel] = useState<string>("no_dents");
  const [selectedFunctionalIssues, setSelectedFunctionalIssues] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(["charger", "box"]);

  // Inspection Form State
  const [imei, setImei] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [revisedPrice, setRevisedPrice] = useState<number>(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cashall_agent_session");
      if (!saved) {
        router.replace("/agent/login");
        return;
      }
      try {
        setAgentSession(JSON.parse(saved).agent || { name: "Field Agent" });
      } catch (e) {}
    }
  }, [router]);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumberParam) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/agent/orders?name=${encodeURIComponent(agentSession?.name || "")}&phone=${agentSession?.phone || ""}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          const match = json.orders.find(
            (o: any) => o.orderNumber === orderNumberParam || o.id === orderNumberParam
          );
          if (match) {
            setOrder(match);
            
            // Extract answers JSON
            let answers: any = {};
            const rawAns = match.selectedAnswersJson || match.quote?.selectedAnswersJson || match.answersJson;
            if (typeof rawAns === "string") {
              try { answers = JSON.parse(rawAns); } catch {}
            } else if (typeof rawAns === "object" && rawAns !== null) {
              answers = rawAns;
            }

            setDeclaredAnswers(answers);

            // Pre-populate agent state with customer answers
            const pUnderWarranty = answers.underWarranty === true;
            const pValidBill = answers.validBill === true;
            const pPower = answers.powerWorking !== false && answers.power !== "no";
            const pCalls = answers.callsWorking !== false && answers.calls !== "no";
            const pTouch = answers.touchWorking !== false && answers.touch !== "no";
            const pScreenOrig = answers.screenOriginal !== false;

            const pMajorDefects = Array.isArray(answers.selectedMajorDefects)
              ? answers.selectedMajorDefects
              : (Array.isArray(answers.majorDefects) ? answers.majorDefects : []);
            
            const pScratch = answers.scratchLevel || "no_scratches";
            const pDent = answers.dentLevel || "no_dents";

            const pFunctional = Array.isArray(answers.selectedFunctionalIssues)
              ? answers.selectedFunctionalIssues
              : (Array.isArray(answers.functionalIssues) ? answers.functionalIssues : []);

            const pAccessories = Array.isArray(answers.selectedAccessories)
              ? answers.selectedAccessories
              : (Array.isArray(answers.accessories) ? answers.accessories : ["charger", "box"]);

            setUnderWarranty(pUnderWarranty);
            setValidBill(pValidBill);
            setPowerWorking(pPower);
            setCallsWorking(pCalls);
            setTouchWorking(pTouch);
            setScreenOriginal(pScreenOrig);
            setSelectedMajorDefects(pMajorDefects);
            setScratchLevel(pScratch);
            setDentLevel(pDent);
            setSelectedFunctionalIssues(pFunctional);
            setSelectedAccessories(pAccessories);

            const initialBase = match.quote?.basePrice || Math.round((match.estimatedPrice || 30000) * 1.25);
            setBasePrice(initialBase);

            const initialPrice = match.finalPrice || match.revisedPrice || match.estimatedPrice || 0;
            setRevisedPrice(initialPrice);
            setImei(match.imeiNumber || "");
            setCustomerEmail(match.customerEmail && match.customerEmail !== "—" ? match.customerEmail : "");
          } else {
            setErrorMsg(`Order #${orderNumberParam} not found in your assigned list.`);
          }
        }
      } catch (err: any) {
        console.error("Error loading order:", err);
        setErrorMsg("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    if (agentSession) {
      loadOrder();
    }
  }, [orderNumberParam, agentSession]);

  // LIVE RE-QUOTE CALCULATION BASED ON AGENT ADJUSTMENTS
  const calculateLiveReQuote = () => {
    let deductionPct = 0;

    // Basic questions deductions
    if (!underWarranty) deductionPct += 5;
    if (!validBill) deductionPct += 3;
    if (!powerWorking) deductionPct += 50;
    if (!callsWorking) deductionPct += 12;
    if (!touchWorking) deductionPct += 20;
    if (!screenOriginal) deductionPct += 15;

    // Major defects deductions
    if (selectedMajorDefects.includes("screen_broken")) deductionPct += 25;
    if (selectedMajorDefects.includes("screen_lines")) deductionPct += 18;
    if (selectedMajorDefects.includes("panel_missing")) deductionPct += 10;
    if (selectedMajorDefects.includes("body_defects")) deductionPct += 10;

    // Scratches & dents deductions
    if (scratchLevel === "more_than_2") deductionPct += 12;
    if (scratchLevel === "1_2_scratches") deductionPct += 5;
    if (dentLevel === "major_dents") deductionPct += 18;
    if (dentLevel === "1_2_dents") deductionPct += 8;

    // Functional issues deductions
    if (selectedFunctionalIssues.includes("front_camera") || selectedFunctionalIssues.includes("back_camera")) deductionPct += 10;
    if (selectedFunctionalIssues.includes("battery")) deductionPct += 6;
    if (selectedFunctionalIssues.includes("speaker") || selectedFunctionalIssues.includes("mic")) deductionPct += 5;
    if (selectedFunctionalIssues.includes("fingerprint") || selectedFunctionalIssues.includes("face_id")) deductionPct += 8;
    if (selectedFunctionalIssues.includes("charging_port") || selectedFunctionalIssues.includes("wifi")) deductionPct += 12;

    // Accessories deductions
    if (!selectedAccessories.includes("box")) deductionPct += 2;
    if (!selectedAccessories.includes("charger")) deductionPct += 3;

    const totalDeductionAmount = Math.round((basePrice * deductionPct) / 100);
    const calculated = Math.max(Math.round(basePrice * 0.15), basePrice - totalDeductionAmount);
    return calculated;
  };

  // Re-calculate price whenever agent toggles options
  useEffect(() => {
    if (order && basePrice > 0) {
      const livePrice = calculateLiveReQuote();
      setRevisedPrice(livePrice);
    }
  }, [
    underWarranty,
    validBill,
    powerWorking,
    callsWorking,
    touchWorking,
    screenOriginal,
    selectedMajorDefects,
    scratchLevel,
    dentLevel,
    selectedFunctionalIssues,
    selectedAccessories,
    basePrice,
  ]);

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei.trim() || imei.trim().length < 5) {
      alert("Please enter a valid IMEI / Serial number (minimum 5 digits).");
      return;
    }

    const finalAmount = Number(revisedPrice);
    if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
      alert("Please enter a valid final payout price.");
      return;
    }

    const inspectedAnswersObj = {
      device: order.deviceName || "Mobile Device",
      underWarranty,
      validBill,
      powerWorking,
      callsWorking,
      touchWorking,
      screenOriginal,
      power: powerWorking ? "yes" : "no",
      calls: callsWorking ? "yes" : "no",
      touch: touchWorking ? "yes" : "no",
      selectedMajorDefects,
      majorDefects: selectedMajorDefects,
      scratchLevel,
      dentLevel,
      selectedFunctionalIssues,
      functionalIssues: selectedFunctionalIssues,
      selectedAccessories,
      accessories: selectedAccessories,
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/agent/orders/${orderNumberParam}/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imei: imei.trim(),
          inspectedAnswers: inspectedAnswersObj,
          revisedPrice: Number(revisedPrice),
          finalPrice: Number(revisedPrice),
          reason: reason.trim() || "Physical QC inspection verified at doorstep",
          customerEmail: customerEmail.trim(),
          agentName: agentSession?.name || "Field Agent",
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Also update local storage if present
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`cashall_order_${orderNumberParam}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.revisedPrice = Number(revisedPrice);
              parsed.finalPrice = Number(revisedPrice);
              parsed.imeiNumber = imei.trim();
              parsed.selectedAnswersJson = JSON.stringify(inspectedAnswersObj);
              parsed.status = "ACCEPTED";
              if (customerEmail.trim()) parsed.customerEmail = customerEmail.trim();
              localStorage.setItem(`cashall_order_${orderNumberParam}`, JSON.stringify(parsed));
            } catch (e) {}
          }
        }

        alert(`✅ Physical Inspection Completed for Order #${orderNumberParam}!\nVerified IMEI: ${imei.trim()}\nRe-Quote / Final Valuation: ₹${Number(revisedPrice).toLocaleString("en-IN")}`);
        router.push("/agent/dashboard");
      } else {
        alert(`Failed to save inspection: ${json.error || "Server error"}`);
      }
    } catch (err: any) {
      alert(`Error submitting inspection: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
          <p className="text-xs text-neutral-400 font-semibold">Loading Doorstep Inspection Console...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Order Not Found</h2>
          <p className="text-xs text-neutral-400">{errorMsg || "Unable to find this order in your assignments."}</p>
          <Link
            href="/agent/dashboard"
            className="inline-flex items-center gap-2 bg-yellow-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agent Console
          </Link>
        </div>
      </div>
    );
  }

  const originalQuotePrice = order.estimatedPrice || 0;
  const priceDiff = revisedPrice - originalQuotePrice;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* TOP HEADER BAR */}
      <header className="bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 py-3.5 px-4 sm:px-8 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/agent/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-yellow-400 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-neutral-800" />
          <span className="text-sm font-black text-white font-price tracking-wide">
            Doorstep Physical QC &amp; Re-Quote
          </span>
        </div>

        <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black px-3 py-1 rounded-xl">
          Order #{order.orderNumber}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* CUSTOMER & DEVICE BANNER */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <h1 className="text-base font-extrabold text-white">{order.deviceName}</h1>
                <p className="text-[11px] text-neutral-400">Order ID: #{order.orderNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-neutral-400 font-bold uppercase">Customer Online Quote</div>
                <div className="text-base font-black text-gray-400 line-through">
                  ₹{originalQuotePrice.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-right bg-yellow-400/10 border border-yellow-400/40 p-2.5 rounded-2xl">
                <div className="text-[10px] text-yellow-400 font-bold uppercase">Live Re-Quote Price</div>
                <div className="text-lg font-black text-yellow-400 font-price">
                  ₹{revisedPrice.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-black/40 p-3 rounded-2xl border border-neutral-800">
              <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                <User className="w-3 h-3 text-yellow-400" /> Customer Information
              </div>
              <div className="font-bold text-white text-sm">{order.customerName}</div>
              <div className="text-neutral-300">📞 {order.customerPhone}</div>
            </div>

            <div className="space-y-1 bg-black/40 p-3 rounded-2xl border border-neutral-800">
              <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-yellow-400" /> Pickup Location
              </div>
              <div className="text-neutral-300 line-clamp-2">{order.address || order.addressSummary}</div>
            </div>
          </div>
        </div>

        {/* INSPECTION FORM */}
        <form onSubmit={handleSubmitInspection} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Physical QC &amp; Live Re-Quote Checklist
              </h2>
            </div>
            <span className="text-[11px] text-neutral-400">
              Customer choices pre-filled • Tap any item to change
            </span>
          </div>

          {/* 1. MANDATORY IMEI NUMBER */}
          <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-neutral-800">
            <label className="block text-xs font-bold text-neutral-200">
              1. Verified Device IMEI / Serial Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="e.g. 864932057391842 (Dial *#06# on phone)"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none transition"
              />
            </div>
            <p className="text-[10px] text-neutral-500">
              Dial <span className="text-yellow-400 font-mono">*#06#</span> on phone to match the 15-digit IMEI.
            </p>
          </div>

          {/* 2. BASIC HEALTH & OPERATIONAL STATUS (STEP 1) */}
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs font-black uppercase text-yellow-400">
              2. Basic Operational &amp; Display Status
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Power */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Device Power On:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPowerWorking(true)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      powerWorking
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✓ Powers On
                  </button>
                  <button
                    type="button"
                    onClick={() => setPowerWorking(false)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      !powerWorking
                        ? "bg-red-950/60 border-red-500 text-red-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✕ Dead / Boot Issue (-50%)
                  </button>
                </div>
              </div>

              {/* Calls */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Make &amp; Receive Calls:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCallsWorking(true)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      callsWorking
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✓ Working
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallsWorking(false)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      !callsWorking
                        ? "bg-red-950/60 border-red-500 text-red-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✕ Faulty SIM/Mic (-12%)
                  </button>
                </div>
              </div>

              {/* Touchscreen */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Touchscreen Response:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTouchWorking(true)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      touchWorking
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✓ Smooth Touch
                  </button>
                  <button
                    type="button"
                    onClick={() => setTouchWorking(false)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      !touchWorking
                        ? "bg-red-950/60 border-red-500 text-red-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✕ Ghost / Dead Touch (-20%)
                  </button>
                </div>
              </div>

              {/* Screen Original */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Screen Originality:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScreenOriginal(true)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      screenOriginal
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✓ Original Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenOriginal(false)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      !screenOriginal
                        ? "bg-red-950/60 border-red-500 text-red-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✕ Screen Changed (-15%)
                  </button>
                </div>
              </div>

              {/* Warranty */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Brand Warranty (&lt; 11m):</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnderWarranty(true)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      underWarranty
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✓ Under Warranty
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnderWarranty(false)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      !underWarranty
                        ? "bg-amber-950/60 border-amber-500 text-amber-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✕ Out of Warranty (-5%)
                  </button>
                </div>
              </div>

              {/* GST Bill */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Matching GST Bill:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValidBill(true)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      validBill
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✓ Valid Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidBill(false)}
                    className={`py-2 px-3 rounded-lg font-bold border transition ${
                      !validBill
                        ? "bg-amber-950/60 border-amber-500 text-amber-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    ✕ No Bill (-3%)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MAJOR SCREEN & DISPLAY DEFECTS */}
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs font-black uppercase text-yellow-400">
              3. Major Physical Defects
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: "screen_broken", title: "Glass Cracked / Broken", desc: "-25% display deduction" },
                { id: "screen_lines", title: "Display Lines / Ink Bleed", desc: "-18% inner panel deduction" },
                { id: "panel_missing", title: "Back Panel Broken", desc: "-10% back casing deduction" },
                { id: "body_defects", title: "Noticeable Body Dents", desc: "-10% frame wear deduction" },
              ].map((d) => {
                const isSelected = selectedMajorDefects.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedMajorDefects(toggleArrayItem(selectedMajorDefects, d.id))}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "bg-red-950/60 border-red-500 text-red-300"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{d.title}</div>
                      <div className="text-[10px] opacity-75">{d.desc}</div>
                    </div>
                    <span className="font-black text-sm">{isSelected ? "✕" : "✓"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. SCRATCHES & DENTS LEVEL */}
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs font-black uppercase text-yellow-400">
              4. Scratches &amp; Dents Wear
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Screen Scratches:</div>
                <select
                  value={scratchLevel}
                  onChange={(e) => setScratchLevel(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="no_scratches">✨ No Scratches (Flawless 0%)</option>
                  <option value="1_2_scratches">1-2 Minor Hairline Scratches (-5%)</option>
                  <option value="more_than_2">Heavy Deep Scratches (-12%)</option>
                </select>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-300">Body Dents:</div>
                <select
                  value={dentLevel}
                  onChange={(e) => setDentLevel(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="no_dents">✨ No Dents (Flawless Frame 0%)</option>
                  <option value="1_2_dents">1-2 Minor Corner Dents (-8%)</option>
                  <option value="major_dents">Major Deep Dents / Bent (-18%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. HARDWARE FUNCTIONAL CHECKS */}
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs font-black uppercase text-yellow-400">
              5. Hardware Component Checks
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: "front_camera", label: "📷 Cameras", penalty: "-10%" },
                { id: "battery", label: "🔋 Battery", penalty: "-6%" },
                { id: "speaker", label: "🔊 Speaker/Mic", penalty: "-5%" },
                { id: "fingerprint", label: "🔒 Biometrics", penalty: "-8%" },
              ].map((fn) => {
                const isFaulty = selectedFunctionalIssues.includes(fn.id);
                return (
                  <button
                    key={fn.id}
                    type="button"
                    onClick={() => setSelectedFunctionalIssues(toggleArrayItem(selectedFunctionalIssues, fn.id))}
                    className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1 transition ${
                      !isFaulty
                        ? "bg-emerald-950/40 border-emerald-700 text-emerald-300"
                        : "bg-red-950/60 border-red-500 text-red-300"
                    }`}
                  >
                    <span>{fn.label}</span>
                    <span className="text-[10px] opacity-80">{!isFaulty ? "✓ PASS" : `✕ FAIL (${fn.penalty})`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. ORIGINAL ACCESSORIES */}
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-neutral-800">
            <div className="text-xs font-black uppercase text-yellow-400">
              6. Original Accessories Handover
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSelectedAccessories(toggleArrayItem(selectedAccessories, "charger"))}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  selectedAccessories.includes("charger")
                    ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                    : "bg-amber-950/50 border-amber-700 text-amber-300"
                }`}
              >
                🔌 Original Charger: {selectedAccessories.includes("charger") ? "✓ Handed Over" : "✕ Missing (-3%)"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedAccessories(toggleArrayItem(selectedAccessories, "box"))}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  selectedAccessories.includes("box")
                    ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                    : "bg-amber-950/50 border-amber-700 text-amber-300"
                }`}
              >
                📦 Original Box: {selectedAccessories.includes("box") ? "✓ Handed Over" : "✕ Missing (-2%)"}
              </button>
            </div>
          </div>

          {/* 7. LIVE RE-QUOTE & FINAL SETTLED PRICE */}
          <div className="bg-yellow-400/10 border-2 border-yellow-400/50 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-yellow-400/20 pb-3">
              <div>
                <div className="text-xs font-black text-yellow-400 uppercase tracking-wide flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4" /> Live Doorstep Re-Quote Valuation
                </div>
                <div className="text-[11px] text-neutral-300 mt-0.5">
                  Adjust options above to automatically recalculate based on percentage rules.
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Calculated Re-Quote</span>
                <span className="text-2xl font-black text-yellow-400 font-price">
                  ₹{revisedPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300">
                Final Agreed Deal Payout (Seller Accepted Amount) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="text-emerald-400 font-bold absolute left-4 top-1/2 -translate-y-1/2 text-base">₹</span>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Final payout price"
                  value={revisedPrice}
                  onChange={(e) => setRevisedPrice(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-emerald-600/60 focus:border-emerald-400 rounded-xl pl-9 pr-4 py-3 text-lg font-black font-price text-emerald-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300">Inspection &amp; Adjustment Notes</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Screen replaced with local display and 1-2 frame scratches"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm py-4 px-6 rounded-2xl transition shadow-yellowGlow disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Inspection &amp; Updating Re-Quote...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Physical Inspection &amp; Lock Re-Quote (₹{revisedPrice.toLocaleString("en-IN")})</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
