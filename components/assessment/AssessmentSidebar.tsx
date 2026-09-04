"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Truck, Zap, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface AssessmentSidebarProps {
  deviceName: string;
  deviceImageUrl?: string | null;
  storageOrSpecs?: string;
  basePrice: number;
  estimatedPrice?: number;
  onNext: () => void;
  nextButtonText?: string;
  isNextDisabled?: boolean;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  deductionBreakdown?: { label: string; amount: number }[];
  showLivePrice?: boolean;
}

export function AssessmentSidebar({
  deviceName,
  deviceImageUrl,
  storageOrSpecs,
  basePrice,
  estimatedPrice,
  onNext,
  nextButtonText = "Continue",
  isNextDisabled = false,
  onBack,
  currentStep,
  totalSteps,
  deductionBreakdown = [],
  showLivePrice = false,
}: AssessmentSidebarProps) {
  const isFinalStep = currentStep === totalSteps;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-premium sticky top-24 space-y-6">
      {/* DEVICE SUMMARY */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-50 rounded-2xl p-2 border border-gray-100 flex items-center justify-center">
          {deviceImageUrl ? (
            <Image
              src={deviceImageUrl}
              alt={deviceName}
              fill
              sizes="80px"
              className="object-contain p-1"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
            CashALL Valuation
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 truncate mt-1">
            {deviceName}
          </h2>
          {storageOrSpecs && (
            <p className="text-xs text-gray-500 font-semibold">{storageOrSpecs}</p>
          )}
        </div>
      </div>

      {/* VALUATION STATUS CARD (HIDES DECREASING STEP-BY-STEP CALCULATION) */}
      {showLivePrice && estimatedPrice !== undefined ? (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100/80">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Estimated Selling Price
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-price">
              ₹{estimatedPrice.toLocaleString("en-IN")}
            </span>
            {basePrice > estimatedPrice && (
              <span className="text-xs text-gray-400 line-through font-semibold">
                ₹{basePrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <p className="text-[11px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Best market valuation guaranteed
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Valuation Range
            </span>
            <span className="text-[10px] font-bold text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/30 px-2.5 py-0.5 rounded-full">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-brand-yellow tracking-tight font-price">
              Up to ₹{basePrice.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-300 font-medium mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
              <span>Exact final payout revealed after evaluation</span>
            </p>
          </div>

          {/* EVALUATION PROGRESS BAR */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-yellow h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((currentStep / totalSteps) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
              <span>Diagnostic Progress</span>
              <span className="text-brand-yellow">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* DEDUCTIONS / ADJUSTMENTS LIST: ONLY SHOWN IF EXPLICITLY PERMITTED VIA showLivePrice */}
      {showLivePrice && deductionBreakdown.length > 0 && (
        <div className="space-y-2 text-xs">
          <span className="font-bold text-gray-600 block text-[11px] uppercase tracking-wider">
            Price Adjustments
          </span>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {deductionBreakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-gray-600">
                <span className="truncate pr-2">{item.label}</span>
                <span className="font-bold text-red-500 shrink-0">
                  -₹{item.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION CTA */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
            isNextDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : "bg-brand-yellow hover:bg-brand-yellowHover text-brand-black shadow-md hover:shadow-lg active:scale-[0.99]"
          }`}
        >
          <span>{nextButtonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {currentStep > 1 && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 px-4 text-xs font-bold text-gray-500 hover:text-gray-900 text-center transition"
          >
            ← Previous Step
          </button>
        )}
      </div>

      {/* TRUST BADGES */}
      <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-500">
        <div className="flex flex-col items-center">
          <Zap className="w-4 h-4 text-brand-yellow mb-1" />
          <span className="font-bold">Instant Pay</span>
        </div>
        <div className="flex flex-col items-center">
          <Truck className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="font-bold">Free Pickup</span>
        </div>
        <div className="flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-blue-600 mb-1" />
          <span className="font-bold">100% Safe</span>
        </div>
      </div>
    </div>
  );
}
