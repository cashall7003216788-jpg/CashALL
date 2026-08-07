"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Box,
  Check,
  ShieldCheck,
} from "lucide-react";

export default function ConditionAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "iphone-15";
  const variantIdParam = searchParams.get("variantId") || "";

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [modelData, setModelData] = useState<any>(null);
  const [questionSet, setQuestionSet] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // Selected Answers State: Map<questionId, optionId>
  const [selectedAnswersMap, setSelectedAnswersMap] = useState<{ [key: string]: string }>({});

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Quote Result State
  const [quoteResult, setQuoteResult] = useState<any>(null);

  useEffect(() => {
    async function loadAssessmentData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/catalog/models/${modelSlug}`).then((r) => r.json());
        if (res.success && res.data) {
          setModelData(res.data.model);
          const qSet = res.data.questionSet;
          setQuestionSet(qSet);

          const qList = qSet?.questions || [];
          setQuestions(qList);

          // Initialize default answers (first option for each single question)
          const initialMap: { [key: string]: string } = {};
          qList.forEach((q: any) => {
            if (q.options && q.options.length > 0) {
              initialMap[q.id] = q.options[0].id;
            }
          });
          setSelectedAnswersMap(initialMap);
        }
      } catch (e) {
        console.error("Failed to load assessment questions:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAssessmentData();
  }, [modelSlug]);

  const selectedVariant =
    modelData?.variants?.find((v: any) => v.id === variantIdParam) ||
    modelData?.variants?.[0] || {
      id: "v-default",
      storage: "128 GB",
      basePrice: 32000,
    };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswersMap((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Calculate Quote via Dynamic Database API Engine
  const handleCalculateQuote = async () => {
    setCalculating(true);
    try {
      const answersPayload = Object.entries(selectedAnswersMap).map(([qId, optId]) => {
        const question = questions.find((q) => q.id === qId);
        const option = question?.options?.find((o: any) => o.id === optId);
        return {
          questionId: qId,
          questionTitle: question?.title || "",
          group: question?.group || "CONDITION",
          optionId: optId,
          optionLabel: option?.label || "",
        };
      });

      const res = await fetch("/api/quote/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: modelData?.id,
          variantId: selectedVariant.id,
          selectedAnswers: answersPayload,
        }),
      }).then((r) => r.json());

      if (res.success && res.data) {
        setQuoteResult(res.data);
        // Persist session quote snapshot
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `cashall_quote_${res.data.quoteNumber}`,
            JSON.stringify(res.data)
          );
        }
      }
    } catch (e) {
      console.error("Failed to calculate quote:", e);
    } finally {
      setCalculating(false);
    }
  };

  const currentQuestion = questions[currentStepIndex];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/mobile" className="hover:text-brand-black">Sell Mobile</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{modelData?.name || modelSlug}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">Device Assessment</span>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium space-y-8">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-gray-400">Loading dynamic questionnaire...</div>
            ) : quoteResult ? (
              /* QUOTE RESULT VIEW */
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center space-y-2 border-b border-gray-100 pb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-extrabold border border-green-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Instant Price Guarantee Generated</span>
                  </div>
                  <h1 className="text-3xl font-black text-brand-black">
                    Your Device Valuation: <span className="text-brand-black font-price">₹{quoteResult.estimatedPrice.toLocaleString("en-IN")}</span>
                  </h1>
                  <p className="text-xs text-brand-muted">
                    Quote Reference: <span className="font-bold text-brand-black">{quoteResult.quoteNumber}</span> | Valid for 7 Days
                  </p>
                </div>

                {/* BREAKDOWN */}
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <h3 className="text-sm font-extrabold text-brand-black">Price Calculation Breakdown</h3>
                  <div className="flex justify-between text-xs py-1 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">Base Device Value ({selectedVariant.storage}):</span>
                    <span className="font-bold font-price">₹{quoteResult.basePrice.toLocaleString("en-IN")}</span>
                  </div>

                  {quoteResult.breakdown?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-1">
                      <span className="text-gray-600">{item.title} ({item.selection}):</span>
                      <span className={`font-bold font-price ${item.calculatedAmount < 0 ? "text-red-600" : "text-green-600"}`}>
                        {item.calculatedAmount < 0 ? `-₹${Math.abs(item.calculatedAmount).toLocaleString("en-IN")}` : `+₹${item.calculatedAmount.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-gray-300 flex justify-between text-sm font-black">
                    <span>Final Instant Offer:</span>
                    <span className="font-price">₹{quoteResult.estimatedPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    href={`/checkout?quoteId=${quoteResult.quoteNumber}`}
                    className="w-full"
                  >
                    <Button variant="primary" size="lg" fullWidth className="text-base font-extrabold shadow-yellowGlow">
                      Book Free Doorstep Pickup &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* WIZARD QUESTION VIEW */
              <div className="space-y-6">
                {/* WIZARD HEADER & PROGRESS */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wider block">
                      Step {currentStepIndex + 1} of {questions.length}
                    </span>
                    <h2 className="text-xl font-black text-brand-black">
                      {currentQuestion?.title || "Device Condition Question"}
                    </h2>
                    {currentQuestion?.subtitle && (
                      <p className="text-xs text-brand-muted mt-0.5">{currentQuestion.subtitle}</p>
                    )}
                  </div>

                  <span className="px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-black text-[11px] font-extrabold uppercase">
                    {currentQuestion?.group || "CONDITION"}
                  </span>
                </div>

                {/* OPTIONS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion?.options?.map((opt: any) => {
                    const isSelected = selectedAnswersMap[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                        className={`p-5 rounded-2xl border text-left transition-all relative space-y-1.5 ${
                          isSelected
                            ? "border-brand-yellow bg-brand-yellow/10 ring-2 ring-brand-yellow/50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-brand-black">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-black shrink-0" />}
                        </div>
                        {opt.description && (
                          <p className="text-xs text-gray-500 leading-snug">{opt.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* WIZARD CONTROLS */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <Button
                    onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentStepIndex === 0}
                    variant="tertiary"
                    size="md"
                    className="font-bold text-xs"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous Step
                  </Button>

                  {currentStepIndex < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStepIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      variant="primary"
                      size="md"
                      className="font-extrabold text-xs shadow-yellowGlow"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCalculateQuote}
                      disabled={calculating}
                      variant="primary"
                      size="lg"
                      className="font-extrabold text-sm shadow-yellowGlow px-8"
                    >
                      {calculating ? "Calculating Valuation..." : "Get Instant Value Offer →"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
