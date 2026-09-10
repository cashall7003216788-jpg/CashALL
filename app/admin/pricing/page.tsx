"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_QUESTIONS, INITIAL_PRICING_RULES, PricingRuleData, QuestionData } from "@/lib/store";
import { Calculator, Save, CheckCircle2, Smartphone, Laptop } from "lucide-react";

// ── LAPTOP SPECIFIC PRICING MATRIX QUESTIONS ──────────────────────────────────
const LAPTOP_QUESTIONS: QuestionData[] = [
  {
    id: "q-lap-power",
    title: "Does your laptop turn on and boot into Windows / macOS fine?",
    subtitle: "Check basic power status and operating system boot",
    group: "BASIC",
    type: "SINGLE",
    sortOrder: 1,
    options: [
      { id: "o-lp-yes", label: "Turns ON normally", description: "Boots to desktop smoothly", iconName: "Power", sortOrder: 1 },
      { id: "o-lp-no", label: "Power / Motherboard Issue", description: "Does not turn on or gets stuck on logo", iconName: "PowerOff", sortOrder: 2 },
    ],
  },
  {
    id: "q-lap-charger",
    title: "Do you have the original working laptop adapter & power cord?",
    subtitle: "Original OEM charger vs third party or missing adapter",
    group: "BASIC",
    type: "SINGLE",
    sortOrder: 2,
    options: [
      { id: "o-lc-yes", label: "Original OEM Charger Available", description: "Original factory charger included", iconName: "Zap", sortOrder: 1 },
      { id: "o-lc-no", label: "Missing / Non-Original Charger", description: "Adapter not available or local charger", iconName: "XCircle", sortOrder: 2 },
    ],
  },
  {
    id: "q-lap-warranty",
    title: "Is your laptop under manufacturer warranty?",
    subtitle: "Requires valid brand warranty invoice",
    group: "BASIC",
    type: "SINGLE",
    sortOrder: 3,
    options: [
      { id: "o-lw-yes", label: "Under Manufacturer Warranty", description: "Less than 11 months old with bill", iconName: "ShieldCheck", sortOrder: 1 },
      { id: "o-lw-no", label: "Out of Warranty", description: "More than 11 months old", iconName: "Clock", sortOrder: 2 },
    ],
  },
  {
    id: "q-lap-screen",
    title: "What is the physical condition of the laptop screen display?",
    subtitle: "Inspect display panel glass, lines, and backlight bleed",
    group: "SCREEN",
    type: "SINGLE",
    sortOrder: 4,
    options: [
      { id: "o-ls-flawless", label: "Flawless Display (No Cracks / Lines)", description: "Crystal clear display panel", iconName: "ShieldCheck", sortOrder: 1 },
      { id: "o-ls-cracked", label: "Glass Cracked / Broken Panel", description: "Visible screen glass cracks", iconName: "Smartphone", sortOrder: 2 },
      { id: "o-ls-lines", label: "Display Lines / Dead Pixels / Spots", description: "Vertical lines or dark spots on screen", iconName: "Layers", sortOrder: 3 },
    ],
  },
  {
    id: "q-lap-keyboard",
    title: "Are all laptop keyboard keys & touchpad fully working?",
    subtitle: "Test every letter key, spacebar, and trackpad click",
    group: "FUNCTIONAL",
    type: "SINGLE",
    sortOrder: 5,
    options: [
      { id: "o-lk-yes", label: "Keyboard & Touchpad Work Perfectly", description: "Smooth response across all keys", iconName: "CheckCircle2", sortOrder: 1 },
      { id: "o-lk-no", label: "Sticky / Missing Keys or Unresponsive Touchpad", description: "Some keys dead or trackpad click issue", iconName: "XCircle", sortOrder: 2 },
    ],
  },
  {
    id: "q-lap-battery",
    title: "What is the battery backup health of your laptop?",
    subtitle: "Test battery runtime without plugging in charger",
    group: "FUNCTIONAL",
    type: "SINGLE",
    sortOrder: 6,
    options: [
      { id: "o-lb-good", label: "Holds Charge (2+ Hours Backup)", description: "Normal battery health", iconName: "Zap", sortOrder: 1 },
      { id: "o-lb-dead", label: "Battery Dead (Needs Direct AC Power)", description: "Laptop shuts off immediately if unplugged", iconName: "PowerOff", sortOrder: 2 },
    ],
  },
  {
    id: "q-lap-body",
    title: "What is the physical condition of the laptop body & hinges?",
    subtitle: "Inspect top lid, palmrest, corner dents, and lid hinges",
    group: "BODY",
    type: "SINGLE",
    sortOrder: 7,
    options: [
      { id: "o-lbody-flawless", label: "Flawless Body (No Scratches / Dents)", description: "Like-new laptop casing", iconName: "ShieldCheck", sortOrder: 1 },
      { id: "o-lbody-scratches", label: "Minor Scratches & Normal Wear", description: "Light scratches on lid or base", iconName: "Sliders", sortOrder: 2 },
      { id: "o-lbody-dents", label: "Major Dents / Cracked Casing / Loose Hinge", description: "Corner dent, broken plastic or weak lid hinge", iconName: "AlertTriangle", sortOrder: 3 },
    ],
  },
];

