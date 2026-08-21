"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, PhoneCall, MessageSquare, Mail, X, Clock, HelpCircle } from "lucide-react";

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/support") ||
    pathname?.startsWith("/agent") ||
    pathname?.startsWith("/partner")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* SUPPORT POPUP CARD */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-3xl p-6 border border-brand-border shadow-2xl w-80 sm:w-96 text-brand-black animate-fadeIn relative">
          
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-yellow/20 flex items-center justify-center text-brand-black shrink-0">
              <Headphones className="w-5 h-5 text-brand-black" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-black">CashALL Support</h3>
              <p className="text-[11px] text-brand-muted">We&apos;re here to help with your device selling</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* PHONE CALL */}
            <a
              href="tel:+917003216788"
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-brand-yellow/10 border border-gray-100 hover:border-brand-yellow/40 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <div className="font-extrabold text-brand-black group-hover:text-black">Call Support Hotline</div>
                <div className="text-[11px] text-gray-500">+91 7003216788</div>
              </div>
            </a>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/917003216788?text=Hi%20CashALL%20Support,%20I%20need%20assistance%20selling%20my%20device."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1">
                  <span>WhatsApp Live Chat</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Chat directly on WhatsApp (+91 7003216788)</div>
              </div>
            </a>

            {/* EMAIL */}
            <a
              href="mailto:support@cashall.in"
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <div className="font-extrabold text-brand-black">Email Support</div>
                <div className="text-[11px] text-gray-500">support@cashall.in</div>
              </div>
            </a>

          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-yellow" />
              <span>Mon-Sun: 9 AM - 9 PM</span>
            </div>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="font-bold text-brand-black hover:underline"
            >
              Contact Form &rarr;
            </Link>
          </div>

        </div>
      )}

      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-brand-black text-white border-2 border-brand-yellow shadow-2xl hover:bg-brand-dark transition-all duration-300 group"
      >
        <div className="w-7 h-7 rounded-full bg-brand-yellow text-black flex items-center justify-center font-bold">
          <Headphones className="w-4 h-4" />
        </div>
        <span className="text-xs font-black tracking-wide pr-1">Need Help?</span>
      </button>

    </div>
  );
}
