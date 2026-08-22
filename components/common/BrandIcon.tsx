"use client";

import React, { useState } from "react";
import { Smartphone, Laptop, Tablet } from "lucide-react";

interface BrandIconProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackType?: "MOBILE" | "LAPTOP" | "TABLET";
}

export function BrandIcon({
  name,
  logoUrl,
  className = "w-20 h-20 sm:w-24 sm:h-24",
  imageClassName = "max-h-16 max-w-16 sm:max-h-20 sm:max-w-20",
  fallbackType = "MOBILE",
}: BrandIconProps) {
  const [error, setError] = useState(false);

  // High-fidelity SVG / Badge renderer for every major brand
  const renderBrandBadge = () => {
    const brandUpper = (name || "").toUpperCase();

    // 1. APPLE (Clean SVG Vector)
    if (brandUpper.includes("APPLE")) {
      return (
        <svg className="w-9 h-9 sm:w-11 sm:h-11 text-black fill-current" viewBox="0 0 170 170">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.04.12-9.91-1.96-14.6-6.23-3.23-2.87-7.14-7.55-11.75-14.04-6.42-9.03-11.45-19.51-15.09-31.44-3.64-11.93-5.46-23.36-5.46-34.29 0-14.28 3.57-26.04 10.71-35.29 7.14-9.25 16.27-13.98 27.39-14.2 4.69 0 9.87 1.25 15.54 3.75 5.67 2.5 9.71 3.75 12.12 3.75 2.18 0 6.34-1.31 12.48-3.92 6.14-2.61 11.44-3.8 15.9-3.56 12.01.71 21.49 4.96 28.44 12.76-10.71 6.53-15.93 15.58-15.66 27.15.27 10.71 4.39 19.4 12.36 26.07 4.12 3.49 8.78 6.05 13.98 7.68-2.62 7.74-6.14 15.74-10.56 24.01zM119.22 31.84c0-6.87 2.51-13.52 7.53-19.95 5.02-6.43 11.39-10.42 19.11-11.97.27 1.09.41 2.07.41 2.95 0 6.98-2.56 13.74-7.68 20.28-5.12 6.54-11.55 10.44-19.29 11.69-.08-1.09-.08-2.09-.08-3.00z" />
        </svg>
      );
    }

    // 2. ONEPLUS (Red 1+ Badge)
    if (brandUpper.includes("ONEPLUS")) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-tighter shadow-sm border border-red-700">
            1+
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-red-600 mt-1 tracking-wider uppercase">ONEPLUS</span>
        </div>
      );
    }

    // 3. SAMSUNG
    if (brandUpper.includes("SAMSUNG")) {
      return <span className="text-sm sm:text-base font-black tracking-widest text-blue-700 font-sans uppercase">SAMSUNG</span>;
    }

    // 4. DELL
    if (brandUpper.includes("DELL")) {
      return <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-blue-700 font-sans">DELL</span>;
    }

    // 5. HP
    if (brandUpper.includes("HP")) {
      return <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-blue-600 font-serif">hp</span>;
    }

    // 6. LENOVO
    if (brandUpper.includes("LENOVO")) {
      return <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs sm:text-sm font-black tracking-wider uppercase font-sans">Lenovo</span>;
    }

    // 7. ASUS
    if (brandUpper.includes("ASUS")) {
      return <span className="text-lg sm:text-xl font-extrabold tracking-widest text-blue-900 font-mono">ASUS</span>;
    }

    // 8. ACER
    if (brandUpper.includes("ACER")) {
      return <span className="text-xl sm:text-2xl font-black tracking-tight text-green-600 font-sans">acer</span>;
    }

    // 9. MSI
    if (brandUpper.includes("MSI")) {
      return <span className="text-xl sm:text-2xl font-black tracking-wider text-red-600 font-mono">MSI</span>;
    }

    // 10. LG
    if (brandUpper.includes("LG")) {
      return <span className="text-xl sm:text-2xl font-black tracking-tight text-red-700 font-sans">LG</span>;
    }

    // 11. GOOGLE
    if (brandUpper.includes("GOOGLE")) {
      return <span className="text-lg sm:text-xl font-extrabold tracking-tight text-blue-600 font-sans">Google</span>;
    }

    // 12. XIAOMI / MI
    if (brandUpper.includes("XIAOMI") || brandUpper.includes("MI")) {
      return <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs sm:text-sm font-black tracking-wider font-sans">mi</span>;
    }

    // 13. HUAWEI
    if (brandUpper.includes("HUAWEI")) {
      return (
        <div className="flex flex-col items-center justify-center">
          <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 300 300">
            <g transform="translate(150, 115)">
              <path d="M 0 -75 C -11 -45 -11 -10 0 0 C 11 -10 11 -45 0 -75 Z" fill="#E4002B" />
              <path d="M 0 0 C -18 -12 -38 -36 -28 -68 C -15 -62 -4 -42 0 0 Z" fill="#E4002B" />
              <path d="M 0 0 C 18 -12 38 -36 28 -68 C 15 -62 4 -42 0 0 Z" fill="#E4002B" />
              <path d="M 0 0 C -28 -8 -58 -22 -52 -54 C -38 -52 -18 -32 0 0 Z" fill="#E4002B" />
              <path d="M 0 0 C 28 -8 58 -22 52 -54 C 38 -52 18 -32 0 0 Z" fill="#E4002B" />
              <path d="M 0 0 C -34 -2 -70 -6 -68 -36 C -54 -38 -28 -20 0 0 Z" fill="#E4002B" />
              <path d="M 0 0 C 34 -2 70 -6 68 -36 C 54 -38 28 -20 0 0 Z" fill="#E4002B" />
              <path d="M 0 0 C -36 4 -74 12 -75 -15 C -62 -22 -34 -8 0 0 Z" fill="#E4002B" />
              <path d="M 0 0 C 36 4 74 12 75 -15 C 62 -22 34 -8 0 0 Z" fill="#E4002B" />
            </g>
            <text x="150" y="240" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="34" fontWeight="900" textAnchor="middle" letterSpacing="4" fill="#000000">HUAWEI</text>
          </svg>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center">
        {fallbackType === "LAPTOP" ? (
          <Laptop className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black group-hover:scale-110 transition-transform" />
        ) : fallbackType === "TABLET" ? (
          <Tablet className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black group-hover:scale-110 transition-transform" />
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
