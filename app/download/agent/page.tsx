"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, CheckCircle2, ShieldCheck, Smartphone, PhoneCall, Bell, Sparkles, ArrowDown } from "lucide-react";

export default function DownloadAgentPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = "/api/v1/download/agent";
    setTimeout(() => setDownloading(false), 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* LOGO & TITLE */}
        <div className="space-y-3">
          <div className="w-20 h-20 bg-black border-2 border-yellow-500/40 rounded-2xl mx-auto flex items-center justify-center shadow-lg p-2">
            <Image src="/logo.png" alt="CashALL Logo" width={64} height={64} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-price tracking-wide">
              CashALL <span className="text-yellow-400">Agent App</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Official Doorstep Field Operations &amp; Call Desk v1.0.2
            </p>
          </div>
        </div>

        {/* FEATURE PILLS */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs bg-neutral-950/80 border border-neutral-800/80 p-3.5 rounded-2xl">
          <div className="flex items-center gap-2 text-neutral-300">
            <Bell className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>24/7 Loud Siren Alert</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>HD Call Recording</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Doorstep QC &amp; Payout</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Universal Android Fix</span>
          </div>
        </div>

        {/* DOWNLOAD BUTTON */}
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-sm transition shadow-xl active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>{downloading ? "Starting Download..." : "Download CashALL Agent APK"}</span>
          </button>
          <div className="text-[11px] text-neutral-400">
            Size: ~7 MB • For Android 7.0 to 15 (Universal)
          </div>
        </div>

        {/* INSTALLATION INSTRUCTIONS */}
        <div className="text-left bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl space-y-2 text-xs text-neutral-300">
          <div className="font-bold text-white text-[11px] uppercase tracking-wider text-yellow-400/90">
            Easy 2-Step Installation:
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-yellow-400">1.</span>
            <span>Tap Download above. Once downloaded in Chrome, tap <strong>Open</strong>.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-yellow-400">2.</span>
            <span>If prompted, choose <strong>Allow from this source</strong> and tap <strong>Install</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
