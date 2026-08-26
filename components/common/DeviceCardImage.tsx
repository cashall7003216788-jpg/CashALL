"use client";

import React, { useState } from "react";
import { Smartphone, Laptop, Tablet } from "lucide-react";

interface DeviceCardImageProps {
  src?: string | null;
  alt: string;
  category?: "MOBILE" | "LAPTOP" | "TABLET" | string;
  className?: string;
}

export function DeviceCardImage({
  src,
  alt,
  category = "MOBILE",
  className = "object-contain max-h-24 w-auto group-hover:scale-105 transition-transform",
}: DeviceCardImageProps) {
  const [hasError, setHasError] = useState(false);

  const renderFallbackIcon = () => {
    switch (category?.toUpperCase()) {
      case "LAPTOP":
        return <Laptop className="w-12 h-12 text-gray-400 group-hover:text-brand-black transition-colors" />;
      case "TABLET":
        return <Tablet className="w-12 h-12 text-gray-400 group-hover:text-brand-black transition-colors" />;
      case "MOBILE":
      default:
        return <Smartphone className="w-10 h-10 text-gray-400 group-hover:text-brand-black transition-colors" />;
    }
  };

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        {renderFallbackIcon()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
