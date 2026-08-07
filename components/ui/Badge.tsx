import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "yellow";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const variants = {
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    danger: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
    yellow: "bg-brand-yellow/20 text-black border border-brand-yellow/40 font-semibold",
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))}>
      {children}
    </span>
  );
}
