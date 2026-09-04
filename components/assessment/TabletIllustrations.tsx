"use client";

import React from "react";

export type TabletScreenVariant =
  | "no_scratches"
  | "1_2_scratches"
  | "more_than_2"
  | "cracked_broken"
  | "no_discoloration"
  | "minor_discoloration"
  | "major_discoloration"
  | "no_spots"
  | "minor_spots"
  | "heavy_spots"
  | "lines"
  | "light_leaks";

export function TabletScreenIllustration({ variant }: { variant: TabletScreenVariant }) {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full max-w-[84px] max-h-[68px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tablet Outer Body (Chassis) */}
      <rect x="5" y="6" width="90" height="68" rx="8" fill="#F3F4F6" stroke="#1F2937" strokeWidth="2.5" />
      {/* Bezel */}
      <rect x="9" y="10" width="82" height="60" rx="5" fill="#111827" />
      {/* Front Camera Dot on top bezel */}
      <circle cx="50" cy="8" r="1.2" fill="#6B7280" />

      {/* Screen Area */}
      <rect x="13" y="14" width="74" height="52" rx="3" fill="#FFFFFF" />

      {/* Variant Details */}
      {variant === "no_scratches" && (
        <g>
          {/* Sparkles */}
          <path d="M40 32L42 26L44 32L50 34L44 36L42 42L40 36L34 34Z" fill="#10B981" />
          <path d="M60 44L61 40L62 44L66 45L62 46L61 50L60 46L56 45Z" fill="#10B981" />
          <path d="M26 48L27 45L28 48L31 49L28 50L27 53L26 50L23 49Z" fill="#34D399" />
          {/* Gloss Reflection */}
          <path d="M15 16L45 16L20 64L15 64Z" fill="#F3F4F6" opacity="0.6" />
        </g>
      )}

      {variant === "1_2_scratches" && (
        <g stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round">
          <line x1="32" y1="28" x2="48" y2="44" />
          <line x1="56" y1="36" x2="68" y2="48" />
        </g>
      )}

      {variant === "more_than_2" && (
        <g stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round">
          <line x1="24" y1="22" x2="42" y2="40" />
          <line x1="36" y1="46" x2="54" y2="30" />
          <line x1="50" y1="26" x2="72" y2="48" />
          <line x1="30" y1="52" x2="60" y2="52" />
        </g>
      )}

      {variant === "cracked_broken" && (
        <g stroke="#991B1B" strokeWidth="1.6" strokeLinecap="round">
          {/* Spiderweb fracture */}
          <line x1="14" y1="16" x2="40" y2="40" />
          <line x1="40" y1="40" x2="75" y2="30" />
          <line x1="40" y1="40" x2="55" y2="64" />
          <line x1="40" y1="40" x2="28" y2="60" />
          <line x1="30" y1="30" x2="48" y2="24" />
          <line x1="48" y1="24" x2="65" y2="35" />
          <line x1="32" y1="48" x2="45" y2="54" />
          <line x1="45" y1="54" x2="68" y2="48" />
          {/* Impact Point */}
          <circle cx="40" cy="40" r="2.5" fill="#EF4444" />
        </g>
      )}

      {variant === "no_discoloration" && (
        <g>
          <rect x="13" y="14" width="74" height="52" rx="3" fill="#F9FAFB" />
          <path d="M40 32L42 26L44 32L50 34L44 36L42 42L40 36L34 34Z" fill="#10B981" />
        </g>
      )}

      {variant === "minor_discoloration" && (
        <g>
          <rect x="13" y="14" width="74" height="52" rx="3" fill="#FEF3C7" opacity="0.8" />
          <ellipse cx="50" cy="40" rx="20" ry="14" fill="#FDE68A" opacity="0.9" />
        </g>
      )}

      {variant === "major_discoloration" && (
        <g>
          <rect x="13" y="14" width="74" height="52" rx="3" fill="#FEE2E2" />
          <circle cx="42" cy="38" r="14" fill="#F87171" opacity="0.7" />
          <circle cx="60" cy="45" r="10" fill="#EF4444" opacity="0.8" />
        </g>
      )}

      {variant === "no_spots" && (
        <g>
          <circle cx="50" cy="40" r="10" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M47 40L50 43L55 37" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {variant === "minor_spots" && (
        <g>
          <circle cx="36" cy="32" r="3" fill="#EF4444" />
          <circle cx="62" cy="46" r="2.5" fill="#EF4444" />
        </g>
      )}

      {variant === "heavy_spots" && (
        <g>
          <circle cx="30" cy="28" r="4" fill="#DC2626" />
          <circle cx="50" cy="42" r="6" fill="#B91C1C" />
          <circle cx="70" cy="34" r="5" fill="#DC2626" />
          <circle cx="40" cy="54" r="4" fill="#991B1B" />
          <circle cx="64" cy="52" r="3.5" fill="#EF4444" />
        </g>
      )}

      {variant === "lines" && (
        <g stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
          <line x1="35" y1="15" x2="35" y2="65" stroke="#3B82F6" />
          <line x1="48" y1="15" x2="48" y2="65" stroke="#10B981" />
          <line x1="62" y1="15" x2="62" y2="65" stroke="#EF4444" />
        </g>
      )}

      {variant === "light_leaks" && (
        <g>
          {/* Glowing edges */}
          <rect x="13" y="14" width="74" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="13" y="60" width="74" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="13" y="14" width="6" height="52" fill="#FBBF24" opacity="0.8" />
          <rect x="81" y="14" width="6" height="52" fill="#FBBF24" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

export type TabletHardwareVariant =
  | "front_cam"
  | "back_cam"
  | "cam_glass"
  | "finger_touch"
  | "face_sensor"
  | "wifi"
  | "gps"
  | "bluetooth"
  | "audio_jack"
  | "volume_btn"
  | "power_btn"
  | "charging"
  | "battery"
  | "microphone"
  | "speaker";

export function TabletHardwareIllustration({ variant }: { variant: TabletHardwareVariant }) {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full max-w-[84px] max-h-[68px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tablet Body */}
      <rect x="8" y="8" width="84" height="64" rx="7" fill="#F9FAFB" stroke="#1F2937" strokeWidth="2.2" />
      {/* Bezel */}
      <rect x="12" y="12" width="76" height="56" rx="4" fill="#111827" />
      {/* Screen Area */}
      <rect x="15" y="15" width="70" height="50" rx="2.5" fill="#FFFFFF" />

      {/* Component Specific Overlay */}
      {variant === "front_cam" && (
        <g>
          {/* Highlight Top Bezel Camera */}
          <circle cx="50" cy="10" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="50" cy="10" r="6" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="2 2" className="animate-pulse" />
          {/* Target Reticle */}
          <circle cx="50" cy="38" r="14" stroke="#EF4444" strokeWidth="1.8" />
          <circle cx="50" cy="38" r="6" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
          <path d="M50 20L50 26M50 50L50 56M32 38L38 38M62 38L68 38" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}

      {variant === "back_cam" && (
        <g>
          {/* Tablet Back Chassis Representation */}
          <rect x="15" y="15" width="70" height="50" rx="2.5" fill="#E5E7EB" />
          {/* Corner Camera Bump */}
          <rect x="18" y="18" width="18" height="18" rx="4" fill="#1F2937" />
          <circle cx="27" cy="27" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="27" cy="27" r="2" fill="#FFFFFF" />
          {/* Warning Mark */}
          <path d="M58 35L66 50H50L58 35Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <circle cx="58" cy="46" r="1" fill="#FFFFFF" />
          <line x1="58" y1="39" x2="58" y2="43" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {variant === "cam_glass" && (
        <g>
          <rect x="15" y="15" width="70" height="50" rx="2.5" fill="#E5E7EB" />
          <rect x="36" y="24" width="28" height="28" rx="6" fill="#1F2937" stroke="#EF4444" strokeWidth="1.5" />
          <circle cx="50" cy="38" r="8" fill="#374151" stroke="#EF4444" strokeWidth="1.5" />
          {/* Crack line through lens */}
          <line x1="38" y1="26" x2="62" y2="50" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="38" x2="60" y2="30" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {variant === "finger_touch" && (
        <g>
          {/* Biometric fingerprint ripples */}
          <circle cx="50" cy="40" r="14" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="50" cy="40" r="10" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="50" cy="40" r="6" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 1" />
          <circle cx="50" cy="40" r="2" fill="#EF4444" />
        </g>
      )}

      {variant === "face_sensor" && (
        <g>
          {/* Face outline with bracket corners */}
          <path d="M36 28H30V34" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 28H70V34" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <path d="M36 52H30V46" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 52H70V46" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          {/* Face Silhouette */}
          <circle cx="50" cy="38" r="8" stroke="#EF4444" strokeWidth="1.5" />
          <path d="M42 50C44 46 48 45 50 45C52 45 56 46 58 50" stroke="#EF4444" strokeWidth="1.5" />
          <line x1="28" y1="40" x2="72" y2="40" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
        </g>
      )}

      {variant === "wifi" && (
        <g stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
          <path d="M34 32C42 26 58 26 66 32" fill="none" />
          <path d="M40 38C45 34 55 34 60 38" fill="none" />
          <path d="M46 44C48 42 52 42 54 44" fill="none" />
          <circle cx="50" cy="50" r="2" fill="#EF4444" stroke="none" />
          {/* Slash warning */}
          <line x1="32" y1="24" x2="68" y2="56" stroke="#DC2626" strokeWidth="2.5" />
        </g>
      )}

      {variant === "gps" && (
        <g>
          <path d="M50 25C44 25 40 29 40 35C40 43 50 53 50 53C50 53 60 43 60 35C60 29 56 25 50 25Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
          <circle cx="50" cy="34" r="3" fill="#EF4444" />
          <line x1="32" y1="24" x2="68" y2="56" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {variant === "bluetooth" && (
        <g>
          <path d="M44 32L56 42L50 48V28L56 34L44 44" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="32" y1="24" x2="68" y2="56" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {variant === "audio_jack" && (
        <g>
          {/* Tablet top edge showing 3.5mm jack */}
          <circle cx="50" cy="40" r="12" fill="#F3F4F6" stroke="#1F2937" strokeWidth="2" />
          <circle cx="50" cy="40" r="6" fill="#111827" />
          <circle cx="50" cy="40" r="2.5" fill="#EF4444" />
          <path d="M50 20V24M50 56V60M30 40H34M66 40H70" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {variant === "volume_btn" && (
        <g>
          {/* Side button highlighted on tablet right edge */}
          <rect x="92" y="24" width="4" height="12" rx="2" fill="#EF4444" />
          <rect x="92" y="40" width="4" height="12" rx="2" fill="#EF4444" />
          <path d="M42 34V46M48 30V50M54 36V44" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {variant === "power_btn" && (
        <g>
          {/* Top power button highlighted */}
          <rect x="70" y="5" width="14" height="4" rx="2" fill="#EF4444" />
          {/* Power symbol */}
          <path d="M43 36A10 10 0 1 0 57 36" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="26" x2="50" y2="38" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {variant === "charging" && (
        <g>
          {/* Bottom charging port highlighted */}
          <rect x="42" y="71" width="16" height="4" rx="2" fill="#EF4444" />
          {/* Lightning bolt */}
          <path d="M52 24L42 40H50L46 56L58 38H50L52 24Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}

      {variant === "battery" && (
        <g>
          {/* Battery chassis */}
          <rect x="34" y="28" width="30" height="22" rx="3" stroke="#DC2626" strokeWidth="2" fill="#FEE2E2" />
          <rect x="64" y="34" width="4" height="10" rx="1.5" fill="#DC2626" />
          {/* Exclamation or low bar */}
          <rect x="37" y="31" width="7" height="16" fill="#EF4444" />
          <line x1="53" y1="33" x2="53" y2="41" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          <circle cx="53" cy="45" r="1.2" fill="#DC2626" />
        </g>
      )}

      {variant === "microphone" && (
        <g>
          <rect x="44" y="26" width="12" height="20" rx="6" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
          <path d="M38 38C38 45 44 49 50 49C56 49 62 45 62 38" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="49" x2="50" y2="56" stroke="#EF4444" strokeWidth="2" />
          <line x1="42" y1="56" x2="58" y2="56" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {variant === "speaker" && (
        <g>
          <path d="M36 34H44L52 26V54L44 46H36V34Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
          <path d="M58 33C62 37 62 43 58 47" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 27C70 33 70 47 64 53" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
