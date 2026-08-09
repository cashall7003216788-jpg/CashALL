"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_QUESTIONS, INITIAL_PRICING_RULES, INITIAL_VARIANTS, PricingRuleData } from "@/lib/store";
import { Calculator, Save, CheckCircle2, Sliders, ShieldCheck } from "lucide-react";

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRuleData[]>(INITIAL_PRICING_RULES);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sampleBasePrice, setSampleBasePrice] = useState<number>(60000);

  const handleRuleChange = (ruleId: string, val: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, adjustmentValue: val } : r))
    );
  };

  const handleTypeChange = (ruleId: string, type: "PERCENTAGE_DEDUCTION" | "PERCENTAGE_BONUS") => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, adjustmentType: type } : r))
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const stepNames: Record<string, string> = {
    BASIC: "Step 1: Power & Startup",
    SCREEN: "Step 2: Screen Condition",
    BODY: "Step 3: Body Wear & Dents",
    FUNCTIONAL: "Step 4: Functional Defects",
    ACCESSORIES: "Step 5: Accessories & Warranty",
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black flex items-center gap-2">
              <Calculator className="w-6 h-6 text-brand-black" />
              <span>Percentage-Based Pricing Engine (Steps 1–5)</span>
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Set x% percentage deductions on base variant prices for customer answers across assessment Steps 1 to 5.
            </p>
          </div>

          <Button
            onClick={handleSave}
            variant="primary"
            size="md"
            className="font-extrabold gap-2 shadow-yellowGlow"
          >
            <Save className="w-4 h-4" />
            <span>PUBLISH PRICING MATRIX</span>
          </Button>
        </div>

        {savedSuccess && (
          <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-xs text-green-900 flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>Percentage pricing matrix published successfully! Valuation quotes will now use these exact x% deduction rules.</span>
          </div>
        )}

        {/* LIVE SIMULATION CALCULATOR */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Valuation Rule Simulator</span>
            <h3 className="text-lg font-black text-brand-black">Test Percentage Impact</h3>
            <p className="text-xs text-gray-500">Enter a sample device base price to preview percentage deductions in real time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200">
              <span className="text-xs font-extrabold text-gray-500">Sample Base Price: ₹</span>
              <input
                type="number"
                value={sampleBasePrice}
                onChange={(e) => setSampleBasePrice(Math.max(1000, Number(e.target.value)))}
                className="w-28 text-sm font-extrabold bg-transparent border-none focus:outline-none text-brand-black"
              />
            </div>
            <div className="px-4 py-2 bg-brand-yellow/20 rounded-2xl border border-brand-yellow/40">
              <span className="text-[10px] font-bold text-gray-500 block">Sample 10% Deduction</span>
              <span className="text-sm font-black text-brand-black">₹{((sampleBasePrice * 10) / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* QUESTIONS & RULES MATRIX */}
        <div className="space-y-6">
          {INITIAL_QUESTIONS.map((question) => {
            const questionRules = rules.filter((r) => r.questionId === question.id);
            const stepTitle = stepNames[question.group] || `Group: ${question.group}`;

            return (
              <div key={question.id} className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-black text-brand-muted uppercase tracking-wider block mb-0.5">
                      {stepTitle}
                    </span>
                    <h2 className="text-base font-extrabold text-brand-black">
                      {question.title}
                    </h2>
                  </div>
                  <Badge variant="yellow">{questionRules.length} Percentage Rules</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((opt) => {
                    let rule = questionRules.find((r) => r.optionId === opt.id);
                    const currentVal = rule ? rule.adjustmentValue : 0;
                    const currentType = rule ? rule.adjustmentType : "PERCENTAGE_DEDUCTION";

                    const rupeeImpact = Math.round((sampleBasePrice * currentVal) / 100);

                    return (
                      <div key={opt.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-black">{opt.label}</span>
                          <select
                            value={currentType}
                            onChange={(e) => rule && handleTypeChange(rule.id, e.target.value as any)}
                            className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-gray-200 text-brand-black focus:outline-none"
                          >
                            <option value="PERCENTAGE_DEDUCTION">Deduction (-%)</option>
                            <option value="PERCENTAGE_BONUS">Bonus (+%)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Percentage (x%):</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentVal}
                                onChange={(e) => rule && handleRuleChange(rule.id, Math.max(0, Number(e.target.value)))}
                                className="w-24 pl-3 pr-6 py-1.5 text-xs font-extrabold bg-white rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow shadow-sm"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                                %
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-gray-400 block">Est. Rupee Impact</span>
                            <span className={`text-xs font-black ${currentType === 'PERCENTAGE_DEDUCTION' ? 'text-red-600' : 'text-green-600'}`}>
                              {currentType === 'PERCENTAGE_DEDUCTION' ? '-' : '+'}₹{rupeeImpact.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
