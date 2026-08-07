"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calculator,
  Save,
  CheckCircle2,
  Sliders,
  History,
  TrendingDown,
  TrendingUp,
  Gift,
  AlertTriangle,
  MinusCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<"RULES" | "HISTORY" | "CALCULATIONS">("RULES");
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [pricingHistory, setPricingHistory] = useState<any[]>([]);
  const [offerCalculations, setOfferCalculations] = useState<any[]>([]);

  const [editRule, setEditRule] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resQ, resR, resH, resC] = await Promise.all([
        fetch("/api/admin/catalog/questions").then((r) => r.json()),
        fetch("/api/admin/catalog/pricing-rules").then((r) => r.json()),
        fetch("/api/admin/catalog/pricing-history").then((r) => r.json()),
        fetch("/api/admin/catalog/offer-calculations").then((r) => r.json()),
      ]);

      if (resQ.success) setQuestions(resQ.data);
      if (resR.success) setPricingRules(resR.data);
      if (resH.success) setPricingHistory(resH.data);
      if (resC.success) setOfferCalculations(resC.data);
    } catch (e) {
      console.error("Failed to load pricing data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRule = async () => {
    if (!editRule) return;
    try {
      const res = await fetch("/api/admin/catalog/pricing-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editRule.id,
          ruleType: editRule.ruleType,
          adjustmentValue: parseFloat(editRule.adjustmentValue),
          minValue: editRule.minValue !== "" ? parseFloat(editRule.minValue) : null,
          maxValue: editRule.maxValue !== "" ? parseFloat(editRule.maxValue) : null,
          active: editRule.active,
          reason: editRule.reason || "Admin Pricing Edit",
          changedBy: "Admin Operator",
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowEditModal(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        fetchData();
      } else {
        alert(res.error || "Failed to update pricing rule");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRuleTypeBadge = (ruleType: string) => {
    switch (ruleType) {
      case "PERCENTAGE_DECREASE":
      case "PERCENTAGE_DEDUCTION":
        return <Badge variant="yellow"><TrendingDown className="w-3 h-3 mr-1 inline" />% Decrease</Badge>;
      case "FIXED_DECREASE":
      case "FIXED_DEDUCTION":
      case "PENALTY":
        return <Badge variant="neutral"><MinusCircle className="w-3 h-3 mr-1 inline" />Fixed Decrease</Badge>;
      case "BONUS":
      case "FIXED_BONUS":
      case "PERCENTAGE_INCREASE":
      case "FIXED_INCREASE":
        return <Badge variant="yellow"><Gift className="w-3 h-3 mr-1 inline" />Bonus / Increase</Badge>;
      case "NO_CHANGE":
      default:
        return <Badge variant="neutral">No Change</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Dynamic Pricing Engine & Rule Matrix
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Edit deduction rules, percentage adjustments, min/max bounds, version history, and live calculations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab("HISTORY")}
              variant="tertiary"
              size="sm"
              className="font-bold text-xs bg-white text-brand-black border-brand-border"
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit History</span>
            </Button>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-xs text-green-900 flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>Pricing rule updated in PostgreSQL! Version audit snapshot saved in PricingHistory.</span>
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          {(["RULES", "HISTORY", "CALCULATIONS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === tab
                  ? "bg-brand-black text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-brand-border"
              }`}
            >
              {tab === "RULES" ? "Pricing Rules Matrix" : tab === "HISTORY" ? `Pricing History (${pricingHistory.length})` : `Customer Offer Calculations (${offerCalculations.length})`}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-gray-400">Loading pricing matrix from database...</div>
        ) : activeTab === "RULES" ? (
          <div className="space-y-6">
            {questions.map((question) => {
              return (
                <div key={question.id} className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h2 className="text-base font-extrabold text-brand-black">
                        {question.title}
                      </h2>
                      <span className="text-[11px] font-bold text-gray-400 uppercase">
                        Group: {question.group} | Type: {question.type}
                      </span>
                    </div>
                    <Badge variant="yellow">{question.options?.length || 0} Options</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options?.map((opt: any) => {
                      const rule = pricingRules.find((r) => r.optionId === opt.id);
                      return (
                        <div key={opt.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-brand-black">{opt.label}</span>
                            {rule ? getRuleTypeBadge(rule.ruleType) : <Badge variant="neutral">Default Rule</Badge>}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="text-xs font-bold text-gray-600 font-price">
                              Value: {rule?.ruleType?.includes("PERCENTAGE") ? `${rule?.adjustmentValue}%` : `₹${(rule?.adjustmentValue || 0).toLocaleString("en-IN")}`}
                            </div>

                            <button
                              onClick={() => {
                                setEditRule({
                                  id: rule?.id || "",
                                  optionId: opt.id,
                                  questionId: question.id,
                                  label: opt.label,
                                  ruleType: rule?.ruleType || "PERCENTAGE_DECREASE",
                                  adjustmentValue: String(rule?.adjustmentValue || 5),
                                  minValue: rule?.minValue !== null && rule?.minValue !== undefined ? String(rule.minValue) : "",
                                  maxValue: rule?.maxValue !== null && rule?.maxValue !== undefined ? String(rule.maxValue) : "",
                                  active: rule?.active !== undefined ? rule.active : true,
                                  reason: "Admin Pricing Update",
                                });
                                setShowEditModal(true);
                              }}
                              className="px-3 py-1 bg-brand-yellow hover:bg-brand-yellowHover text-black text-xs font-extrabold rounded-xl transition-all shadow-sm"
                            >
                              Configure Rule
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === "HISTORY" ? (
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
            <h2 className="text-base font-extrabold text-brand-black">Pricing History & Audit Trail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase border-b border-gray-100">
                    <th className="p-3">Question / Option</th>
                    <th className="p-3">Old Value</th>
                    <th className="p-3">New Value</th>
                    <th className="p-3">Changed By</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pricingHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-bold text-brand-black">
                        {h.rule?.option?.label || "Option Rule"}
                      </td>
                      <td className="p-3 font-bold text-gray-500 font-price">
                        {h.oldValue !== null ? `${h.oldValue} (${h.oldType || ""})` : "Initial"}
                      </td>
                      <td className="p-3 font-bold text-green-700 font-price">
                        {h.newValue} ({h.newType})
                      </td>
                      <td className="p-3 font-semibold text-brand-black">{h.changedBy || "Admin"}</td>
                      <td className="p-3 text-gray-500">{h.reason || "N/A"}</td>
                      <td className="p-3 text-gray-400 font-medium">
                        {new Date(h.createdAt).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
            <h2 className="text-base font-extrabold text-brand-black">Live Customer Offer Calculation History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase border-b border-gray-100">
                    <th className="p-3">Quote #</th>
                    <th className="p-3">Device Model</th>
                    <th className="p-3">Base Price</th>
                    <th className="p-3">Deductions / Adjustments</th>
                    <th className="p-3">Final Offer</th>
                    <th className="p-3">Calculated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {offerCalculations.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-black text-brand-black">{c.quoteNumber}</td>
                      <td className="p-3 font-bold text-brand-black">{c.model?.brand?.name} {c.model?.name}</td>
                      <td className="p-3 font-bold font-price text-gray-500">₹{c.basePrice.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-red-600 font-bold font-price">
                        -₹{(c.fixedAdjustments + c.percentageAdjustments).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-black font-price text-brand-black">₹{c.finalOffer.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-gray-400 font-medium">{new Date(c.calculatedAt).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONFIGURE RULE MODAL */}
        {showEditModal && editRule && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fadeIn">
              <h3 className="text-lg font-black text-brand-black">Configure Rule: {editRule.label}</h3>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-gray-500 mb-1">Pricing Rule Type</label>
                  <select
                    value={editRule.ruleType}
                    onChange={(e) => setEditRule({ ...editRule, ruleType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow font-bold"
                  >
                    <option value="PERCENTAGE_DECREASE">Percentage Decrease (%)</option>
                    <option value="PERCENTAGE_INCREASE">Percentage Increase (%)</option>
                    <option value="FIXED_DECREASE">Fixed Amount Decrease (₹)</option>
                    <option value="FIXED_INCREASE">Fixed Amount Increase (₹)</option>
                    <option value="BONUS">Bonus (₹)</option>
                    <option value="PENALTY">Penalty (₹)</option>
                    <option value="NO_CHANGE">No Price Change</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">
                    Adjustment Value ({editRule.ruleType.includes("PERCENTAGE") ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    value={editRule.adjustmentValue}
                    onChange={(e) => setEditRule({ ...editRule, adjustmentValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow font-price font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-500 mb-1">Min Floor Value (Optional ₹)</label>
                    <input
                      type="number"
                      value={editRule.minValue || ""}
                      onChange={(e) => setEditRule({ ...editRule, minValue: e.target.value })}
                      className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Max Cap Value (Optional ₹)</label>
                    <input
                      type="number"
                      value={editRule.maxValue || ""}
                      onChange={(e) => setEditRule({ ...editRule, maxValue: e.target.value })}
                      className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">Reason for Audit Log</label>
                  <input
                    type="text"
                    value={editRule.reason}
                    onChange={(e) => setEditRule({ ...editRule, reason: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. Adjusted festival deduction rates"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleUpdateRule} className="font-extrabold shadow-yellowGlow">Publish Rule Change</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
