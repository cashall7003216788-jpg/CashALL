"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  Box,
  Cpu,
  Layers,
  FileText,
  Copy,
  Check,
  TrendingDown,
  Info,
} from "lucide-react";
import { cleanDeviceName } from "@/lib/device";

interface CustomerAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderOrQuote: any;
}

interface QuestionItem {
  id: string;
  category: "basic" | "screen_body" | "functional" | "accessories";
  title: string;
  customerAnswer: string;
  isPositive: boolean; // true = good/working/included, false = defect/missing/unanswered
  isAnswered: boolean;
  deductionNote?: string;
}

export function CustomerAnswersModal({
  isOpen,
  onClose,
  orderOrQuote,
}: CustomerAnswersModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "basic" | "screen_body" | "functional" | "accessories">("all");

  if (!isOpen || !orderOrQuote) return null;

  // Extract answers JSON safely
  let rawAnswers: any = {};
  const answersJson =
    orderOrQuote.selectedAnswersJson ||
    orderOrQuote.quote?.selectedAnswersJson ||
    orderOrQuote.answersJson ||
    null;

  if (typeof answersJson === "string") {
    try {
      rawAnswers = JSON.parse(answersJson);
    } catch {
      rawAnswers = {};
    }
  } else if (typeof answersJson === "object" && answersJson !== null) {
    rawAnswers = answersJson;
  }

  // Extract original customer declared answers if order has undergone QC inspection
  let declaredOriginalAnswers: any = null;
  const qcDeclaredRaw = orderOrQuote.qcReports?.[0]?.declaredAnswersJson;
  if (typeof qcDeclaredRaw === "string" && qcDeclaredRaw.trim() && qcDeclaredRaw !== "{}") {
    try {
      declaredOriginalAnswers = JSON.parse(qcDeclaredRaw);
    } catch {}
  }

  // Also extract breakdown details if available
  let breakdownObj: any = {};
  const bdJson = orderOrQuote.breakdownJson || orderOrQuote.quote?.breakdownJson || null;
  if (typeof bdJson === "string") {
    try {
      breakdownObj = JSON.parse(bdJson);
    } catch {}
  } else if (typeof bdJson === "object" && bdJson !== null) {
    breakdownObj = bdJson;
  }

  const deviceName = cleanDeviceName(
    orderOrQuote.deviceName ||
    breakdownObj.deviceName ||
    rawAnswers.device ||
    "Customer Mobile Device"
  );
  const orderNumber = orderOrQuote.orderNumber || orderOrQuote.quoteNumber || "Order";
  const estimatedPrice = orderOrQuote.estimatedPrice || orderOrQuote.quote?.estimatedPrice || orderOrQuote.amount || 0;
  const finalPrice = orderOrQuote.finalPrice || orderOrQuote.revisedPrice || null;
  const priceDifferenceReason =
    orderOrQuote.priceDifferenceReason ||
    orderOrQuote.qcReports?.[0]?.priceDifferenceReason ||
    orderOrQuote.offers?.[0]?.priceDifferenceReason ||
    rawAnswers.priceDifferenceReason ||
    "";

  // Helper to normalize booleans from any storage format
  const parseBool = (val: any, defaultVal = true) => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === "boolean") return val;
    const s = String(val).trim().toLowerCase();
    if (s === "yes" || s === "true" || s === "1") return true;
    if (s === "no" || s === "false" || s === "0") return false;
    return defaultVal;
  };

  const isExplicitlyProvided = (val: any) => val !== undefined && val !== null && val !== "";

  // ─── FIELD NAME NORMALISATION ───────────────────────────────────────────────
  // The assessment pages (assess/page.tsx) save answers with these keys:
  //   canMakeCalls, touchScreenWorking, isScreenOriginal, underWarranty, hasGstBill
  //   selectedDefects (array of: broken_screen | dead_spot_lines | body_dent_scratch | panel_missing)
  //   selectedProblems (array of: front_camera | back_camera | battery_service | esim_issue | ...)
  //   selectedAccessories (array of: box | charger | spen)
  //
  // Older / fallback order-create code used different keys:
  //   callsWorking, touchWorking, screenOriginal, validBill,
  //   selectedMajorDefects (screen_broken | screen_lines | panel_missing)
  //   selectedFunctionalIssues (front_camera | back_camera | battery | battery_health | ...)
  //
  // We resolve BOTH sets of keys so the modal works correctly for all orders.

  // ── Basic booleans (read both formats, no wrong default) ──
  const powerWorking = parseBool(
    rawAnswers.powerWorking ?? rawAnswers.power,
    true
  );

  // callsWorking: new key = canMakeCalls, old key = callsWorking / calls
  const _callsRaw = rawAnswers.canMakeCalls ?? rawAnswers.callsWorking ?? rawAnswers.calls;
  const callsAnswered = isExplicitlyProvided(_callsRaw);
  const callsWorking = parseBool(_callsRaw, true);

  // touchWorking: new key = touchScreenWorking, old key = touchWorking / touch
  const _touchRaw = rawAnswers.touchScreenWorking ?? rawAnswers.touchWorking ?? rawAnswers.touch;
  const touchAnswered = isExplicitlyProvided(_touchRaw);
  const touchWorking = parseBool(_touchRaw, true);

  // screenOriginal: new key = isScreenOriginal, old key = screenOriginal
  const _screenOrigRaw = rawAnswers.isScreenOriginal ?? rawAnswers.screenOriginal;
  const screenOrigAnswered = isExplicitlyProvided(_screenOrigRaw);
  const screenOriginal = parseBool(_screenOrigRaw, true);

  // underWarranty: same key in both formats
  const underWarranty = parseBool(rawAnswers.underWarranty, false);

  // hasGstBill: new key = hasGstBill, old key = validBill
  const _billRaw = rawAnswers.hasGstBill ?? rawAnswers.validBill;
  const validBill = parseBool(_billRaw, false);

  // ── Screen/Body defects ────────────────────────────────────────────────────
  // New assessment format: selectedDefects contains IDs like broken_screen, dead_spot_lines, body_dent_scratch, panel_missing
  // Old format: selectedMajorDefects contains IDs like screen_broken, screen_lines, panel_missing
  const selectedDefects: string[] = Array.isArray(rawAnswers.selectedDefects) ? rawAnswers.selectedDefects : [];
  const majorDefectsOld: string[] = Array.isArray(rawAnswers.selectedMajorDefects)
    ? rawAnswers.selectedMajorDefects
    : Array.isArray(rawAnswers.majorDefects)
    ? rawAnswers.majorDefects
    : [];

  // Unified defect checks — handles both ID naming conventions
  const hasScreenBroken = selectedDefects.includes("broken_screen") || majorDefectsOld.includes("screen_broken");
  const hasDeadSpot = selectedDefects.includes("dead_spot_lines") || majorDefectsOld.includes("screen_lines");
  const hasBodyDent = selectedDefects.includes("body_dent_scratch") || majorDefectsOld.includes("body_dents");
  const hasPanelMissing = selectedDefects.includes("panel_missing") || majorDefectsOld.includes("panel_missing");

  // Scratch / dent levels — only populated by old format
  const scratchLevel = rawAnswers.scratchLevel || (hasBodyDent ? "1_2_scratches" : "no_scratches");
  const dentLevel = rawAnswers.dentLevel || (hasBodyDent ? "1_2_dents" : "no_dents");

  // ── Functional / hardware problems ────────────────────────────────────────
  // New assessment format: selectedProblems contains IDs like front_camera, back_camera, battery_service, esim_issue, wifi, speaker, ...
  // Old format: selectedFunctionalIssues contains front_camera, back_camera, battery, battery_health, fingerprint, face_id, face_sensor, ...
  const selectedProblems: string[] = Array.isArray(rawAnswers.selectedProblems) ? rawAnswers.selectedProblems : [];
  const functionalIssuesOld: string[] = Array.isArray(rawAnswers.selectedFunctionalIssues)
    ? rawAnswers.selectedFunctionalIssues
    : Array.isArray(rawAnswers.functionalIssues)
    ? rawAnswers.functionalIssues
    : [];

  // Unified helpers for each functional issue
  const hasFrontCamera = selectedProblems.includes("front_camera") || functionalIssuesOld.includes("front_camera");
  const hasBackCamera = selectedProblems.includes("back_camera") || functionalIssuesOld.includes("back_camera");
  const hasBattery = selectedProblems.includes("battery_service") || functionalIssuesOld.includes("battery") || functionalIssuesOld.includes("battery_health");
  const hasBiometrics =
    selectedProblems.includes("finger_touch") || selectedProblems.includes("face_sensor") ||
    functionalIssuesOld.includes("fingerprint") || functionalIssuesOld.includes("face_id") || functionalIssuesOld.includes("face_sensor");
  const hasSpeakerMic =
    selectedProblems.includes("speaker") || selectedProblems.includes("microphone") || selectedProblems.includes("audio_receiver") ||
    functionalIssuesOld.includes("speaker") || functionalIssuesOld.includes("mic") || functionalIssuesOld.includes("microphone") || functionalIssuesOld.includes("receiver");
  const hasWifiBluetooth =
    selectedProblems.includes("wifi") || selectedProblems.includes("bluetooth") ||
    functionalIssuesOld.includes("wifi") || functionalIssuesOld.includes("bluetooth");

  // ── Accessories ────────────────────────────────────────────────────────────
  // Both formats use selectedAccessories with same IDs (box, charger, spen)
  // If the field exists but is empty array → customer removed everything
  // If the field doesn't exist at all → unknown (default to both present for old orders)
  const _accRaw = rawAnswers.selectedAccessories ?? rawAnswers.accessories;
  const accessories: string[] = Array.isArray(_accRaw)
    ? _accRaw
    : (_accRaw === undefined ? ["charger", "box"] : []);

  // Legacy compat alias (used in some old question definitions below)
  const functionalIssues = [...selectedProblems, ...functionalIssuesOld];

  // Build standard list of evaluation questions
  const questionsList: QuestionItem[] = [
    // 1. BASIC QUESTIONS
    {
      id: "power",
      category: "basic",
      title: "Device Power On",
      isAnswered: isExplicitlyProvided(rawAnswers.powerWorking ?? rawAnswers.power),
      isPositive: powerWorking,
      customerAnswer: powerWorking
        ? "Declared: Powers On Normally (Working)"
        : "Declared: Does NOT Turn On (Dead / Boot Issue)",
      deductionNote: !powerWorking ? "Major deduction (Dead Device)" : undefined,
    },
    {
      id: "calls",
      category: "basic",
      title: "Make & Receive Calls (Network)",
      // reads both canMakeCalls (new) and callsWorking/calls (old)
      isAnswered: callsAnswered,
      isPositive: callsWorking,
      customerAnswer: callsWorking
        ? "Declared: Network & Calling Works Properly"
        : "Declared: Calling / Cellular SIM Slot Faulty",
      deductionNote: !callsWorking ? "Calling/Baseband issue deduction" : undefined,
    },
    {
      id: "touch",
      category: "basic",
      title: "Touchscreen Functionality",
      // reads both touchScreenWorking (new) and touchWorking/touch (old)
      isAnswered: touchAnswered,
      isPositive: touchWorking,
      customerAnswer: touchWorking
        ? "Declared: Touch Working Smoothly"
        : "Declared: Touch Not Responding / Ghost Touch",
      deductionNote: !touchWorking ? "Full display replacement deduction" : undefined,
    },
    {
      id: "screen_original",
      category: "basic",
      title: "Original Factory Screen",
      // reads both isScreenOriginal (new) and screenOriginal (old)
      isAnswered: screenOrigAnswered,
      isPositive: screenOriginal,
      customerAnswer: screenOriginal
        ? "Declared: Original Screen (Never Replaced)"
        : "Declared: Screen Changed (Aftermarket / Local Screen)",
      deductionNote: !screenOriginal ? "Aftermarket display deduction" : undefined,
    },
    {
      id: "warranty",
      category: "basic",
      title: "Manufacturer Warranty Status",
      isAnswered: isExplicitlyProvided(rawAnswers.underWarranty),
      isPositive: underWarranty,
      customerAnswer: underWarranty
        ? "Declared: Under Active Brand Warranty (<11 Months)"
        : "Declared: Out of Brand Warranty (Expired)",
      deductionNote: !underWarranty ? "Standard out-of-warranty adjustment" : undefined,
    },
    {
      id: "bill",
      category: "basic",
      title: "Valid GST / Brand Purchase Invoice",
      // reads both hasGstBill (new) and validBill (old)
      isAnswered: isExplicitlyProvided(_billRaw),
      isPositive: validBill,
      customerAnswer: validBill
        ? "Declared: Original Tax Invoice Available with Matching IMEI"
        : "Declared: Bill Missing / Not Available",
      deductionNote: !validBill ? "Missing purchase invoice adjustment" : undefined,
    },

    // 2. SCREEN & BODY DEFECTS
    {
      id: "screen_cracks",
      category: "screen_body",
      title: "Screen Glass Condition",
      isAnswered: true,
      isPositive: !hasScreenBroken,
      customerAnswer: hasScreenBroken
        ? "Customer Declared Screen Cracked / Broken"
        : "Declared: Flawless Screen Glass (No Cracks)",
      deductionNote: hasScreenBroken ? "Glass replacement deduction" : undefined,
    },
    {
      id: "screen_lines",
      category: "screen_body",
      title: "Display Lines / Dead Pixels / Spot",
      isAnswered: true,
      isPositive: !hasDeadSpot,
      customerAnswer: hasDeadSpot
        ? "Customer Declared Lines / Black Spots on Display"
        : "Declared: Clear Display (No Lines / Dead Pixels)",
      deductionNote: hasDeadSpot ? "OLED/LCD panel defect deduction" : undefined,
    },
    {
      id: "scratches",
      category: "screen_body",
      title: "Body / Screen Scratches",
      isAnswered: true,
      isPositive: !hasBodyDent && scratchLevel === "no_scratches",
      customerAnswer: hasBodyDent || scratchLevel === "more_than_2"
        ? "Declared: Heavy / Multiple Scratches (>2)"
        : scratchLevel === "1_2_scratches"
        ? "Declared: 1-2 Minor Scratches"
        : "Declared: Flawless / Like New (No Scratches)",
      deductionNote: (hasBodyDent || scratchLevel === "more_than_2") ? "Cosmetic scratch grade deduction" : undefined,
    },
    {
      id: "dents",
      category: "screen_body",
      title: "Body Dents / Bezel Condition",
      isAnswered: true,
      isPositive: !hasBodyDent && dentLevel === "no_dents",
      customerAnswer: dentLevel === "major_dents"
        ? "Declared: Major Dents / Bent Frame"
        : (hasBodyDent || dentLevel === "1_2_dents")
        ? "Declared: 1-2 Minor Dents (Body Dent Reported)"
        : "Declared: No Dents / Pristine Housing",
      deductionNote: (hasBodyDent || dentLevel === "major_dents") ? "Housing body replacement deduction" : undefined,
    },
    {
      id: "back_panel",
      category: "screen_body",
      title: "Back Glass / Panel Condition",
      isAnswered: true,
      isPositive: !hasPanelMissing,
      customerAnswer: hasPanelMissing
        ? "Customer Declared Back Panel Broken / Missing"
        : "Declared: Back Panel Intact & Pristine",
      deductionNote: hasPanelMissing ? "Back glass replacement deduction" : undefined,
    },

    // 3. HARDWARE & FUNCTIONAL
    {
      id: "front_camera",
      category: "functional",
      title: "Front Selfie Camera",
      isAnswered: true,
      isPositive: !hasFrontCamera,
      customerAnswer: hasFrontCamera
        ? "Declared: Front Camera Faulty / Blurry"
        : "Declared: Working Properly",
    },
    {
      id: "back_camera",
      category: "functional",
      title: "Primary Rear Camera",
      isAnswered: true,
      isPositive: !hasBackCamera,
      customerAnswer: hasBackCamera
        ? "Declared: Rear Camera Faulty / Shaking"
        : "Declared: Working Properly",
    },
    {
      id: "battery",
      category: "functional",
      title: "Battery Health & Performance",
      isAnswered: true,
      isPositive: !hasBattery,
      customerAnswer: hasBattery
        ? "Declared: Battery Drains Fast / Service Warning (<80%)"
        : "Declared: Good Battery Backup (>80%)",
    },
    {
      id: "biometrics",
      category: "functional",
      title: "Fingerprint Scanner / Face ID",
      isAnswered: true,
      isPositive: !hasBiometrics,
      customerAnswer: hasBiometrics
        ? "Declared: Biometric / Face ID Not Working"
        : "Declared: Working Properly",
    },
    {
      id: "speaker_mic",
      category: "functional",
      title: "Speaker & Microphone",
      isAnswered: true,
      isPositive: !hasSpeakerMic,
      customerAnswer: hasSpeakerMic
          ? "Declared: Speaker / Microphone Crackling or Silent"
          : "Declared: Audio Loud & Clear",
    },
    {
      id: "wifi_bluetooth",
      category: "functional",
      title: "Wi-Fi & Bluetooth Connectivity",
      isAnswered: true,
      isPositive: !hasWifiBluetooth,
      customerAnswer: hasWifiBluetooth
          ? "Declared: Connectivity Issues (Cannot Connect)"
          : "Declared: Working Properly",
    },

    // 4. ACCESSORIES
    {
      id: "charger",
      category: "accessories",
      title: "Original Charger / Cable",
      isAnswered: true,
      isPositive: accessories.includes("charger"),
      customerAnswer: accessories.includes("charger")
        ? "Original Charger Declared Available"
        : "Customer Declared Missing Charger",
      deductionNote: !accessories.includes("charger") ? "Original charger deduction applied" : undefined,
    },
    {
      id: "box",
      category: "accessories",
      title: "Original Retail Box with Matching IMEI",
      isAnswered: true,
      isPositive: accessories.includes("box"),
      customerAnswer: accessories.includes("box")
        ? "Original Packaging Box Declared Available"
        : "Customer Declared Missing Box",
      deductionNote: !accessories.includes("box") ? "Original box deduction applied" : undefined,
    },
  ];

  // Filtering by active tab
  const filteredQuestions = questionsList.filter((q) => {
    if (activeTab === "all") return true;
    return q.category === activeTab;
  });

  const totalAnswered = questionsList.filter((q) => q.isAnswered).length;
  const declaredDefectsCount = questionsList.filter((q) => !q.isPositive).length;
  const declaredWorkingCount = questionsList.filter((q) => q.isPositive).length;

  const handleCopyBargainScript = () => {
    const summaryText = `
🔍 CashALL Customer Evaluation Audit for ${deviceName} (#${orderNumber})
Online Quoted Price: ₹${estimatedPrice.toLocaleString("en-IN")}
${finalPrice ? `Final Settled Payout: ₹${finalPrice.toLocaleString("en-IN")}` : ""}

📋 Customer Online Declaration:
${questionsList
  .map(
    (q) =>
      `${q.isPositive ? "✅" : "⚠️"} ${q.title}: ${q.customerAnswer}`
  )
  .join("\n")}

${priceDifferenceReason ? `📌 Agent Settlement Reason: ${priceDifferenceReason}` : ""}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* HEADER */}
        <div className="bg-neutral-800/90 border-b border-neutral-700 p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-yellow-400 text-black font-black text-xs px-2.5 py-1 rounded-lg uppercase">
                #{orderNumber}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Customer Questionnaire & Condition Audit
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Complete log of what the customer answered vs left blank during online price calculation. Use this to negotiate with exact proof.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-700/60 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP SUMMARY STATS BAR */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 font-bold uppercase">Evaluated Device</div>
            <div className="font-extrabold text-yellow-400 truncate">{deviceName}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 font-bold uppercase">Online Quoted</div>
            <div className="font-black text-white font-price">₹{estimatedPrice.toLocaleString("en-IN")}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 font-bold uppercase">Claimed Working</div>
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{declaredWorkingCount} Items</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] text-neutral-400 font-bold uppercase">Declared Issues/Missing</div>
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{declaredDefectsCount} Items</span>
            </div>
          </div>
        </div>

        {/* CATEGORY TABS & ACTION BUTTONS */}
        <div className="px-6 pt-4 pb-2 border-b border-neutral-800 flex items-center justify-between gap-3 flex-wrap bg-neutral-900">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {[
              { id: "all", label: "All Questions", count: questionsList.length },
              { id: "basic", label: "Device & Warranty", count: 6 },
              { id: "screen_body", label: "Screen & Body", count: 5 },
              { id: "functional", label: "Hardware/Cameras", count: 6 },
              { id: "accessories", label: "Box & Charger", count: 2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-yellow-400 text-black shadow-md"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? "bg-black/20 text-black" : "bg-neutral-700 text-neutral-400"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyBargainScript}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-xl transition shadow-md shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Audit Script!" : "Copy Bargaining Script"}</span>
          </button>
        </div>

        {/* QUESTIONS & ANSWERS LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {declaredOriginalAnswers && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-300 uppercase">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Physical Inspection Re-Quote Audit Comparison</span>
              </div>
              <p className="text-neutral-300">
                This device was physically inspected at doorstep. The options below represent the verified condition evaluated by the field agent.
              </p>
            </div>
          )}

          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                q.isPositive
                  ? "bg-neutral-800/60 border-neutral-700/80 hover:border-emerald-700/50"
                  : "bg-amber-950/20 border-amber-800/40 hover:border-amber-700"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-500 font-bold">#{idx + 1}</span>
                  <span className="text-sm font-bold text-white">{q.title}</span>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md">
                    {q.category}
                  </span>
                </div>
                <div className="text-xs flex items-center gap-1.5">
                  <span className="text-neutral-400">Customer Answer:</span>
                  <span
                    className={`font-semibold ${
                      q.isPositive ? "text-emerald-400" : "text-amber-300"
                    }`}
                  >
                    {q.customerAnswer}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {q.isPositive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-xl shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claimed Working / OK</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-700 px-3 py-1 rounded-xl shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Issue / Missing / Blank</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* AGENT SETTLEMENT REASON BOX IF AVAILABLE */}
          {priceDifferenceReason && (
            <div className="mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-extrabold uppercase">
                <Info className="w-4 h-4" />
                <span>Agent QC / Final Settlement Rationale</span>
              </div>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed bg-indigo-900/30 p-3 rounded-xl border border-indigo-800/40">
                &ldquo;{priceDifferenceReason}&rdquo;
              </p>
            </div>
          )}

          {/* BARGAINING CHEAT-SHEET BOX */}
          <div className="mt-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase">
              <TrendingDown className="w-4 h-4" />
              <span>Doorstep Negotiation & Bargaining Tip for Agents & Admins</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              If the customer disputes the physical inspection price offer, remind them:
              <br />
              <strong className="text-white">
                &ldquo;Sir/Ma&apos;am, your online valuation of ₹{estimatedPrice.toLocaleString("en-IN")} was calculated based on 100% flawless condition, original charger, and zero scratches as selected in the app. During our physical 15-point check, we detected minor discrepancies which automatically calibrated our standard offer to our best settled payout.&rdquo;
              </strong>
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-neutral-800/90 border-t border-neutral-700 p-4 px-6 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Total {questionsList.length} criteria evaluated & recorded in database.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 rounded-xl transition shadow-md"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
}
