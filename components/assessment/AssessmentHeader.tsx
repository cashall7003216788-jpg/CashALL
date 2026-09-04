"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

interface AssessmentHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle?: string;
  onBack?: () => void;
  canGoBack?: boolean;
}

export function AssessmentHeader({
  currentStep,
  totalSteps,
  stepTitle,
  stepSubtitle,
  onBack,
  canGoBack = true,
}: AssessmentHeaderProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-subtleCard mb-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {canGoBack && onBack && currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Step {currentStep} of {totalSteps}
            </span>
            <h1 className="text-base sm:text-lg font-black text-gray-900 mt-1">
              {stepTitle}
            </h1>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-black text-gray-500">{percentage}% Completed</span>
          <div className="w-24 sm:w-36 bg-gray-100 rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {stepSubtitle && (
        <p className="text-xs text-gray-500 border-t border-gray-100 pt-2">
          {stepSubtitle}
        </p>
      )}
    </div>
  );
}
