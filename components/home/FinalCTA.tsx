import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 bg-brand-black text-white relative overflow-hidden border-t border-neutral-800">
      {/* GLOW DECORATION */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero Guesswork Selling</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
          YOUR OLD PHONE <br className="hidden sm:inline" />
          <span className="text-brand-yellow">STILL HAS VALUE.</span>
        </h2>

        <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
          Find out what it&apos;s worth in a few simple steps. Fast doorstep pickup, instant valuation, and direct payment.
        </p>

        <div className="pt-4 flex justify-center">
          <Link href="/sell/mobile">
            <Button variant="primary" size="lg" className="text-base font-extrabold px-9 py-4 gap-2 shadow-yellowGlow">
              <span>CHECK MY PHONE VALUE</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
