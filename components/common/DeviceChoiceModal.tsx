"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, Laptop, Tablet, X, ArrowRight } from "lucide-react";

interface DeviceChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceChoiceModal({ isOpen, onClose }: DeviceChoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-brand-border shadow-2xl relative">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-sm mx-auto mb-6">
          <h2 className="text-2xl font-black text-brand-black">
            What Do You Want To Sell?
          </h2>
          <p className="text-xs text-brand-muted mt-1">
            Select your device category to calculate an instant valuation.
          </p>
        </div>

        {/* DEVICE OPTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* MOBILE PHONE CARD */}
          <Link
            href="/sell/mobile"
            onClick={onClose}
            className="bg-brand-bg rounded-2xl p-5 border-2 border-brand-yellow/60 hover:border-brand-yellow hover:bg-white shadow-subtleCard hover:shadow-yellowGlow transition-all duration-300 group text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-black mb-3 group-hover:scale-110 transition-transform">
                <Smartphone className="w-5 h-5 text-brand-black" />
              </div>
              <h3 className="text-base font-black text-brand-black">
                Mobile Phone
              </h3>
              <p className="text-[11px] text-brand-muted mt-1">
                iPhone, Samsung, OnePlus &amp; more
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-brand-black mt-5 group-hover:translate-x-1 transition-transform">
              <span>Sell Phone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* LAPTOP CARD */}
          <Link
            href="/sell/laptop"
            onClick={onClose}
            className="bg-brand-bg rounded-2xl p-5 border-2 border-brand-yellow/60 hover:border-brand-yellow hover:bg-white shadow-subtleCard hover:shadow-yellowGlow transition-all duration-300 group text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-black mb-3 group-hover:scale-110 transition-transform">
                <Laptop className="w-5 h-5 text-brand-black" />
              </div>
              <h3 className="text-base font-black text-brand-black">
                Laptop
              </h3>
              <p className="text-[11px] text-brand-muted mt-1">
                MacBook, Dell, HP, Lenovo &amp; Asus
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-brand-black mt-5 group-hover:translate-x-1 transition-transform">
              <span>Sell Laptop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* TABLET CARD */}
          <Link
            href="/sell/tablet"
            onClick={onClose}
            className="bg-brand-bg rounded-2xl p-5 border-2 border-brand-yellow/60 hover:border-brand-yellow hover:bg-white shadow-subtleCard hover:shadow-yellowGlow transition-all duration-300 group text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-black mb-3 group-hover:scale-110 transition-transform">
                <Tablet className="w-5 h-5 text-brand-black" />
              </div>
              <h3 className="text-base font-black text-brand-black">
                Tablet / iPad
              </h3>
              <p className="text-[11px] text-brand-muted mt-1">
                iPad, iPad Air/Pro &amp; Galaxy Tab
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-brand-black mt-5 group-hover:translate-x-1 transition-transform">
              <span>Sell Tablet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
