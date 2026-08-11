import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, Banknote, HelpCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-gray-400 border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TRUST BADGES RIBBON */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-brand-yellow border border-neutral-800">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast & Free Pickup</h4>
              <p className="text-[11px] text-gray-400">Express doorstep dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-brand-yellow border border-neutral-800">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant Payment</h4>
              <p className="text-[11px] text-gray-400">UPI or direct bank transfer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-brand-yellow border border-neutral-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transparent Pricing</h4>
              <p className="text-[11px] text-gray-400">No hidden deductions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-brand-yellow border border-neutral-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Human Support</h4>
              <p className="text-[11px] text-gray-400">Assistance at every step</p>
            </div>
          </div>
        </div>

        {/* FOOTER LINKS MATRIX */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* BRAND COLUMN */}
          <div className="col-span-2 space-y-4">
            <div className="relative h-10 w-36">
              <Image
                src="/logo.png"
                alt="CashALL Logo"
                width={160}
                height={45}
                className="object-contain object-left h-full w-auto"
              />
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              CashALL is India&apos;s transparent recommerce platform for selling used electronics. Get instant estimated valuations, enjoy fast doorstep pickups, and receive direct payments upon verification.
            </p>
          </div>

          {/* SELL */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Sell Devices</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sell/mobile" className="hover:text-brand-yellow transition-colors">
                  Sell Mobile Phone
                </Link>
              </li>
              <li>
                <Link href="/sell/laptop" className="hover:text-brand-yellow transition-colors">
                  Sell Laptop
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-brand-yellow transition-colors">
                  About CashALL
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-brand-yellow transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-yellow transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT & LEGAL */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support & Legal</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/faq" className="hover:text-brand-yellow transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-brand-yellow transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-yellow transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-yellow transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>@ 2026 Aarna Enterprise. All Rights Reserved</p>
          <p className="text-[11px]">Designed with transparent pricing for Indian phone sellers.</p>
        </div>

      </div>
    </footer>
  );
}
