"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "@/lib/store";
import { ChevronRight, Smartphone, HelpCircle, ArrowRight, HardDrive, CheckCircle2 } from "lucide-react";

export default function VariantSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = (params?.brand as string) || "apple";
  const modelSlug = (params?.model as string) || "iphone-15";

  const [notSureOpen, setNotSureOpen] = useState(false);

  const brand = INITIAL_BRANDS.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase()) || INITIAL_BRANDS[0];
  const cleanModelSlug = modelSlug.toLowerCase();
  const model = INITIAL_MODELS.find(
    (m) =>
      m.slug.toLowerCase() === cleanModelSlug ||
      m.slug.toLowerCase() === `${brandSlug.toLowerCase()}-${cleanModelSlug}` ||
      m.slug.toLowerCase().replace(`${brandSlug.toLowerCase()}-`, "") === cleanModelSlug.replace(`${brandSlug.toLowerCase()}-`, "") ||
      m.slug.toLowerCase().replace("note-", "") === cleanModelSlug.replace("note-", "") ||
      m.name.toLowerCase().replace(/\s+/g, "-") === cleanModelSlug
  ) || INITIAL_MODELS.find((m) => m.slug === "iphone-15")!;

  const variants = INITIAL_VARIANTS.filter((v) => v.modelId === model.id);
  const fallbackVariants = variants.length > 0 ? variants : [
    { id: "v-default-128", modelId: model.id, storage: "128 GB", basePrice: 28000, active: true },
    { id: "v-default-256", modelId: model.id, storage: "256 GB", basePrice: 34000, active: true },
  ];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(fallbackVariants[0].id);

  const selectedVariant = fallbackVariants.find((v) => v.id === selectedVariantId) || fallbackVariants[0];

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_current_variant", JSON.stringify({
        ...selectedVariant,
        modelName: model.name,
        brandName: brand.name,
      }));
    }
    router.push(`/sell/mobile/${brand.slug}/${model.slug}/assess?variantId=${selectedVariant.id}`);
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
            <Link href={`/sell/mobile/${brand.slug}`} className="hover:text-brand-black">{brand.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{model.name}</span>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium">
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
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      className="object-contain max-h-40"
                      priority
                    />
                  ) : (
                    <Smartphone className="w-16 h-16 text-gray-300" />
                  )}
                </div>
                <h1 className="text-2xl font-black text-brand-black">
                  {model.name.toLowerCase().startsWith(brand.name.toLowerCase())
                    ? model.name
                    : `${brand.name} ${model.name}`}
                </h1>
                <p className="text-xs text-brand-muted mt-1 font-medium">
                  Up to <span className="font-bold text-brand-black">₹{Math.max(...fallbackVariants.map((v) => v.basePrice)).toLocaleString("en-IN")}</span> base valuation
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
                      Select the exact RAM and internal storage capacity of your phone
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
                  {fallbackVariants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;
                    const variantLabel = variant.ram && variant.ram !== variant.storage 
                      ? `${variant.ram} / ${variant.storage}` 
                      : variant.storage;

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
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-brand-yellow text-black' : 'bg-gray-100 text-gray-400'}`}>
                            <HardDrive className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-brand-black">
                              {variantLabel}
                            </div>
                            {variant.ram && variant.ram !== variant.storage ? (
                              <div className="text-[11px] text-brand-muted">{variant.ram} RAM • {variant.storage} ROM</div>
                            ) : (
                              <div className="text-[11px] text-brand-muted">{variant.storage} Storage</div>
                            )}
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
                    <div className="text-xs text-brand-muted">Selected Variant Base Value</div>
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

      {/* NOT SURE STORAGE INSTRUCTION MODAL */}
      <Modal
        isOpen={notSureOpen}
        onClose={() => setNotSureOpen(false)}
        title="How to Check Phone Storage"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-sm text-brand-black mb-1">Apple iPhone (iOS)</h4>
            <ol className="list-decimal list-inside text-gray-600 space-y-1">
              <li>Open <strong>Settings</strong> app on your iPhone</li>
              <li>Tap <strong>General</strong> &rarr; <strong>About</strong></li>
              <li>Look for the <strong>Capacity</strong> line (e.g., 128 GB, 256 GB)</li>
            </ol>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-sm text-brand-black mb-1">Android Phones (Samsung, OnePlus, Xiaomi)</h4>
            <ol className="list-decimal list-inside text-gray-600 space-y-1">
              <li>Open <strong>Settings</strong> app</li>
              <li>Scroll down to <strong>About Phone</strong> or <strong>Storage</strong></li>
              <li>Check total device storage capacity</li>
            </ol>
          </div>

          <div className="pt-2 text-center">
            <Button
              onClick={() => setNotSureOpen(false)}
              variant="secondary"
              size="sm"
              fullWidth
            >
              Got It
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