const INITIAL_LAPTOP_PRICING_RULES: PricingRuleData[] = [
  { id: "pr-l1", questionId: "q-lap-power", optionId: "o-lp-yes", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 0 },
  { id: "pr-l2", questionId: "q-lap-power", optionId: "o-lp-no", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 45 },
  { id: "pr-l3", questionId: "q-lap-charger", optionId: "o-lc-yes", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 0 },
  { id: "pr-l4", questionId: "q-lap-charger", optionId: "o-lc-no", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 8 },
  { id: "pr-l5", questionId: "q-lap-warranty", optionId: "o-lw-yes", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 0 },
  { id: "pr-l6", questionId: "q-lap-warranty", optionId: "o-lw-no", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 5 },
  { id: "pr-l7", questionId: "q-lap-screen", optionId: "o-ls-flawless", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 0 },
  { id: "pr-l8", questionId: "q-lap-screen", optionId: "o-ls-cracked", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 25 },
  { id: "pr-l9", questionId: "q-lap-screen", optionId: "o-ls-lines", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 30 },
  { id: "pr-l10", questionId: "q-lap-keyboard", optionId: "o-lk-yes", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 0 },
  { id: "pr-l11", questionId: "q-lap-keyboard", optionId: "o-lk-no", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 12 },
  { id: "pr-l12", questionId: "q-lap-battery", optionId: "o-lb-good", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 0 },
  { id: "pr-l13", questionId: "q-lap-battery", optionId: "o-lb-dead", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 15 },
  { id: "pr-l14", questionId: "q-lap-body", optionId: "o-lbody-flawless", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 0 },
  { id: "pr-l15", questionId: "q-lap-body", optionId: "o-lbody-scratches", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 5 },
  { id: "pr-l16", questionId: "q-lap-body", optionId: "o-lbody-dents", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 18 },
];

