"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { INITIAL_FAQS } from "@/lib/store";

export function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  return (
    <section className="py-20 bg-white border-t border-brand-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-xs font-semibold text-brand-black mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-brand-black" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-black">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-brand-muted mt-2">
            Everything you need to know about selling your phone on CashALL.
          </p>
        </div>

        <div className="space-y-3">
          {INITIAL_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-brand-bg rounded-2xl border border-brand-border overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-brand-black hover:text-black focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-black shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs md:text-sm text-brand-muted leading-relaxed border-t border-brand-border/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
