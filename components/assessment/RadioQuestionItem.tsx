"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioQuestionItemProps {
  id: string;
  questionNumber?: number | string;
  question: string;
  hint?: string;
  options: RadioOption[] | string[];
  selectedValue: string | boolean | null;
  onSelect: (val: any) => void;
  required?: boolean;
}

export function RadioQuestionItem({
  id,
  questionNumber,
  question,
  hint,
  options,
  selectedValue,
  onSelect,
  required = true,
}: RadioQuestionItemProps) {
  // Normalize options into { value, label }
  const normalizedOptions: RadioOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const isAnswered = selectedValue !== null && selectedValue !== undefined && selectedValue !== "";

  return (
    <div id={id} className="py-4 sm:py-5 border-b border-gray-100 last:border-b-0 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
            {questionNumber && <span className="text-gray-400 mr-1.5">{questionNumber}.</span>}
            {question}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {hint && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{hint}</p>}
        </div>

        <div>
          {isAnswered ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Answered
            </span>
          ) : (
            required && (
              <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Required
              </span>
            )
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 pt-1">
        {normalizedOptions.map((opt) => {
          let isSelected = false;
          if (typeof selectedValue === "boolean") {
            isSelected =
              (opt.value.toLowerCase() === "yes" && selectedValue === true) ||
              (opt.value.toLowerCase() === "no" && selectedValue === false);
          } else {
            isSelected = selectedValue === opt.value;
          }

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                if (opt.value.toLowerCase() === "yes") onSelect(true);
                else if (opt.value.toLowerCase() === "no") onSelect(false);
                else onSelect(opt.value);
              }}
              className={`px-5 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center min-w-[90px] ${
                isSelected
                  ? opt.value.toLowerCase() === "no"
                    ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                    : "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
