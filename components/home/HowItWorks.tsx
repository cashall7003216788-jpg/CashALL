import React from "react";
import { Smartphone, Calculator, CalendarCheck, Wallet } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Tell Us About Your Phone",
      description: "Select your exact model and answer a few simple condition questions.",
      icon: Smartphone,
    },
    {
      step: "02",
      title: "Get Your CashALL Value",
      description: "See your instant transparent estimated selling price with itemized breakdown.",
      icon: Calculator,
    },
    {
      step: "03",
      title: "Schedule Fast Pickup",
      description: "Pick a convenient doorstep pickup date and time slot at your home or office.",
      icon: CalendarCheck,
    },
    {
      step: "04",
      title: "Get Paid Instantly",
      description: "After physical verification, approve the final offer and receive instant UPI/Bank payment.",
      icon: Wallet,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-brand-black text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider mb-3">
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How CashALL Works
          </h2>
          <p className="text-sm text-gray-400 mt-3">
            Selling your used smartphone shouldn&apos;t be complicated. Here is how we make it effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-neutral-900/80 rounded-2xl p-6 border border-neutral-800 hover:border-brand-yellow/60 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-yellow text-brand-black flex items-center justify-center font-extrabold shadow-yellowGlow group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-neutral-700 group-hover:text-brand-yellow/40 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-neutral-700">
                    →
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
