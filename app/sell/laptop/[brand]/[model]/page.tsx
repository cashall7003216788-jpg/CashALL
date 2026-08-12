"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "@/lib/store";
import { ChevronRight, Laptop, ArrowRight, CheckCircle2, Cpu } from "lucide-react";

export default function LaptopVariantSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "macbook-air-2025";

  const brand = INITIAL_BRANDS.find((b) => b.slug === brandSlug) || INITIAL_BRANDS[0];
  const model = INITIAL_MODELS.find((m) => m.slug === modelSlug) || INITIAL_MODELS[0];

  const variants = INITIAL_VARIANTS.filter((v) => v.modelId === model?.id);
  const fallbackVariants = variants.length > 0 ? variants : [
    { id: "v-default-laptop-1", modelId: model?.id ?? "", ram: "Standard", storage: "Standard", basePrice: 0, active: true },
  ];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(fallbackVariants[0].id);
  const selectedVariant = fallbackVariants.find((v) => v.id === selectedVariantId) || fallbackVariants[0];

  const handleContinue = () => {
    router.push(`/sell/laptop/${brand.slug}/${model?.slug}/assess?variantId=${selectedVariant.id}`);
  };

  const isContactPrice = model?.contactForPrice === true;

  // ── Contact-for-price model (MSI Crosshair etc.) ────────────────────────────
  if (isContactPrice) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
        <Header />
        <main className="flex-grow py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
              <Link href="/" className="hover:text-brand-black">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/sell/laptop" className="hover:text-brand-black">Sell Laptop</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/sell/laptop/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-brand-black font-bold">{model?.name}</span>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border shadow-premium text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-100">
                <Laptop className="w-10 h-10 text-orange-500" />
              </div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <span>Get Exact Value</span>
              </div>
              <h1 className="text-3xl font-black text-brand-black mb-3">
                {brand.name} {model?.name}
              </h1>
              <p className="text-sm text-brand-muted max-w-md mx-auto mb-8 leading-relaxed">
                This model requires a manual inspection to determine the exact resale value.
                Our team will evaluate your laptop and give you the best possible price within minutes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left">
                  <div className="text-xs text-brand-muted font-semibold mb-1">Step 1</div>
                  <div className="text-sm font-extrabold text-brand-black">Contact Us</div>
                  <div className="text-xs text-brand-muted mt-0.5">Call or WhatsApp our team</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left">
                  <div className="text-xs text-brand-muted font-semibold mb-1">Step 2</div>
                  <div className="text-sm font-extrabold text-brand-black">Free Inspection</div>
                  <div className="text-xs text-brand-muted mt-0.5">We assess &amp; quote on the spot</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:+919999999999"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-yellow text-brand-black font-extrabold rounded-xl shadow-yellowGlow hover:opacity-90 transition-opacity text-sm"
                >
                  <span>📞</span>
                  Call for Exact Price
                </a>
                <a
                  href={`https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20sell%20my%20${encodeURIComponent(model?.name ?? "")}%20laptop`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 text-white font-extrabold rounded-xl hover:bg-green-600 transition-colors text-sm"
                >
                  <span>💬</span>
                  WhatsApp Us
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  href={`/sell/laptop/${brand.slug}`}
                  className="text-xs text-brand-muted hover:text-brand-black font-semibold underline"
                >
                  ← Back to {brand.name} models
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Normal variant-selection flow ─────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/laptop" className="hover:text-brand-black">Sell Laptop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/laptop/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{model?.name}</span>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-5 text-center flex flex-col items-center">
                <div className="w-56 h-40 bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-100 shadow-subtleCard mb-4">
                  {model?.imageUrl ? (
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      width={220}
                      height={140}
                      className="object-contain max-h-32"
                      priority
                    />
                  ) : (
                    <Laptop className="w-16 h-16 text-gray-300" />
                  )}
                </div>
                <h1 className="text-2xl font-black text-brand-black">
                  {brand.name} {model?.name}
                </h1>
                <p className="text-xs text-brand-muted mt-1 font-medium">
                  Get upto{" "}
                  <span className="font-bold text-brand-black">
                    ₹{Math.max(...fallbackVariants.map((v) => v.basePrice)).toLocaleString("en-IN")}
                  </span>
                </p>
              </div>

              <div className="md:col-span-7 space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-extrabold text-brand-black">
                    CashALL Resale Valuation
                  </h2>
                  <p className="text-xs text-brand-muted mt-0.5">
                    Real-time estimated valuation for this model
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {fallbackVariants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? "border-brand-yellow bg-brand-yellow/10 shadow-subtleCard"
                            : "border-brand-border bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-brand-yellow text-black" : "bg-gray-100 text-gray-400"}`}>
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-brand-black">
                              {variant.ram && variant.ram !== "Standard" ? `${variant.ram} · ${variant.storage}` : model?.name}
                            </div>
                            <div className="text-[11px] text-brand-muted">
                              Get Upto: ₹{variant.basePrice.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-brand-black fill-brand-yellow" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-brand-muted">CashALL Base Valuation</div>
                    <div className="text-2xl font-black text-brand-black font-price">
                      ₹{selectedVariant.basePrice.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <Button
                    onClick={handleContinue}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-extrabold px-8 gap-2 shadow-yellowGlow"
                  >
                    <span>Continue to Condition Assessment</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
