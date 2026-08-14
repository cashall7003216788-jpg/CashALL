import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DeviceSearch } from "./DeviceSearch";
import { AdCarousel } from "./AdCarousel";
import { ShieldCheck, Truck, Zap, Lock } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-brand-black text-white overflow-hidden pt-10 pb-20 md:py-24 border-b border-neutral-900">
      
      {/* BACKGROUND BRAND GLOW & PATTERN ACCENTS */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-brand-yellow/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/photos/CashALL_brand_pattern.png')] bg-cover bg-center opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* PRIMARY HEADLINE */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Sell Your Old Devices <br className="hidden sm:inline" />
            <span className="text-brand-yellow underline decoration-brand-yellow/30 underline-offset-8">for the Best Value with CashALL.</span>
          </h1>

          {/* SUPPORTING TEXT */}
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Get an instant estimated price for your mobile phone or laptop with CashALL. Enjoy fast doorstep pickup and secure payment.
          </p>

          {/* FULLY VISIBLE ADVERTISEMENT AUTO SIDE-SCROLL CAROUSEL RIGHT AFTER HEADING & SUBTITLE */}
          <div className="pt-2">
            <AdCarousel />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/sell" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" fullWidth className="text-base font-extrabold px-8 shadow-yellowGlow">
                Sell My Phone or Laptop
              </Button>
            </Link>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/sell/mobile" className="w-1/2 sm:w-auto">
                <Button variant="tertiary" size="lg" className="w-full text-xs font-bold bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800">
                  Sell Phone
                </Button>
              </Link>
              <Link href="/sell/laptop" className="w-1/2 sm:w-auto">
                <Button variant="tertiary" size="lg" className="w-full text-xs font-bold bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800">
                  Sell Laptop
                </Button>
              </Link>
            </div>
          </div>

          {/* SEARCH INTEGRATION */}
          <div id="find-phone" className="pt-6">
            <DeviceSearch />
          </div>

          {/* TRUST INDICATORS UNDERNEATH */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-brand-yellow/30 transition-colors">
              <Truck className="w-4 h-4 text-brand-yellow shrink-0" />
              <span className="text-xs font-semibold text-gray-200">Fast & Free Pickup</span>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-brand-yellow/30 transition-colors">
              <Zap className="w-4 h-4 text-brand-yellow shrink-0" />
              <span className="text-xs font-semibold text-gray-200">Instant Payment</span>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-brand-yellow/30 transition-colors">
              <ShieldCheck className="w-4 h-4 text-brand-yellow shrink-0" />
              <span className="text-xs font-semibold text-gray-200">Transparent Pricing</span>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-brand-yellow/30 transition-colors">
              <Lock className="w-4 h-4 text-brand-yellow shrink-0" />
              <span className="text-xs font-semibold text-gray-200">Secure Process</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
