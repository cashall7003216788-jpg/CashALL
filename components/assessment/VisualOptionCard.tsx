"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

interface VisualOptionCardProps {
  id: string;
  label: string;
  imageUrl?: string;
  iconNode?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  sublabel?: string;
  multiSelect?: boolean;
}

export function VisualOptionCard({
  id,
  label,
  imageUrl,
  iconNode,
  selected,
  onClick,
  sublabel,
  multiSelect = true,
}: VisualOptionCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer w-full bg-white select-none ${
        selected
          ? "border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20"
          : "border-gray-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 bg-white text-gray-800"
      }`}
    >
      {/* SELECTION BADGE (TOP RIGHT) */}
      <div
        className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
          selected
            ? "bg-emerald-600 text-white shadow-sm scale-100"
            : "border-2 border-gray-300 text-transparent group-hover:border-emerald-400 scale-90"
        }`}
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>

      {/* 1:1 ASPECT RATIO CENTERED IMAGE OR CUSTOM ILLUSTRATION */}
      <div className="w-full flex items-center justify-center py-2">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 aspect-square flex items-center justify-center">
          {iconNode ? (
            <div className="w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              {iconNode}
            </div>
          ) : imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={label}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-contain transition-transform duration-200 group-hover:scale-105"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold px-2 text-center">
              {label.slice(0, 16)}
            </div>
          )}
        </div>
      </div>

      {/* LABEL BELOW */}
      <div className="mt-2 w-full">
        <span
          className={`block text-xs sm:text-sm font-bold leading-snug line-clamp-2 transition-colors ${
            selected ? "text-emerald-950 font-extrabold" : "text-gray-900 group-hover:text-black"
          }`}
        >
          {label}
        </span>
        {sublabel && (
          <span className="block text-[11px] text-gray-500 mt-0.5 line-clamp-1">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}
