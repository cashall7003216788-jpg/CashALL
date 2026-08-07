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

  const handleRuleChange = (ruleId: string, val: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, adjustmentValue: val } : r))
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Deterministic Pricing Engine Rules
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Control base acquisition values and condition deduction rules across device categories
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
            <span>Pricing rules updated successfully! Historical quote snapshots remain unchanged.</span>
          </div>
        )}

        {/* QUESTIONS & RULES MATRIX */}
        <div className="space-y-6">
          {INITIAL_QUESTIONS.map((question) => {
            const questionRules = rules.filter((r) => r.questionId === question.id);
            return (
              <div key={question.id} className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-brand-black">
                      {question.title}
                    </h2>
                    <span className="text-[11px] font-bold text-gray-400 uppercase">
                      Group: {question.group}
                    </span>
                  </div>
                  <Badge variant="yellow">{questionRules.length} Active Rules</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((opt) => {
                    const rule = questionRules.find((r) => r.optionId === opt.id);
                    return (
                      <div key={opt.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-black">{opt.label}</span>
                          <span className="text-[10px] font-semibold text-gray-400">{rule?.adjustmentType}</span>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-xs font-bold text-gray-500">Adjustment:</span>
                          <input
                            type="number"
                            value={rule?.adjustmentValue || 0}
                            onChange={(e) => rule && handleRuleChange(rule.id, Number(e.target.value))}
                            className="w-32 px-3 py-1.5 text-xs font-bold font-price bg-white rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                          />
                          <span className="text-xs font-bold text-brand-black">
                            {rule?.adjustmentType === "PERCENTAGE_DEDUCTION" ? "%" : "₹"}
                          </span>
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
