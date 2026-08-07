import React from "react";
import { ShieldCheck, Truck, Zap, Lock, HeartHandshake, FileSearch } from "lucide-react";

export function WhyCashALL() {
  const features = [
    {
      title: "Transparent Valuation",
      description: "We show you exact itemized line items for why your phone is valued at its price. No guesswork.",
      icon: FileSearch,
    },
    {
      title: "Fast Doorstep Pickup",
      description: "Our certified agent collects your device directly from your home or office with express logistics.",
      icon: Truck,
    },
    {
      title: "Quick Direct Payment",
      description: "Receive instant funds directly to your UPI ID or Bank account upon inspection approval.",
      icon: Zap,
    },
    {
      title: "Secure Data Wipe",
      description: "Assisted factory data wipe during pickup to keep your personal files completely safe.",
      icon: Lock,
    },
    {
      title: "Zero Hidden Fees",
      description: "No processing deductions, pickup convenience fees or hidden service charges.",
      icon: ShieldCheck,
    },
    {
      title: "Human Support",
      description: "Real customer support team available to assist with questions or pickup adjustments.",
      icon: HeartHandshake,
    },
  ];

  return (
    <section className="py-20 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-brand-black">
            Why Sell On CashALL?
          </h2>
          <p className="text-sm text-brand-muted mt-2">
            Built on trust, speed, and complete pricing transparency for Indian smartphone owners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtleCard hover:shadow-premium transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 text-brand-black flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-black" />
                </div>
                <h3 className="text-lg font-bold text-brand-black mb-2">{item.title}</h3>
                <p className="text-xs text-brand-muted leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* TRANSPARENT PRICING GUARANTEE BANNER */}
        <div className="mt-14 bg-white rounded-3xl p-8 border-2 border-brand-yellow shadow-premium max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow flex items-center justify-center shrink-0 shadow-yellowGlow">
              <ShieldCheck className="w-8 h-8 text-brand-black" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-brand-black">
                Our Transparent Pricing Guarantee
              </h3>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                Your online value is an estimate based on the condition parameters you select. Your final price is confirmed after physical inspection. If anything changes, we&apos;ll show you the exact line-item reason before you decide whether to accept or decline the offer.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
