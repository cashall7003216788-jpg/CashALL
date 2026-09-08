"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  ShieldCheck,
  Smartphone,
  PhoneCall,
  Bell,
  Headphones,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AppDownloadHubPage() {
  const [downloadingAgent, setDownloadingAgent] = useState(false);
  const [downloadingCaller, setDownloadingCaller] = useState(false);

  const handleDownloadAgent = () => {
    setDownloadingAgent(true);
    window.location.href = "/api/v1/download/agent";
    setTimeout(() => setDownloadingAgent(false), 4000);
  };

  const handleDownloadCaller = () => {
    setDownloadingCaller(true);
    window.location.href = "/api/v1/download/caller";
    setTimeout(() => setDownloadingCaller(false), 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-black border-2 border-yellow-500/40 rounded-2xl mx-auto flex items-center justify-center shadow-lg p-2">
            <Image src="/logo.png" alt="CashALL Logo" width={52} height={52} className="object-contain" priority />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            CashALL <span className="text-yellow-400">Mobile Applications</span>
          </h1>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto">
            Official Android APK downloads for CashALL Field Agents and Customer Support Desk.
            All APKs are signed, verified, and support in-place updates without uninstalling.
          </p>
        </div>

        {/* APP CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: AGENT APP */}
          <div className="bg-neutral-900/90 border border-neutral-800 hover:border-yellow-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition duration-300 shadow-xl relative overflow-hidden group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full">
                  v1.0.3 • Field Ops
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white group-hover:text-yellow-400 transition">
                  CashALL Field Agent App
                </h2>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  For doorstep pickup agents. Instant dispatch alerts with 24/7 siren, doorstep valuation, camera inspection, and in-app call recording.
                </p>
              </div>

              <div className="space-y-2 text-xs text-neutral-300 bg-neutral-950/70 border border-neutral-800/80 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>24/7 Loud Siren &amp; Haptic Vibration</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>In-App Customer Call Recording (0 MB phone storage used)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Doorstep QC, IMEI OCR &amp; Instant UPI Payout</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <button
                onClick={handleDownloadAgent}
                disabled={downloadingAgent}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{downloadingAgent ? "Starting Download..." : "Download Agent APK (v1.0.3)"}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                <Link
                  href="/download/agent"
                  className="hover:text-yellow-400 flex items-center gap-1 transition"
                >
                  <span>Install / Update Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <a
                  href="/CashALL-Agent.apk"
                  download="CashALL-Agent.apk"
                  className="text-neutral-500 hover:text-neutral-300 underline"
                >
                  Direct File Link
                </a>
              </div>
            </div>
          </div>

          {/* CARD 2: CALLER APP */}
          <div className="bg-neutral-900/90 border border-neutral-800 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition duration-300 shadow-xl relative overflow-hidden group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full">
                  v1.0.3 • Support Desk
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white group-hover:text-emerald-400 transition">
                  CashALL Caller Desk App
                </h2>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  For company support phones (Harshita, Sangeet). One-tap CRM lead dialing, HD 2-way call assurance, and auto-sync to the Admin Call Desk.
                </p>
              </div>

              <div className="space-y-2 text-xs text-neutral-300 bg-neutral-950/70 border border-neutral-800/80 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct CRM Customer Calling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Strict Support Desk Role Tagging</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Vivo V20 &amp; Android 13/14/15 Auto-Sync</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <button
                onClick={handleDownloadCaller}
                disabled={downloadingCaller}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{downloadingCaller ? "Starting Download..." : "Download Caller APK (v1.0.3)"}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                <Link
                  href="/download/caller"
                  className="hover:text-emerald-400 flex items-center gap-1 transition"
                >
                  <span>Dialer Setup Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <a
                  href="/CashALL-Caller.apk"
                  download="CashALL-Caller.apk"
                  className="text-neutral-500 hover:text-neutral-300 underline"
                >
                  Direct File Link
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SEAMLESS UPDATE BANNER */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Seamless In-Place Updates (No Uninstall Needed)</span>
              <span>Both APKs are signed with official release keys. Opening the APK will present an <strong>[UPDATE]</strong> button preserving all existing logins.</span>
            </div>
          </div>
          <Link
            href="/"
            className="text-neutral-300 hover:text-yellow-400 font-bold whitespace-nowrap transition"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
