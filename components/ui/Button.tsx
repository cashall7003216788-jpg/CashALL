import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    // Primary CTA: Yellow background, Black text (Core CashALL brand)
    primary:
      "bg-brand-yellow text-brand-black hover:bg-brand-yellowHover focus:ring-brand-yellow shadow-yellowGlow",
    // Secondary: Black background, White text
    secondary:
      "bg-brand-black text-white hover:bg-brand-dark focus:ring-brand-black shadow-subtleCard",
    // Tertiary: White background, Light border, dark text
    tertiary:
      "bg-white text-brand-black border border-brand-border hover:bg-brand-bg hover:border-gray-300 focus:ring-gray-400",
    outline:
      "bg-transparent border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white focus:ring-brand-black",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs shadow-sm",
    md: "px-5 py-2.5 text-sm shadow-sm",
    lg: "px-7 py-3.5 text-base font-bold shadow-md",
  };

  return (
    <button
      className={twMerge(
        clsx(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)
      )}
      {...props}
    >
      {children}
    </button>
  );
}
