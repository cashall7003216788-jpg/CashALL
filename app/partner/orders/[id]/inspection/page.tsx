"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Upload,
} from "lucide-react";

export default function PartnerInspectionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [inspectorName, setInspectorName] = useState("CashALL Partner Exec");
  const [imei1, setImei1] = useState("");
  const [imei2, setImei2] = useState("");
  const [revisedPrice, setRevisedPrice] = useState("");
  const [priceDifferenceReason, setPriceDifferenceReason] = useState("");
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flaggedWarning, setFlaggedWarning] = useState(false);

  // 15-Point Inspection Checklist States
  const [checklist, setChecklist] = useState({
    displayOk: true,
    touchOk: true,
    camerasOk: true,
    speakersOk: true,
    microphoneOk: true,
    chargingOk: true,
    buttonsOk: true,
    biometricsOk: true,
    wifiBluetoothOk: true,
    batteryHealthOk: true,
    noBodyCracks: true,
    noWaterDamage: true,
    originalScreen: true,
    originalBattery: true,
    boxChargerIncluded: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddPhoto = () => {
    if (photoUrlInput.trim()) {
      setPhotos((prev) => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput("");
    } else {
      // Default demo photo fallback
      setPhotos((prev) => [...prev, `https://cashall.in/uploads/inspection_${Date.now()}.jpg`]);
    }
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imei1.replace(/\D/g, "").length < 14) {
      setError("Please enter a valid 15-digit IMEI 1.");
      return;
    }
    if (!revisedPrice || Number(revisedPrice) < 0) {
      setError("Please enter a valid negotiated price.");
      return;
    }
    if (photos.length === 0) {
      setError("At least 1 inspection photo evidence is required.");
      return;
    }

    setLoading(true);
    setError("");
    setFlaggedWarning(false);

    try {
      const res = await fetch(`/api/v1/orders/${params.id}/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectorName,
          imei1: imei1.replace(/\D/g, ""),
          imei2: imei2 ? imei2.replace(/\D/g, "") : undefined,
          physicalAnswers: checklist,
          revisedPrice: Number(revisedPrice),
          priceDifferenceReason,
          photoUrls: photos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit inspection.");
      }

      if (data.data?.imeiVerification?.status === "FLAGGED") {
        setFlaggedWarning(true);
        setError("CRITICAL: Device IMEI flagged as stolen/blacklisted. Transaction STOPPED.");
        return;
      }

      // Submit Final Offer
      await fetch(`/api/v1/orders/${params.id}/final-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalPrice: Number(revisedPrice),
          reason: priceDifferenceReason || "Physical inspection completed.",
        }),
      });

      router.push(`/partner/orders/${params.id}/verification`);
    } catch (err: any) {
      setError(err.message || "An error occurred during inspection submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 max-w-xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h1 className="text-base font-black text-white">Device Physical Inspection</h1>
          <p className="text-[11px] text-gray-400">Record IMEI, test hardware, upload evidence</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
          <ClipboardCheck className="w-5 h-5 text-brand-yellow" />
        </div>
      </div>

      {flaggedWarning && (
        <div className="bg-red-950 border border-red-800 text-red-300 p-4 rounded-2xl text-xs font-bold space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm">TRANSACTION HALTED — IMEI FLAGGED</span>
          </div>
          <p>
            The entered IMEI (1) has been flagged as blacklisted or reported stolen/lost.
            As per CashALL policy, this transaction cannot proceed further.
          </p>
        </div>
      )}

      {error && !flaggedWarning && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitInspection} className="space-y-6">
        {/* IMEI Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Device IMEI Verification</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                IMEI 1 (Required - 15 Digits) *
              </label>
              <input
                type="text"
                placeholder="e.g. 864521049281745"
                maxLength={15}
                value={imei1}
                onChange={(e) => setImei1(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                IMEI 2 (Optional for Dual SIM)
              </label>
              <input
                type="text"
                placeholder="e.g. 864521049281746"
                maxLength={15}
                value={imei2}
                onChange={(e) => setImei2(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 15-Point Hardware Checklist */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider">
            15-Point Hardware Condition Checklist
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(checklist).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleCheck(key as any)}
                className={`p-3 rounded-xl text-left font-bold flex items-center justify-between border transition-all ${
                  val
                    ? "bg-green-950/40 border-green-800/80 text-green-300"
                    : "bg-red-950/30 border-red-900/60 text-red-400"
                }`}
              >
                <span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md uppercase font-black">
                  {val ? "PASS" : "DEFECT"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Evidence Upload */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-4 h-4" />
            <span>Inspection Photo Evidence</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste photo URL or click Capture"
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              className="flex-grow bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-brand-yellow font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Photo</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {photos.map((ph, idx) => (
              <div key={idx} className="bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-[11px] text-gray-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>Photo #{idx + 1} Attached</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final Price Negotiation */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-black text-brand-yellow uppercase tracking-wider">
            Final Negotiated Valuation
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Final Agreed Purchase Price (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 49500"
                value={revisedPrice}
                onChange={(e) => setRevisedPrice(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-base text-brand-yellow font-black p-3 rounded-xl focus:border-brand-yellow focus:outline-none font-price"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Reason for Price Difference (If any)
              </label>
              <textarea
                placeholder="e.g. Minor scratches on back glass panel."
                value={priceDifferenceReason}
                onChange={(e) => setPriceDifferenceReason(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-brand-yellow focus:outline-none h-20"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || flaggedWarning}
          className="w-full py-4 bg-brand-yellow text-brand-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-yellowHover shadow-yellowGlow transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Verifying IMEI & Submitting...</span>
          ) : (
            <>
              <span>Submit Inspection & Final Offer</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
