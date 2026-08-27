"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "@/lib/store";
import { ChevronRight, ArrowRight, Sparkles, Tablet, Check } from "lucide-react";
import { trackMetaStandardEvent } from "@/lib/analytics/meta";

export default function TabletVariantSelectionPage() {
  const params = useParams();
  const router = useRouter();

  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "ipad-air-1st-gen-wi-fi-only";

  const brand = INITIAL_BRANDS.find(
    (b) => b.slug.toLowerCase() === brandSlug.toLowerCase()
  ) || { id: `b-${brandSlug}`, name: brandSlug.toUpperCase(), slug: brandSlug, category: "TABLET" };

  const model = INITIAL_MODELS.find(
    (m) =>
      (m.slug.toLowerCase() === modelSlug.toLowerCase() || m.id === modelSlug) &&
      m.category === "TABLET"
  ) || INITIAL_MODELS.find(
    (m) => m.category === "TABLET" && m.brandSlug?.toLowerCase() === brandSlug.toLowerCase()
  ) || INITIAL_MODELS.find((m) => m.category === "TABLET") || INITIAL_MODELS[0];

  const variants = INITIAL_VARIANTS.filter((v) => v.modelId === model?.id);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ""
  );

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  useEffect(() => {
    if (model && brand) {
      trackMetaStandardEvent("ViewContent", {
        content_type: "product",
        content_name: `${brand.name} ${model.name}`,
        content_category: "tablet",
        brand: brand.name,
        model: model.name,
        value: selectedVariant?.basePrice || 0,
        currency: "INR",
      }, { eventId: `view_tablet_${brand.slug}_${model.slug}` });
    }
  }, [model?.id, brand?.id]);

  const handleContinue = () => {
    if (!selectedVariant) return;
    router.push(`/sell/tablet/${brand.slug}/${model.slug}/assess?variantId=${selectedVariant.id}`);
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
            <Link href="/sell" className="hover:text-brand-black">Sell Device</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/tablet" className="hover:text-brand-black">Sell Tablet</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/sell/tablet/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{model?.name}</span>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100">
              
              {/* DEVICE IMAGE */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-200 shrink-0">
                <img
                  src={model?.imageUrl || "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop"}
                  alt={model?.name || "Tablet"}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-icon')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-icon flex flex-col items-center justify-center text-gray-400';
                      fallback.innerHTML = '<svg class="w-16 h-16 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
                      parent.appendChild(fallback);
                    }
                  }}
                  className="object-contain max-h-36 max-w-36"
                />
              </div>

              {/* DEVICE INFO & PRICING PREVIEW */}
              <div className="space-y-3 text-center md:text-left flex-grow">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-black text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{brand.name}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black">
                  {model?.name}
                </h1>
                <p className="text-sm text-brand-muted">
                  Choose your exact storage &amp; connectivity variant to calculate fair market valuation.
                </p>

                {selectedVariant && (
                  <div className="pt-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Estimated Valuation Up to
                    </div>
                    <div className="text-3xl font-black text-brand-black">
                      &#8377;{selectedVariant.basePrice.toLocaleString("en-IN")}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* VARIANTS SELECTION GRID */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Select Your Tablet Variant
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? "border-brand-yellow bg-brand-yellow/10 shadow-md ring-2 ring-brand-yellow/30"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-base font-extrabold text-brand-black">
                          {v.ram ? `${v.ram} / ${v.storage}` : v.storage}
                        </div>
                        <div className="text-xs text-brand-muted font-medium">
                          Up to <span className="font-bold text-brand-black">&#8377;{v.basePrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected ? "bg-brand-black border-brand-black text-brand-yellow" : "border-gray-300 bg-white"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {variants.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Standard configuration available.
                </div>
              )}
            </div>

            {/* CONTINUE CTA */}
            <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={`/sell/tablet/${brand.slug}`}
                className="text-xs font-bold text-brand-muted hover:text-brand-black underline"
              >
                &larr; Choose a different tablet
              </Link>

              <Button
                onClick={handleContinue}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-black text-sm px-8 shadow-yellowGlow flex items-center justify-center gap-2"
              >
                <span>Continue Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
