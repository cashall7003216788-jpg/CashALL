"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, ArrowRight, CheckCircle2, Phone } from "lucide-react";

export default function PartnerPortalPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full space-y-8 pt-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-yellow/20 rounded-3xl flex items-center justify-center mx-auto border border-brand-yellow/30">
            <Truck className="w-8 h-8 text-brand-yellow" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-price text-brand-yellow">
            CashALL Partner
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Mobile Field Inspection & Doorstep Pickup Portal
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <div className="text-xs font-bold text-brand-yellow uppercase tracking-wider">
              Field Executive Access
            </div>
            <h2 className="text-lg font-extrabold text-white">
              Assigned Doorstep Pickups
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Inspect devices, verify IMEIs, record manual UPI payments, and complete customer eSignatures on location.
            </p>
          </div>

          <Link
            href="/partner/orders"
            className="w-full py-4 bg-brand-yellow text-brand-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-yellowHover shadow-yellowGlow transition-all"
          >
            <span>View Assigned Pickups</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature List */}
        <div className="space-y-3 pt-2 text-xs text-gray-400">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>Structured 15-Point Hardware Checklist</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>Automatic IMEI 1/2 Verification & Blacklist Check</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>Manual UPI Payment Proof & UTR Lock</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
            <span>CCA-Compliant Customer Electronic Signing</span>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-gray-600 font-semibold py-4">
        © CashALL Recommerce • Partner Field Operations
      </div>
    </div>
  );
}
