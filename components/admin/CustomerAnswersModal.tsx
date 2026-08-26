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

  // Build standard list of evaluation questions
  const questionsList: QuestionItem[] = [
    // 1. BASIC QUESTIONS
    {
      id: "power",
      category: "basic",
      title: "Device Power On",
      isAnswered: rawAnswers.powerWorking !== undefined && rawAnswers.powerWorking !== null,
      isPositive: rawAnswers.powerWorking === true || rawAnswers.power === "yes" || rawAnswers.power === true,
      customerAnswer:
        rawAnswers.powerWorking === true || rawAnswers.power === "yes" || rawAnswers.power === true
          ? "Powers On Normally"
          : rawAnswers.powerWorking === false || rawAnswers.power === "no"
          ? "Does NOT Turn On (Dead Device)"
          : "Not Explicitly Answered (Assumed Working)",
      deductionNote: rawAnswers.powerWorking === false ? "Major deduction (Dead Device)" : undefined,
    },
    {
      id: "calls",
      category: "basic",
      title: "Make & Receive Calls (Network)",
      isAnswered: rawAnswers.callsWorking !== undefined && rawAnswers.callsWorking !== null,
      isPositive: rawAnswers.callsWorking === true || rawAnswers.calls === "yes" || rawAnswers.calls === true,
      customerAnswer:
        rawAnswers.callsWorking === true || rawAnswers.calls === "yes" || rawAnswers.calls === true
          ? "Network & Calling Works"
          : rawAnswers.callsWorking === false || rawAnswers.calls === "no"
          ? "Calling / SIM Slot Faulty"
          : "Not Explicitly Answered (Assumed Working)",
      deductionNote: rawAnswers.callsWorking === false ? "Calling/Baseband issue deduction" : undefined,
    },
    {
      id: "touch",
      category: "basic",
      title: "Touchscreen Functionality",
      isAnswered: rawAnswers.touchWorking !== undefined && rawAnswers.touchWorking !== null,
      isPositive: rawAnswers.touchWorking === true || rawAnswers.touch === "yes" || rawAnswers.touch === true,
      customerAnswer:
        rawAnswers.touchWorking === true || rawAnswers.touch === "yes" || rawAnswers.touch === true
          ? "Touch Working Smoothly"
          : rawAnswers.touchWorking === false || rawAnswers.touch === "no"
          ? "Touch Not Responding / Ghost Touch"
          : "Not Explicitly Answered",
      deductionNote: rawAnswers.touchWorking === false ? "Full display replacement deduction" : undefined,
    },
    {
      id: "screen_original",
      category: "basic",
      title: "Original Factory Screen",
      isAnswered: rawAnswers.screenOriginal !== undefined && rawAnswers.screenOriginal !== null,
      isPositive: rawAnswers.screenOriginal === true || rawAnswers.screenOriginal === "yes",
      customerAnswer:
        rawAnswers.screenOriginal === true || rawAnswers.screenOriginal === "yes"
          ? "Original Screen (Never Replaced)"
          : rawAnswers.screenOriginal === false || rawAnswers.screenOriginal === "no"
          ? "Screen Was Changed / Duplicate Screen"
          : "Not Answered by Customer",
      deductionNote: rawAnswers.screenOriginal === false ? "Aftermarket display deduction" : undefined,
    },
    {
      id: "warranty",
      category: "basic",
      title: "Manufacturer Warranty Status",
      isAnswered: rawAnswers.underWarranty !== undefined && rawAnswers.underWarranty !== null,
      isPositive: rawAnswers.underWarranty === true,
      customerAnswer:
        rawAnswers.underWarranty === true
          ? "Under Active Brand Warranty (<11 Months)"
          : rawAnswers.underWarranty === false
          ? "Out of Warranty (Expired)"
          : "Customer Left Blank / Expired",
      deductionNote: !rawAnswers.underWarranty ? "Standard out-of-warranty adjustment" : undefined,
    },
    {
      id: "bill",
      category: "basic",
      title: "Valid GST / Brand Purchase Invoice",
      isAnswered: rawAnswers.validBill !== undefined && rawAnswers.validBill !== null,
      isPositive: rawAnswers.validBill === true,
      customerAnswer:
        rawAnswers.validBill === true
          ? "Original Tax Invoice Available"
          : rawAnswers.validBill === false
          ? "Bill Missing / Not Available"
          : "Customer Left Blank (No Bill Provided)",
      deductionNote: !rawAnswers.validBill ? "Missing purchase invoice adjustment" : undefined,
    },

    // 2. SCREEN & BODY DEFECTS
    {
      id: "screen_cracks",
      category: "screen_body",
      title: "Screen Glass Condition",
      isAnswered: true,
      isPositive: !(rawAnswers.selectedMajorDefects || []).includes("screen_broken"),
      customerAnswer: (rawAnswers.selectedMajorDefects || []).includes("screen_broken")
        ? "Customer Declared Screen Cracked / Broken"
        : "Declared: No Glass Cracks",
      deductionNote: (rawAnswers.selectedMajorDefects || []).includes("screen_broken") ? "Glass replacement deduction" : undefined,
    },
    {
      id: "screen_lines",
      category: "screen_body",
      title: "Display Lines / Dead Pixels / Spot",
      isAnswered: true,
      isPositive: !(rawAnswers.selectedMajorDefects || []).includes("screen_lines"),
      customerAnswer: (rawAnswers.selectedMajorDefects || []).includes("screen_lines")
        ? "Customer Declared Lines / Black Spots on Display"
        : "Declared: Clear Display, No Lines/Spots",
      deductionNote: (rawAnswers.selectedMajorDefects || []).includes("screen_lines") ? "OLED/LCD panel defect deduction" : undefined,
    },
    {
      id: "scratches",
      category: "screen_body",
      title: "Body / Screen Scratches",
      isAnswered: !!rawAnswers.scratchLevel,
      isPositive: rawAnswers.scratchLevel === "no_scratches" || !rawAnswers.scratchLevel,
      customerAnswer:
        rawAnswers.scratchLevel === "more_than_2"
          ? "Declared: Heavy / Multiple Scratches (>2)"
          : rawAnswers.scratchLevel === "1_2_scratches"
          ? "Declared: 1-2 Minor Scratches"
          : rawAnswers.scratchLevel === "no_scratches"
          ? "Declared: Flawless / Like New (No Scratches)"
          : "Customer Left Blank (Assumed Minor)",
      deductionNote: rawAnswers.scratchLevel === "more_than_2" ? "Cosmetic scratch grade deduction" : undefined,
    },
    {
      id: "dents",
      category: "screen_body",
      title: "Body Dents / Bezel Condition",
      isAnswered: !!rawAnswers.dentLevel,
      isPositive: rawAnswers.dentLevel === "no_dents" || !rawAnswers.dentLevel,
      customerAnswer:
        rawAnswers.dentLevel === "major_dents"
          ? "Declared: Major Dents / Bent Frame"
          : rawAnswers.dentLevel === "1_2_dents"
          ? "Declared: 1-2 Minor Dents"
          : rawAnswers.dentLevel === "no_dents"
          ? "Declared: No Dents / Pristine Bezel"
          : "Customer Left Blank",
      deductionNote: rawAnswers.dentLevel === "major_dents" ? "Housing body replacement deduction" : undefined,
    },
    {
      id: "back_panel",
      category: "screen_body",
      title: "Back Glass / Panel Condition",
      isAnswered: true,
      isPositive: !(rawAnswers.selectedMajorDefects || []).includes("panel_missing"),
      customerAnswer: (rawAnswers.selectedMajorDefects || []).includes("panel_missing")
        ? "Customer Declared Back Panel Broken / Loose"
        : "Declared: Back Panel Intact",
      deductionNote: (rawAnswers.selectedMajorDefects || []).includes("panel_missing") ? "Back glass replacement deduction" : undefined,
    },

    // 3. HARDWARE & FUNCTIONAL
    {
      id: "front_camera",
      category: "functional",
      title: "Front Selfie Camera",
      isAnswered: true,
      isPositive: !(rawAnswers.selectedFunctionalIssues || []).includes("front_camera"),
      customerAnswer: (rawAnswers.selectedFunctionalIssues || []).includes("front_camera")
        ? "Declared: Front Camera Faulty / Blurry"
        : "Declared: Working Properly",
    },
    {
      id: "back_camera",
      category: "functional",
      title: "Primary Rear Camera",
      isAnswered: true,
      isPositive: !(rawAnswers.selectedFunctionalIssues || []).includes("back_camera"),
      customerAnswer: (rawAnswers.selectedFunctionalIssues || []).includes("back_camera")
        ? "Declared: Rear Camera Faulty / Shaking"
        : "Declared: Working Properly",
    },
    {
      id: "battery",
      category: "functional",
      title: "Battery Health & Performance",
      isAnswered: true,
      isPositive: !(rawAnswers.selectedFunctionalIssues || []).includes("battery"),
      customerAnswer: (rawAnswers.selectedFunctionalIssues || []).includes("battery")
        ? "Declared: Battery Drains Fast / Service Warning"
        : "Declared: Good Battery Backup (>80%)",
    },
    {
      id: "biometrics",
      category: "functional",
      title: "Fingerprint Scanner / Face ID",
      isAnswered: true,
      isPositive:
        !(rawAnswers.selectedFunctionalIssues || []).includes("fingerprint") &&
        !(rawAnswers.selectedFunctionalIssues || []).includes("face_id"),
      customerAnswer:
        (rawAnswers.selectedFunctionalIssues || []).includes("fingerprint") ||
        (rawAnswers.selectedFunctionalIssues || []).includes("face_id")
          ? "Declared: Biometric / Face ID Not Working"
          : "Declared: Working Properly",
    },
    {
      id: "speaker_mic",
      category: "functional",
      title: "Speaker & Microphone",
      isAnswered: true,
      isPositive:
        !(rawAnswers.selectedFunctionalIssues || []).includes("speaker") &&
        !(rawAnswers.selectedFunctionalIssues || []).includes("mic"),
      customerAnswer:
        (rawAnswers.selectedFunctionalIssues || []).includes("speaker") ||
        (rawAnswers.selectedFunctionalIssues || []).includes("mic")
          ? "Declared: Speaker / Microphone Crackling or Silent"
          : "Declared: Audio Loud & Clear",
    },
    {
      id: "wifi_bluetooth",
      category: "functional",
      title: "Wi-Fi & Bluetooth Connectivity",
      isAnswered: true,
      isPositive:
        !(rawAnswers.selectedFunctionalIssues || []).includes("wifi") &&
        !(rawAnswers.selectedFunctionalIssues || []).includes("bluetooth"),
      customerAnswer:
        (rawAnswers.selectedFunctionalIssues || []).includes("wifi") ||
        (rawAnswers.selectedFunctionalIssues || []).includes("bluetooth")
          ? "Declared: Connectivity Issues (Cannot Connect)"
          : "Declared: Working Properly",
    },

    // 4. ACCESSORIES
    {
      id: "charger",
      category: "accessories",
      title: "Original Fast Charger / Cable",
      isAnswered: true,
      isPositive: (rawAnswers.selectedAccessories || []).includes("charger"),
      customerAnswer: (rawAnswers.selectedAccessories || []).includes("charger")
        ? "Original Charger Declared Available"
        : "Customer Declared Missing Charger",
      deductionNote: !(rawAnswers.selectedAccessories || []).includes("charger") ? "Original charger deduction applied" : undefined,
    },
    {
      id: "box",
      category: "accessories",
      title: "Original Retail Box with Matching IMEI",
      isAnswered: true,
      isPositive: (rawAnswers.selectedAccessories || []).includes("box"),
      customerAnswer: (rawAnswers.selectedAccessories || []).includes("box")
        ? "Original Packaging Box Declared Available"
        : "Customer Declared Missing Box",
      deductionNote: !(rawAnswers.selectedAccessories || []).includes("box") ? "Original box deduction applied" : undefined,
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
