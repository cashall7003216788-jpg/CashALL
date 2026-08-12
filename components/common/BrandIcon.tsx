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
      ) : fallbackType === "LAPTOP" ? (
        <Laptop className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black group-hover:scale-110 transition-transform" />
      ) : (
        <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-brand-black group-hover:scale-110 transition-transform" />
      )}
    </div>
  );
}
