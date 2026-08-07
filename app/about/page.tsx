import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Sparkles, HeartHandshake, FileSearch } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-black text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About CashALL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-black">
              Sell Your Old Devices Without The Guesswork.
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              CashALL is built to introduce complete pricing transparency, speed, and trust into India&apos;s recommerce market.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-premium space-y-6 text-sm text-brand-muted leading-relaxed">
            <h2 className="text-xl font-black text-brand-black">Our Mission</h2>
            <p>
              Every year, tens of millions of functional smartphones sit unused in drawers across India simply because traditional device selling involves hidden price cuts, unreliable classified buyers, or rigid black-box valuation algorithms.
            </p>
            <p>
              CashALL was created to pioneer <strong>Transparent Device Valuation</strong>. We show sellers exactly how their estimated price is calculated—line item by line item. If physical inspection at your doorstep requires an adjustment, we present clear, verified rationale before asking for your approval.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-left">
              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border">
                <FileSearch className="w-6 h-6 text-brand-black mb-2" />
                <h3 className="font-extrabold text-brand-black text-xs">Transparent Pricing</h3>
                <p className="text-[11px] text-gray-500 mt-1">Itemized valuation logic derived from real market parameters.</p>
              </div>

              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border">
                <HeartHandshake className="w-6 h-6 text-brand-black mb-2" />
                <h3 className="font-extrabold text-brand-black text-xs">Customer Approval</h3>
                <p className="text-[11px] text-gray-500 mt-1">No silent price reductions. Final offer requires customer consent.</p>
              </div>

              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border">
                <ShieldCheck className="w-6 h-6 text-brand-black mb-2" />
                <h3 className="font-extrabold text-brand-black text-xs">Secure Data Wipe</h3>
                <p className="text-[11px] text-gray-500 mt-1">Assisted factory reset before device leaves your possession.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
