"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Smartphone, Laptop, Tablet, ArrowRight, ChevronRight } from "lucide-react";

export default function CategorySelectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-8 justify-center">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">Sell Device</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-brand-black">
              What Do You Want To Sell Today?
            </h1>
            <p className="text-sm text-brand-muted mt-2">
              Select your device category to calculate an instant transparent valuation.
            </p>
          </div>

          {/* CATEGORY SELECTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            {/* MOBILE PHONE CARD */}
            <Link
              href="/sell/mobile"
              className="bg-white rounded-3xl p-7 border-2 border-brand-yellow/60 hover:border-brand-yellow shadow-premium hover:shadow-yellowGlow transition-all duration-300 group text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center text-brand-black mb-5 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-brand-black" />
                </div>
                <h2 className="text-xl font-black text-brand-black">
                  Mobile Phone
                </h2>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                  Sell iPhone, Samsung, OnePlus, Xiaomi, Vivo, Oppo, Realme, Motorola, Google Pixel &amp; more.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-brand-black mt-6 group-hover:translate-x-1 transition-transform">
                <span>Sell Mobile Phone</span>
                <ArrowRight className="w-4 h-4 text-brand-black" />
              </div>
            </Link>

            {/* LAPTOP CARD */}
            <Link
              href="/sell/laptop"
              className="bg-white rounded-3xl p-7 border-2 border-brand-yellow/60 hover:border-brand-yellow shadow-premium hover:shadow-yellowGlow transition-all duration-300 group text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center text-brand-black mb-5 group-hover:scale-110 transition-transform">
                  <Laptop className="w-7 h-7 text-brand-black" />
                </div>
                <h2 className="text-xl font-black text-brand-black">
                  Laptop
                </h2>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                  Sell Apple MacBook Air/Pro, Dell, HP, Lenovo, Asus, Acer, Microsoft &amp; MSI.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-brand-black mt-6 group-hover:translate-x-1 transition-transform">
                <span>Sell Laptop</span>
                <ArrowRight className="w-4 h-4 text-brand-black" />
              </div>
            </Link>

            {/* TABLET CARD */}
            <Link
              href="/sell/tablet"
              className="bg-white rounded-3xl p-7 border-2 border-brand-yellow/60 hover:border-brand-yellow shadow-premium hover:shadow-yellowGlow transition-all duration-300 group text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center text-brand-black mb-5 group-hover:scale-110 transition-transform">
                  <Tablet className="w-7 h-7 text-brand-black" />
                </div>
                <h2 className="text-xl font-black text-brand-black">
                  Tablet / iPad
                </h2>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                  Sell Apple iPad, iPad Air/Pro, Samsung Galaxy Tab, Lenovo, OnePlus &amp; Xiaomi Pad.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-brand-black mt-6 group-hover:translate-x-1 transition-transform">
                <span>Sell Tablet</span>
                <ArrowRight className="w-4 h-4 text-brand-black" />
              </div>
            </Link>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
