"use client";

import React, { useState } from "react";
import { Smartphone, Laptop } from "lucide-react";

interface BrandIconProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackType?: "MOBILE" | "LAPTOP";
}

export function BrandIcon({
  name,
  logoUrl,
  className = "w-20 h-20 sm:w-24 sm:h-24",
  imageClassName = "max-h-16 max-w-16 sm:max-h-20 sm:max-w-20",
  fallbackType = "MOBILE",
}: BrandIconProps) {
  const [error, setError] = useState(false);

  // Helper for brand typography badge when image fails or is absent
  const renderBrandBadge = () => {
    const brandUpper = (name || "").toUpperCase();
    if (brandUpper.includes("DELL")) {
      return <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-blue-700 font-sans">DELL</span>;
    }
    if (brandUpper.includes("HP")) {
      return <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-blue-600 font-serif">hp</span>;
    }
    if (brandUpper.includes("LENOVO")) {
      return <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs sm:text-sm font-black tracking-wider uppercase font-sans">Lenovo</span>;
    }
    if (brandUpper.includes("ASUS")) {
      return <span className="text-lg sm:text-xl font-extrabold tracking-widest text-blue-900 font-mono">ASUS</span>;
    }
    if (brandUpper.includes("ACER")) {
      return <span className="text-xl sm:text-2xl font-black tracking-tight text-green-600 font-sans">acer</span>;
    }
    if (brandUpper.includes("MSI")) {
      return <span className="text-xl sm:text-2xl font-black tracking-wider text-red-600 font-mono">MSI</span>;
    }
    if (brandUpper.includes("LG")) {
      return <span className="text-xl sm:text-2xl font-black tracking-tight text-red-700 font-sans">LG</span>;
    }
    if (brandUpper.includes("APPLE")) {
      return <span className="text-2xl sm:text-3xl font-black text-gray-900 font-sans"></span>;
    }
    if (brandUpper.includes("SAMSUNG")) {
      return <span className="text-base sm:text-lg font-black tracking-widest text-blue-700 font-sans uppercase">SAMSUNG</span>;
    }

    return (
      <div className="flex flex-col items-center justify-center">
        {fallbackType === "LAPTOP" ? (
          <Laptop className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black group-hover:scale-110 transition-transform" />
        ) : (
          <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black group-hover:scale-110 transition-transform" />
        )}
        <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">{name}</span>
      </div>
    );
  };

  return (
    <div
      className={`${className} rounded-2xl bg-white flex items-center justify-center p-2 border border-gray-100 shadow-sm relative shrink-0 transition-transform`}
    >
      {logoUrl && !error ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          onError={() => setError(true)}
          className={`${imageClassName} object-contain transition-transform group-hover:scale-105`}
        />
      ) : (
        renderBrandBadge()
      )}
    </div>
  );
}
