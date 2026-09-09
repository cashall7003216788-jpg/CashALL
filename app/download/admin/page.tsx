"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, ShieldCheck, Navigation, Bell, Smartphone, Lock } from "lucide-react";

export default function DownloadAdminPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = "/api/v1/download/admin";
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
              CashALL <span className="text-yellow-400">Admin App</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Dedicated Executive Mobile Console v1.0.0
            </p>
          </div>
        </div>

        {/* 4 ADMIN ACCESS BADGE */}
        <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-2xl p-3 text-xs text-yellow-300 flex items-center justify-center gap-2 font-bold">
          <Lock className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>Authorized for: SANGEET, ABHISHEK, ANKIT, AYUSH</span>
        </div>

        {/* FEATURE PILLS */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs bg-neutral-950/80 border border-neutral-800/80 p-3.5 rounded-2xl">
          <div className="flex items-center gap-2 text-neutral-300">
            <Bell className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>10s Real Order Alarm</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Google Navigation</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Full Admin Console</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Zero-Lock Sentinel</span>
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
            <span>{downloading ? "Starting Download..." : "Download CashALL Admin APK"}</span>
          </button>
          <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Production Signed • 5.7 MB • Android 7.0 - 15</span>
          </div>
        </div>

        {/* SECURITY SCAN & INSTALLATION GUIDANCE */}
        <div className="text-left bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl space-y-3 text-xs text-neutral-300">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider text-yellow-400">
              Installation Steps:
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
              ✓ Clean Scan
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-400">1.</span>
              <span>Tap Download above. If Chrome prompts <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-400">2.</span>
              <span>Open the downloaded APK and tap <strong>Install</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-400">3.</span>
              <span>Sign in with your Admin Operator Name and master password.</span>
            </div>
          </div>
        </div>

        {/* DIRECT FILE LINK */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 px-1">
          <Link href="/download" className="hover:text-yellow-400 transition">
            ← All Apps Hub
          </Link>
          <a href="/CashALL-Admin.apk" download="CashALL-Admin.apk" className="text-neutral-500 hover:text-white underline">
            Direct APK Link
          </a>
        </div>
      </div>
    </div>
  );
}
