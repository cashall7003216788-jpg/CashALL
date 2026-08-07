"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ChevronRight, Smartphone, HelpCircle, HardDrive, CheckCircle2 } from "lucide-react";

export default function VariantSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "iphone-15";

  const [loading, setLoading] = useState(true);
  const [modelData, setModelData] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [notSureOpen, setNotSureOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/catalog/models/${modelSlug}`).then((r) => r.json());
        if (res.success && res.data) {
          setModelData(res.data.model);
          if (res.data.model.variants?.length > 0) {
            setSelectedVariantId(res.data.model.variants[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load model details:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [modelSlug]);

  const model = modelData || {
    name: modelSlug.replace(/-/g, " ").toUpperCase(),
    brand: { name: brandSlug.toUpperCase(), slug: brandSlug },
    variants: [
      { id: "v-default-128", storage: "128 GB", basePrice: 32000 },
      { id: "v-default-256", storage: "256 GB", basePrice: 38000 },
    ],
  };

  const variants = model.variants || [];
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || variants[0];

  const handleContinue = () => {
    router.push(`/sell/mobile/${brandSlug}/${modelSlug}/assess?variantId=${selectedVariant?.id || ""}`);
  };

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
            <Link href={`/sell/mobile/${brandSlug}`} className="hover:text-brand-black">{model.brand?.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{model.name}</span>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-gray-400">Loading device details from database...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* DEVICE PREVIEW */}
                <div className="md:col-span-5 text-center flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-100 shadow-subtleCard mb-4">
                    {model.imageUrl ? (
                      <Image
                        src={model.imageUrl}
                        alt={model.name}
                        width={180}
                        height={180}
                        className="object-contain max-h-40"
                        priority
                      />
                    ) : (
                      <Smartphone className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  <h1 className="text-2xl font-black text-brand-black">
                    {model.brand?.name} {model.name}
                  </h1>
                  <p className="text-xs text-brand-muted mt-1 font-medium">
                    Up to <span className="font-bold text-brand-black">₹{Math.max(...variants.map((v: any) => v.basePrice || 0)).toLocaleString("en-IN")}</span> base valuation
                  </p>
                </div>

                {/* VARIANT SELECTION */}
                <div className="md:col-span-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-brand-black">
                        Choose Your Storage Variant
                      </h2>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Select the exact internal storage capacity of your phone
                      </p>
                    </div>

                    <button
                      onClick={() => setNotSureOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-black bg-brand-yellow/20 hover:bg-brand-yellow/40 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Not Sure?</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {variants.map((v: any) => {
                      const isSelected = v.id === selectedVariant?.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? "border-brand-yellow bg-brand-yellow/10 ring-2 ring-brand-yellow/50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-black text-brand-black">
                              <HardDrive className="w-4 h-4 text-brand-black" />
                              <span>{v.storage}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-black" />}
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-400">Base Value:</span>
                            <span className="text-sm font-black font-price text-brand-black">
                              ₹{v.basePrice.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={handleContinue}
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="text-base font-extrabold shadow-yellowGlow"
                    >
                      <span>Continue to Condition Assessment &rarr;</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* NOT SURE MODAL */}
      <Modal isOpen={notSureOpen} onClose={() => setNotSureOpen(false)} title="How to Check Your Storage">
        <div className="space-y-4 text-xs font-medium text-brand-black">
          <p>
            You can verify your phone&apos;s exact internal storage capacity in Settings:
          </p>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="font-bold text-black">iPhone (iOS):</div>
            <div>Settings &rarr; General &rarr; About &rarr; Capacity</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="font-bold text-black">Android (Samsung, OnePlus, Xiaomi):</div>
            <div>Settings &rarr; About Phone / Device Care &rarr; Storage</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
