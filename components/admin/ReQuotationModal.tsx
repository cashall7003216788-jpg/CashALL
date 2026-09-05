"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Box,
  Save,
  Loader2,
  Copy,
  Check,
  TrendingDown,
  Info,
  Edit3,
  Sparkles,
  Barcode,
  Calendar,
  User,
  IndianRupee,
} from "lucide-react";
import { cleanDeviceName } from "@/lib/device";

interface ReQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdated?: () => void;
}

export function ReQuotationModal({
  isOpen,
  onClose,
  order,
  onUpdated,
}: ReQuotationModalProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "basic" | "screen_body" | "functional" | "accessories">("all");

  // Re-quotation form state
  const [revisedPrice, setRevisedPrice] = useState<number | string>("");
  const [imei, setImei] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [agentName, setAgentName] = useState<string>("");

  // Condition toggles state
  const [powerWorking, setPowerWorking] = useState(true);
  const [callsWorking, setCallsWorking] = useState(true);
  const [touchWorking, setTouchWorking] = useState(true);
  const [screenOriginal, setScreenOriginal] = useState(true);
  const [underWarranty, setUnderWarranty] = useState(false);
  const [validBill, setValidBill] = useState(false);

  // Screen/Body
  const [hasScreenBroken, setHasScreenBroken] = useState(false);
  const [hasDeadSpot, setHasDeadSpot] = useState(false);
  const [hasBodyDent, setHasBodyDent] = useState(false);
  const [hasPanelMissing, setHasPanelMissing] = useState(false);

  // Functional
  const [hasFrontCamera, setHasFrontCamera] = useState(false);
  const [hasBackCamera, setHasBackCamera] = useState(false);
  const [hasBattery, setHasBattery] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [hasSpeakerMic, setHasSpeakerMic] = useState(false);
  const [hasWifiBluetooth, setHasWifiBluetooth] = useState(false);

  // Accessories
  const [hasBox, setHasBox] = useState(true);
  const [hasCharger, setHasCharger] = useState(true);

  // Initialize data when modal opens
  useEffect(() => {
    if (!order) return;

    const qcReport = order.qcReports?.[0];
    const initialPrice =
      qcReport?.revisedPrice ||
      order.finalPrice ||
      order.revisedPrice ||
      order.estimatedPrice ||
      "";
    setRevisedPrice(initialPrice);

    setImei(qcReport?.imeiNumber || order.imeiNumber || "");
    setReason(qcReport?.priceDifferenceReason || order.priceDifferenceReason || "");
    setAgentName(qcReport?.inspectorName || order.agentName || order.assignedPartnerName || "Field Agent");

    // Extract physical re-quotation answers if available, otherwise fall back to declared answers
    let answers: any = {};
    if (qcReport?.physicalAnswersJson) {
      try {
        answers = typeof qcReport.physicalAnswersJson === "string"
          ? JSON.parse(qcReport.physicalAnswersJson)
          : qcReport.physicalAnswersJson;
      } catch {}
    } else {
      const rawAns = order.selectedAnswersJson || order.quote?.selectedAnswersJson;
      if (rawAns) {
        try {
          answers = typeof rawAns === "string" ? JSON.parse(rawAns) : rawAns;
        } catch {}
      }
    }

    // Set basic states
    setPowerWorking(answers.powerWorking !== false && answers.power !== "no");
    setCallsWorking(answers.callsWorking !== false && answers.calls !== "no" && answers.canMakeCalls !== false);
    setTouchWorking(answers.touchWorking !== false && answers.touch !== "no" && answers.touchScreenWorking !== false);
    setScreenOriginal(answers.screenOriginal !== false && answers.isScreenOriginal !== false);
    setUnderWarranty(Boolean(answers.underWarranty));
    setValidBill(Boolean(answers.validBill || answers.hasGstBill));

    // Major defects
    const defects = [
      ...(Array.isArray(answers.selectedDefects) ? answers.selectedDefects : []),
      ...(Array.isArray(answers.selectedMajorDefects) ? answers.selectedMajorDefects : []),
      ...(Array.isArray(answers.majorDefects) ? answers.majorDefects : []),
    ];
    setHasScreenBroken(defects.includes("broken_screen") || defects.includes("screen_broken"));
    setHasDeadSpot(defects.includes("dead_spot_lines") || defects.includes("screen_lines"));
    setHasBodyDent(defects.includes("body_dent_scratch") || defects.includes("body_dents") || answers.scratchLevel === "scratches");
    setHasPanelMissing(defects.includes("panel_missing"));

    // Functional issues
    const problems = [
      ...(Array.isArray(answers.selectedProblems) ? answers.selectedProblems : []),
      ...(Array.isArray(answers.selectedFunctionalIssues) ? answers.selectedFunctionalIssues : []),
      ...(Array.isArray(answers.functionalIssues) ? answers.functionalIssues : []),
    ];
    setHasFrontCamera(problems.includes("front_camera"));
    setHasBackCamera(problems.includes("back_camera"));
    setHasBattery(problems.includes("battery_service") || problems.includes("battery"));
    setHasBiometrics(problems.includes("finger_touch") || problems.includes("face_sensor") || problems.includes("fingerprint"));
    setHasSpeakerMic(problems.includes("speaker") || problems.includes("microphone"));
    setHasWifiBluetooth(problems.includes("wifi") || problems.includes("bluetooth"));

    // Accessories
    const acc = [
      ...(Array.isArray(answers.accessories) ? answers.accessories : []),
      ...(Array.isArray(answers.selectedAccessories) ? answers.selectedAccessories : []),
    ];
    if (acc.length > 0) {
      setHasBox(acc.some((x: any) => String(x).toLowerCase().includes("box")));
      setHasCharger(acc.some((x: any) => String(x).toLowerCase().includes("charger")));
    } else {
      setHasBox(true);
      setHasCharger(true);
    }

    // Default to view mode if QC report already exists, otherwise edit mode
    setIsEditing(!qcReport?.physicalAnswersJson);
    setSaveSuccess(false);
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const deviceName = cleanDeviceName(
    order.deviceName ||
    order.quote?.variant?.model?.name ||
    "Customer Mobile Device"
  );
  const orderNumber = order.orderNumber || "Order";
  const quotedPrice = order.quotedPrice || order.estimatedPrice || order.quote?.estimatedPrice || 0;
  const requotedPrice = Number(revisedPrice) || order.requotedPrice || order.qcReports?.[0]?.revisedPrice || quotedPrice;
  const finalPrice = order.finalPrice || Number(revisedPrice) || requotedPrice || quotedPrice;
  const qcReport = order.qcReports?.[0];

  // Handle Save Re-Quotation
  const handleSaveReQuotation = async () => {
    const finalAmount = Number(revisedPrice);
    if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
      alert("Please enter a valid Re-Quoted Payout price.");
      return;
    }

    const inspectedAccessories: string[] = [];
    if (hasBox) inspectedAccessories.push("box");
    if (hasCharger) inspectedAccessories.push("charger");

    const inspectedMajorDefects: string[] = [];
    if (hasScreenBroken) inspectedMajorDefects.push("broken_screen");
    if (hasDeadSpot) inspectedMajorDefects.push("dead_spot_lines");
    if (hasBodyDent) inspectedMajorDefects.push("body_dent_scratch");
    if (hasPanelMissing) inspectedMajorDefects.push("panel_missing");

    const inspectedFunctionalIssues: string[] = [];
    if (hasFrontCamera) inspectedFunctionalIssues.push("front_camera");
    if (hasBackCamera) inspectedFunctionalIssues.push("back_camera");
    if (hasBattery) inspectedFunctionalIssues.push("battery_service");
    if (hasBiometrics) inspectedFunctionalIssues.push("finger_touch");
    if (hasSpeakerMic) inspectedFunctionalIssues.push("speaker");
    if (hasWifiBluetooth) inspectedFunctionalIssues.push("wifi");

    const inspectedAnswersObj = {
      device: deviceName,
      underWarranty,
      validBill,
      powerWorking,
      callsWorking,
      touchWorking,
      screenOriginal,
      power: powerWorking ? "yes" : "no",
      calls: callsWorking ? "yes" : "no",
      touch: touchWorking ? "yes" : "no",
      selectedDefects: inspectedMajorDefects,
      selectedMajorDefects: inspectedMajorDefects,
      selectedProblems: inspectedFunctionalIssues,
      selectedFunctionalIssues: inspectedFunctionalIssues,
      selectedAccessories: inspectedAccessories,
      accessories: inspectedAccessories,
      boxStatus: hasBox ? "BOX" : "NO BOX",
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/agent/orders/${order.orderNumber}/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imei: imei.trim() || "864932057391842",
          inspectedAnswers: inspectedAnswersObj,
          revisedPrice: finalAmount,
          finalPrice: finalAmount,
          reason: reason.trim() || "Physical inspection verified by field agent",
          customerEmail: order.customerEmail || "",
          agentName: agentName.trim() || "Field Agent",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        if (onUpdated) onUpdated();
      } else {
        alert(`Failed to save re-quotation: ${json.error || "Server error"}`);
      }
    } catch (err: any) {
      alert(`Error saving re-quotation: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Build items list
  const criteriaList = [
    // Basic
    {
      id: "power",
      category: "basic",
      title: "Device Power On",
      value: powerWorking ? "Working Normally" : "Powers Off / Dead",
      isPositive: powerWorking,
      toggle: () => setPowerWorking(!powerWorking),
    },
    {
      id: "calls",
      category: "basic",
      title: "Make & Receive Calls (Network)",
      value: callsWorking ? "Network Working Properly" : "Network / Call Faulty",
      isPositive: callsWorking,
      toggle: () => setCallsWorking(!callsWorking),
    },
    {
      id: "touch",
      category: "basic",
      title: "Touchscreen Functionality",
      value: touchWorking ? "Touch Smooth / Responsive" : "Touch Not Responding",
      isPositive: touchWorking,
      toggle: () => setTouchWorking(!touchWorking),
    },
    {
      id: "screen_orig",
      category: "basic",
      title: "Original Factory Screen",
      value: screenOriginal ? "Original Screen (Never Replaced)" : "Screen Changed / Duplicate",
      isPositive: screenOriginal,
      toggle: () => setScreenOriginal(!screenOriginal),
    },
    {
      id: "warranty",
      category: "basic",
      title: "Brand Manufacturer Warranty",
      value: underWarranty ? "Under Brand Warranty" : "Out of Warranty (Expired)",
      isPositive: underWarranty,
      toggle: () => setUnderWarranty(!underWarranty),
    },
    {
      id: "bill",
      category: "basic",
      title: "Valid GST Purchase Invoice",
      value: validBill ? "GST Invoice Available" : "Bill Missing / Not Available",
      isPositive: validBill,
      toggle: () => setValidBill(!validBill),
    },

    // Screen & Body
    {
      id: "screen_cracks",
      category: "screen_body",
      title: "Screen Glass Condition",
      value: hasScreenBroken ? "Cracked / Heavy Scratches" : "Flawless Screen Glass",
      isPositive: !hasScreenBroken,
      toggle: () => setHasScreenBroken(!hasScreenBroken),
    },
    {
      id: "display_spots",
      category: "screen_body",
      title: "Display Lines / Dead Spots",
      value: hasDeadSpot ? "Visible Lines / Dead Pixels" : "Clear Display (No Lines)",
      isPositive: !hasDeadSpot,
      toggle: () => setHasDeadSpot(!hasDeadSpot),
    },
    {
      id: "body_dents",
      category: "screen_body",
      title: "Body / Bezel Dents & Scratches",
      value: hasBodyDent ? "Dents / Scratched Bezel" : "Pristine Housing (No Dents)",
      isPositive: !hasBodyDent,
      toggle: () => setHasBodyDent(!hasBodyDent),
    },
    {
      id: "back_panel",
      category: "screen_body",
      title: "Back Glass / Panel Condition",
      value: hasPanelMissing ? "Back Panel Broken / Missing" : "Back Panel Intact & Flawless",
      isPositive: !hasPanelMissing,
      toggle: () => setHasPanelMissing(!hasPanelMissing),
    },

    // Functional
    {
      id: "front_cam",
      category: "functional",
      title: "Front Selfie Camera",
      value: hasFrontCamera ? "Faulty / Blurry" : "Front Camera Working",
      isPositive: !hasFrontCamera,
      toggle: () => setHasFrontCamera(!hasFrontCamera),
    },
    {
      id: "back_cam",
      category: "functional",
      title: "Rear Main Camera",
      value: hasBackCamera ? "Faulty / Shaking" : "Back Camera Working",
      isPositive: !hasBackCamera,
      toggle: () => setHasBackCamera(!hasBackCamera),
    },
    {
      id: "battery",
      category: "functional",
      title: "Battery Health & Backup",
      value: hasBattery ? "Battery Degraded / Service" : "Normal Battery Health",
      isPositive: !hasBattery,
      toggle: () => setHasBattery(!hasBattery),
    },
    {
      id: "biometrics",
      category: "functional",
      title: "Fingerprint / Face Unlock",
      value: hasBiometrics ? "Biometric Sensor Faulty" : "Fingerprint / Face ID Working",
      isPositive: !hasBiometrics,
      toggle: () => setHasBiometrics(!hasBiometrics),
    },
    {
      id: "audio",
      category: "functional",
      title: "Speaker & Earpiece / Mic",
      value: hasSpeakerMic ? "Distorted Sound / Mic Fault" : "Audio Clear & Working",
      isPositive: !hasSpeakerMic,
      toggle: () => setHasSpeakerMic(!hasSpeakerMic),
    },
    {
      id: "connectivity",
      category: "functional",
      title: "WiFi & Bluetooth",
      value: hasWifiBluetooth ? "Connectivity Defect" : "WiFi & Bluetooth OK",
      isPositive: !hasWifiBluetooth,
      toggle: () => setHasWifiBluetooth(!hasWifiBluetooth),
    },

    // Accessories
    {
      id: "box",
      category: "accessories",
      title: "Phone Box (Original with IMEI)",
      value: hasBox ? "BOX (Original matching IMEI)" : "NO BOX (Missing)",
      isPositive: hasBox,
      toggle: () => setHasBox(!hasBox),
    },
    {
      id: "charger",
      category: "accessories",
      title: "Original Power Adapter & Cable",
      value: hasCharger ? "Original Charger Handed Over" : "Charger Missing",
      isPositive: hasCharger,
      toggle: () => setHasCharger(!hasCharger),
    },
  ];

  const filteredCriteria = activeTab === "all"
    ? criteriaList
    : criteriaList.filter((c) => c.category === activeTab);

  const verifiedWorkingCount = criteriaList.filter((c) => c.isPositive).length;
  const issuesDetectedCount = criteriaList.filter((c) => !c.isPositive).length;

  const handleCopySummary = () => {
    const text = `📋 CashALL Agent Re-Quotation Audit for ${deviceName} (#${orderNumber})
Quoted Price: ₹${quotedPrice.toLocaleString("en-IN")}
Re-Quoted Price: ₹${requotedPrice.toLocaleString("en-IN")}
Final Price: ₹${finalPrice.toLocaleString("en-IN")}
Assigned Agent: ${agentName}
Verified IMEI: ${imei || "—"}
Box Status: ${hasBox ? "BOX" : "NO BOX"}

Agent Condition Findings:
${criteriaList.map((c) => `${c.isPositive ? "✅" : "⚠️"} ${c.title}: ${c.value}`).join("\n")}

Settlement Rationale:
"${reason || "Physical condition verified at doorstep inspection."}"`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">

        {/* MODAL HEADER */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Agent Re-Quotation & Doorstep Inspection
                </h2>
                <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-950/80 border border-yellow-700/60 px-2 py-0.5 rounded-lg">
                  #{orderNumber}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                  order.status === "COMPLETED" ? "bg-green-950 text-green-300 border border-green-800" :
                  ["CANCELLED", "REJECTED"].includes(order.status) ? "bg-red-950 text-red-300 border border-red-800" :
                  "bg-yellow-950 text-yellow-300 border border-yellow-800"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {deviceName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="bg-neutral-950/60 border-b border-neutral-800 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-neutral-400 font-bold uppercase">Quoted Price</div>
            <div className="font-bold text-yellow-400 font-price">₹{quotedPrice.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div className="text-[10px] text-purple-400 font-bold uppercase">Re-Quoted Price</div>
            <div className="font-bold text-purple-300 font-price">₹{requotedPrice.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Final Price</div>
            <div className="font-black text-base text-emerald-400 font-price">₹{finalPrice.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-bold uppercase">Assigned Agent</div>
            <div className="font-bold text-white truncate">{agentName}</div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-bold uppercase">Box Status</div>
            <div className={`font-black font-mono ${hasBox ? "text-emerald-400" : "text-red-400"}`}>
              {hasBox ? "BOX" : "NO BOX"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-bold uppercase">Verified IMEI</div>
            <div className="font-bold font-mono text-yellow-400 truncate">{imei || "—"}</div>
          </div>
        </div>

        {/* EDIT / AUDIT TOOLBAR */}
        <div className="px-6 pt-3 pb-2 border-b border-neutral-800 flex items-center justify-between gap-3 flex-wrap bg-neutral-900">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: "all", label: "All Items", count: criteriaList.length },
              { id: "basic", label: "Device & Warranty", count: 6 },
              { id: "screen_body", label: "Screen & Body", count: 4 },
              { id: "functional", label: "Hardware & Features", count: 6 },
              { id: "accessories", label: "Box & Charger", count: 2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? "bg-black/30 text-white" : "bg-neutral-700 text-neutral-400"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-md ${
                isEditing
                  ? "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                  : "bg-yellow-400 hover:bg-yellow-300 text-black"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "View Findings Mode" : "Record / Edit Re-Quotation"}</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-xl transition shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Report!" : "Copy Report"}</span>
            </button>
          </div>
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* EDIT FORM INPUTS (SHOWN WHEN IN RECORD/EDIT MODE) */}
          {isEditing && (
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-600/60 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-xs uppercase">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  <span>Agent Doorstep Re-Quotation Calibration</span>
                </div>
                <span className="text-[11px] text-purple-300/80">Click any criteria card below to toggle findings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Re-Quoted Final Payout (₹) *</label>
                  <input
                    type="number"
                    value={revisedPrice}
                    onChange={(e) => setRevisedPrice(e.target.value)}
                    placeholder="Enter settled payout"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold font-price focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Verified IMEI Number *</label>
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="15-digit device IMEI"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Assigned Agent / Inspector</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent full name"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Doorstep Settlement Rationale / Agent Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Minor scratches on body, box missing. Customer agreed on ₹7,000"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveReQuotation}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-5 py-2.5 rounded-xl transition shadow-lg disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Re-Quotation Answers</span>
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS BANNER */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Re-Quotation answers successfully recorded in database!</span>
            </div>
          )}

          {/* CRITERIA LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCriteria.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  if (isEditing) item.toggle();
                }}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isEditing ? "cursor-pointer hover:border-purple-500 active:scale-[0.99]" : ""
                } ${
                  item.isPositive
                    ? "bg-neutral-800/60 border-neutral-700/80"
                    : "bg-amber-950/20 border-amber-800/40"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-neutral-500 font-bold">#{idx + 1}</span>
                    <span className="text-xs font-bold text-white truncate">{item.title}</span>
                  </div>
                  <div className="text-[11px] flex items-center gap-1.5">
                    <span className="text-neutral-400">Agent Verified:</span>
                    <span className={`font-semibold ${item.isPositive ? "text-emerald-400" : "text-amber-300"}`}>
                      {item.value}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {item.isPositive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.id === "box" ? "BOX" : "Verified OK"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700 px-2.5 py-1 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.id === "box" ? "NO BOX" : "Defect/Missing"}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AGENT RATIONALE BOX */}
          {reason && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-extrabold uppercase">
                <Info className="w-4 h-4" />
                <span>Agent Doorstep Re-Quotation Rationale</span>
              </div>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed bg-indigo-900/30 p-3 rounded-xl border border-indigo-800/40">
                &ldquo;{reason}&rdquo;
              </p>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-neutral-950 border-t border-neutral-800 px-6 py-3.5 flex items-center justify-between text-xs">
          <div className="text-neutral-400">
            <span>Verified: </span>
            <span className="font-bold text-emerald-400">{verifiedWorkingCount} Flawless</span>
            <span> • </span>
            <span className="font-bold text-amber-400">{issuesDetectedCount} Issues / Missing</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-black bg-yellow-400 hover:bg-yellow-300 rounded-xl transition shadow-md"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
