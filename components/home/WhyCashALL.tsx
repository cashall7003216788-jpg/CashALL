import React from "react";
import Image from "next/image";
import { ShieldCheck, Truck, Zap, Lock, HeartHandshake, FileSearch, Sparkles } from "lucide-react";

export function WhyCashALL() {
  const features = [
    {
      title: "Transparent Valuation",
      description: "We show you exact itemized line items for why your phone is valued at its price. No guesswork.",
      icon: FileSearch,
    },
    {
      title: "Fast & Free Doorstep Pickup",
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

  const promoCards = [
    { id: "ad-1", src: "/photos/advertise1.jpeg", alt: "CashALL Best Value Guarantee" },
    { id: "ad-2", src: "/photos/advertise2.jpeg", alt: "CashALL Instant Doorstep Cash" },
    { id: "ad-3", src: "/photos/adverise3.png", alt: "CashALL Transparent Pricing" },
    { id: "ad-4", src: "/photos/advertise4.png", alt: "CashALL Fast Pickup & Payment" },
  ];

  return (
    <section className="py-20 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-black">
            Why Sell On CashALL?
          </h2>
          <p className="text-sm text-brand-muted mt-2">
            Built on trust, speed, and complete pricing transparency for Indian smartphone owners.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard hover:shadow-premium transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 text-brand-black flex items-center justify-center mb-4 border border-brand-yellow/30">
                  <Icon className="w-6 h-6 text-brand-black" />
                </div>
                <h3 className="text-base font-extrabold text-brand-black mb-2">{item.title}</h3>
                <p className="text-xs text-brand-muted leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* PROMOTIONAL ARTWORK CARDS FROM CASHALL PHOTOS */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-yellow" />
            <h3 className="text-xl font-extrabold text-brand-black">Official CashALL Highlights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {promoCards.map((card) => (
              <div
                key={card.id}
                className="relative rounded-3xl overflow-hidden border border-brand-border bg-white shadow-subtleCard hover:shadow-premium transition-all duration-300 group aspect-[4/3]"
              >
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                  <span className="text-xs font-bold text-white leading-tight">{card.alt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMERCIAL PROMO BANNER CAROUSEL / HIGHLIGHT (USING CASHALL ASSETS) */}
        <div className="bg-brand-black rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            
            {/* LEFT TEXT CONTENT */}
            <div className="p-8 sm:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/20 border border-brand-yellow/40 text-brand-yellow text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Verified Recommerce Partner</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                Sell Your Old Phone In <span className="text-brand-yellow">3 Simple Steps</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Get an instant online quote, schedule a free doorstep pickup slot, and receive instant UPI / Bank payout directly upon doorstep inspection.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-neutral-800 text-center">
                <div>
                  <div className="text-lg font-black text-brand-yellow font-price">100%</div>
                  <div className="text-[11px] text-gray-400 font-semibold">Safe Payout</div>
                </div>
                <div>
                  <div className="text-lg font-black text-brand-yellow font-price">Free</div>
                  <div className="text-[11px] text-gray-400 font-semibold">Doorstep Dispatch</div>
                </div>
                <div>
                  <div className="text-lg font-black text-brand-yellow font-price">Instant</div>
                  <div className="text-[11px] text-gray-400 font-semibold">UPI & Bank Transfer</div>
                </div>
              </div>
            </div>

            {/* RIGHT PROMOTIONAL IMAGE (FROM CASHALL PHOTOS) */}
            <div className="relative h-64 md:h-full min-h-[300px] bg-neutral-900 overflow-hidden">
              <Image
                src="/photos/CashALL_yt_banner.png"
                alt="CashALL Promotional Banner"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-brand-black via-transparent to-transparent opacity-80" />
            </div>

          </div>
        </div>

        {/* TRANSPARENT PRICING GUARANTEE BANNER */}
        <div className="bg-white rounded-3xl p-8 border-2 border-brand-yellow shadow-premium max-w-4xl mx-auto">
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