export default function AdminPricingPage() {
  const [category, setCategory] = useState<"MOBILE" | "LAPTOP">("MOBILE");
  const [mobileRules, setMobileRules] = useState<PricingRuleData[]>(INITIAL_PRICING_RULES);
  const [laptopRules, setLaptopRules] = useState<PricingRuleData[]>(INITIAL_LAPTOP_PRICING_RULES);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sampleBasePrice, setSampleBasePrice] = useState<number>(category === "MOBILE" ? 60000 : 45000);

  const activeRules = category === "MOBILE" ? mobileRules : laptopRules;
  const activeQuestions = category === "MOBILE" ? INITIAL_QUESTIONS : LAPTOP_QUESTIONS;

  const handleRuleChange = (ruleId: string, val: number) => {
    if (category === "MOBILE") {
      setMobileRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, adjustmentValue: val } : r))
      );
    } else {
      setLaptopRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, adjustmentValue: val } : r))
      );
    }
  };

  const handleTypeChange = (ruleId: string, type: "PERCENTAGE_DEDUCTION" | "PERCENTAGE_BONUS") => {
    if (category === "MOBILE") {
      setMobileRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, adjustmentType: type } : r))
      );
    } else {
      setLaptopRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, adjustmentType: type } : r))
      );
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const stepNames: Record<string, string> = {
    BASIC: "Step 1: Power & Startup / Warranty",
    SCREEN: "Step 2: Display Panel & Screen Condition",
    BODY: "Step 3: Body Wear, Dents & Casing",
    FUNCTIONAL: "Step 4: Functional Defects & Components",
    ACCESSORIES: "Step 5: Accessories & Bill",
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price flex items-center gap-2">
              <Calculator className="w-6 h-6 text-yellow-400" />
              <span>Percentage-Based Pricing Engine</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Set x% percentage deductions on base variant prices for Mobile Phones & Laptops.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl shadow-yellowGlow transition self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>PUBLISH {category} PRICING MATRIX</span>
          </button>
        </div>

        {/* CATEGORY SWITCHER TABS (MOBILE VS LAPTOP) */}
        <div className="flex bg-neutral-800 p-1.5 rounded-2xl border border-neutral-700 shadow-md max-w-md">
          <button
            type="button"
            onClick={() => { setCategory("MOBILE"); setSampleBasePrice(60000); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all ${category === "MOBILE" ? "bg-yellow-400 text-black shadow-md" : "text-neutral-400 hover:text-white"}`}
          >
            <Smartphone className="w-4 h-4" />
            <span>PHONE PRICING</span>
          </button>
          <button
            type="button"
            onClick={() => { setCategory("LAPTOP"); setSampleBasePrice(45000); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all ${category === "LAPTOP" ? "bg-yellow-400 text-black shadow-md" : "text-neutral-400 hover:text-white"}`}
          >
            <Laptop className="w-4 h-4" />
            <span>LAPTOP PRICING</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-green-950 p-4 rounded-2xl border border-green-800 text-xs text-green-300 flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <span>{category} percentage pricing matrix published successfully! Live valuation quotes will now use these exact x% deduction rules.</span>
          </div>
        )}

        {/* LIVE SIMULATION CALCULATOR */}
        <div className="bg-neutral-800 rounded-3xl p-6 border border-neutral-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{category} Valuation Rule Simulator</span>
            <h3 className="text-lg font-black text-white">Test Percentage Impact ({category === "MOBILE" ? "Mobile Phone" : "Laptop"})</h3>
            <p className="text-xs text-neutral-400">Enter a sample {category.toLowerCase()} base price to preview percentage deductions in real time.</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-2xl border border-neutral-700">
              <span className="text-xs font-extrabold text-neutral-400">Sample Base Price: ₹</span>
              <input
                type="number"
                value={sampleBasePrice === 0 ? "" : sampleBasePrice}
                placeholder="10000"
                onChange={(e) => setSampleBasePrice(e.target.value === "" ? 0 : Number(e.target.value))}
                className="w-28 text-sm font-extrabold bg-transparent border-none focus:outline-none text-white font-price"
              />
            </div>
            <div className="px-4 py-2 bg-yellow-400/10 rounded-2xl border border-yellow-400/30">
              <span className="text-[10px] font-bold text-neutral-400 block">Sample 10% Deduction</span>
              <span className="text-sm font-black text-yellow-400 font-price">₹{((sampleBasePrice * 10) / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* QUESTIONS & RULES MATRIX */}
        <div className="space-y-6">
          {activeQuestions.map((question) => {
            const questionRules = activeRules.filter((r) => r.questionId === question.id);
            const stepTitle = stepNames[question.group] || `Group: ${question.group}`;

            return (
              <div key={question.id} className="bg-neutral-800 rounded-3xl p-6 border border-neutral-700 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
                  <div>
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-wider block mb-0.5">
                      {stepTitle}
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      {question.title}
                    </h2>
                  </div>
                  <span className="bg-yellow-950 text-yellow-400 border border-yellow-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    {questionRules.length} Rules
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((opt) => {
                    let rule = questionRules.find((r) => r.optionId === opt.id);
                    const currentVal = rule ? rule.adjustmentValue : 0;
                    const currentType = rule ? rule.adjustmentType : "PERCENTAGE_DEDUCTION";

                    const rupeeImpact = Math.round((sampleBasePrice * currentVal) / 100);

                    return (
                      <div key={opt.id} className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{opt.label}</span>
                          <select
                            value={currentType}
                            onChange={(e) => rule && handleTypeChange(rule.id, e.target.value as any)}
                            className="text-[10px] font-bold bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700 text-neutral-200 focus:outline-none cursor-pointer"
                          >
                            <option value="PERCENTAGE_DEDUCTION">Deduction (-%)</option>
                            <option value="PERCENTAGE_BONUS">Bonus (+%)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-400">Percentage (x%):</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={currentVal === 0 ? "" : currentVal}
                                onChange={(e) => rule && handleRuleChange(rule.id, e.target.value === "" ? 0 : Number(e.target.value))}
                                className="w-24 pl-3 pr-6 py-1.5 text-xs font-extrabold bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400 shadow-sm font-price"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-500">
                                %
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-neutral-400 block">Est. Rupee Impact</span>
                            <span className={`text-xs font-black font-price ${currentType === 'PERCENTAGE_DEDUCTION' ? 'text-red-400' : 'text-green-400'}`}>
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
