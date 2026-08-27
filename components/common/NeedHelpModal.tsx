"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle, X, HelpCircle as FaqIcon, Headphones, MessageSquare, PhoneCall, ChevronRight } from "lucide-react";
import { trackMetaStandardEvent } from "@/lib/analytics/meta";

interface NeedHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NeedHelpModal({ isOpen, onClose }: NeedHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-brand-black border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Need Help?</h3>
              <p className="text-xs text-gray-400">We are here to assist you 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HELP OPTIONS GRID */}
        <div className="p-6 space-y-4">
          
          {/* FAQ OPTION */}
          <Link
            href="/faq"
            onClick={onClose}
            className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-brand-yellow/50 hover:bg-neutral-800/80 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-brand-yellow/20 flex items-center justify-center text-brand-yellow transition-colors">
                <FaqIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white group-hover:text-brand-yellow transition-colors">
                  Frequently Asked Questions (FAQ)
                </h4>
                <p className="text-xs text-gray-400">
                  Instant answers about pricing, pickup, and payments
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-brand-yellow group-hover:translate-x-1 transition-all" />
          </Link>

          {/* CONTACT SUPPORT OPTION */}
          <Link
            href="/contact"
            onClick={onClose}
            className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-brand-yellow/50 hover:bg-neutral-800/80 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-brand-yellow/20 flex items-center justify-center text-brand-yellow transition-colors">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white group-hover:text-brand-yellow transition-colors">
                  Contact Customer Support
                </h4>
                <p className="text-xs text-gray-400">
                  Get direct human support for orders and inquiries
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-brand-yellow group-hover:translate-x-1 transition-all" />
          </Link>

          {/* QUICK DIRECT CONTACT CHANNELS */}
          <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-3">
            <a
              href="tel:+917003216788"
              onClick={() => {
                trackMetaStandardEvent("Contact", { content_name: "Phone Call" }, { eventId: "contact_phone_helpmodal" });
              }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-bold text-gray-300 hover:text-white hover:border-brand-yellow/40 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-brand-yellow" />
              <span>Call Us</span>
            </a>
            <a
              href="https://wa.me/917003216788"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackMetaStandardEvent("Contact", { content_name: "WhatsApp" }, { eventId: "contact_whatsapp_helpmodal" });
              }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-bold text-gray-300 hover:text-white hover:border-brand-yellow/40 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-brand-yellow" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
