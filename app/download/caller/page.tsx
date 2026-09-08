"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, CheckCircle2, ShieldCheck, Smartphone, PhoneCall, Headphones, Sparkles, ChevronDown, Settings } from "lucide-react";

export default function DownloadCallerPage() {
  const [downloading, setDownloading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<"vivo" | "samsung" | "other">("vivo");

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = "/api/v1/download/caller";
    setTimeout(() => setDownloading(false), 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* LOGO & TITLE */}
        <div className="space-y-3">
          <div className="w-20 h-20 bg-black border-2 border-yellow-500/40 rounded-2xl mx-auto flex items-center justify-center shadow-lg p-2">
            <Image src="/logo.png" alt="CashALL Logo" width={64} height={64} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-price tracking-wide">
              CashALL <span className="text-yellow-400">Caller App</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Customer Support Desk &amp; HD Call Assurance v1.0.2
            </p>
          </div>
        </div>

        {/* FEATURE PILLS */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs bg-neutral-950/80 border border-neutral-800/80 p-3.5 rounded-2xl">
          <div className="flex items-center gap-2 text-neutral-300">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2-Way HD Recording</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Headphones className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>Direct CRM Dialing</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Vivo V20 &amp; Android 13 Fix</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Auto Sync to Admin</span>
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
            <span>{downloading ? "Starting Download..." : "Download CashALL Caller APK"}</span>
          </button>
          <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Version 1.0.2 (Android 10 - 15 Compatible)</span>
          </div>
        </div>

        {/* OEM CALL RECORDING SETUP GUIDE */}
        <div className="text-left bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-yellow-400">
              <Settings className="w-4 h-4" />
              <span>Auto Call Recording Setup (Mandatory)</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            On Android 13 devices (such as Vivo V20), the system Phone app must be enabled once to record calls automatically:
          </p>

          {/* Brand Switcher */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setSelectedBrand("vivo")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-center ${
                selectedBrand === "vivo" ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Vivo / iQOO
            </button>
            <button
              onClick={() => setSelectedBrand("samsung")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-center ${
                selectedBrand === "samsung" ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Samsung
            </button>
            <button
              onClick={() => setSelectedBrand("other")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-center ${
                selectedBrand === "other" ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Xiaomi / Oppo
            </button>
          </div>

          {/* Dynamic Instructions */}
          {selectedBrand === "vivo" && (
            <div className="space-y-1.5 text-xs text-neutral-300 bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl">
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Open your native <strong>Phone (Dialer) app</strong></span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Tap the <strong>3 dots (⋮)</strong> at top right corner</span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Tap <strong>Call settings ➔ Record settings</strong></span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <span>Select <strong>Record all calls automatically</strong></span>
              </div>
            </div>
          )}

          {selectedBrand === "samsung" && (
            <div className="space-y-1.5 text-xs text-neutral-300 bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl">
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Open the <strong>Phone app</strong></span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Tap the <strong>3 dots (⋮) ➔ Settings</strong></span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Tap <strong>Record calls</strong></span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <span>Turn ON <strong>Auto record calls</strong></span>
              </div>
            </div>
          )}

          {selectedBrand === "other" && (
            <div className="space-y-1.5 text-xs text-neutral-300 bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl">
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Open <strong>Phone dialer app ➔ Settings</strong></span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Tap <strong>Call recording</strong></span>
              </div>
              <div className="flex items-start gap-2 font-medium">
                <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Turn ON <strong>Record calls automatically</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* INSTALLATION SAFETY NOTICE */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-4 text-left text-xs space-y-2 text-neutral-400">
          <div className="flex items-center gap-1.5 text-neutral-300 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Safe &amp; Enterprise Verified</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            If Chrome shows <em>&quot;File might be harmful&quot;</em>, tap <strong>Download anyway</strong>. This is standard for internal enterprise APKs installed outside the Google Play Store.
          </p>
        </div>

        {/* ADMIN SHORTCUT */}
        <div className="pt-2">
          <Link
            href="/admin/support/calls"
            className="text-xs text-neutral-500 hover:text-yellow-400 transition"
          >
            ← Back to Support Call Desk Console
          </Link>
        </div>
      </div>
    </div>
  );
}
