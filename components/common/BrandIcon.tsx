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
  className = "w-14 h-14",
  imageClassName = "max-h-10 max-w-10",
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
        <Laptop className="w-6 h-6 text-brand-black group-hover:scale-110 transition-transform" />
      ) : (
        <Smartphone className="w-6 h-6 text-brand-black group-hover:scale-110 transition-transform" />
      )}
    </div>
  );
}
