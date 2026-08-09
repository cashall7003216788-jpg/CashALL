"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "@/lib/store";
import { Search, ChevronRight, Laptop, Sparkles, PhoneCall } from "lucide-react";

export default function LaptopModelSelectionPage() {
  const params = useParams();
  const brandSlug = (params?.brand as string) || "apple";
  const [search, setSearch] = useState("");

  const brand = INITIAL_BRANDS.find((b) => b.slug === brandSlug) || INITIAL_BRANDS[0];
  const brandModels = INITIAL_MODELS.filter((m) => m.brandId === brand.id && m.category === "LAPTOP").sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );
  const filteredModels = brandModels.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/" className="hover:text-brand-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/laptop" className="hover:text-brand-black">Sell Laptop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{brand.name}</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-black text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{brand.name} Laptops</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-black">
              Sell Your {brand.name} Laptop
            </h1>
            <p className="text-sm text-brand-muted mt-2">
              Select your exact {brand.name} laptop model to calculate estimated price.
            </p>
          </div>

          {/* SEARCH INPUT */}
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${brand.name} laptop model...`}
              className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow shadow-subtleCard"
            />
          </div>

          {/* MODELS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredModels.map((model) => {
              const variant = INITIAL_VARIANTS.find((v) => v.modelId === model.id);
              const isContactPrice = model.contactForPrice === true;
              return (
                <Link
                  key={model.id}
                  href={`/sell/laptop/${brand.slug}/${model.slug}`}
                  className="bg-white rounded-2xl p-6 border border-brand-border hover:border-brand-yellow hover:shadow-premium transition-all duration-200 text-center group flex flex-col justify-between relative overflow-hidden"
                >
                  {isContactPrice && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      <PhoneCall className="w-3 h-3" />
                      Get Exact Value
                    </div>
                  )}

                  <div className="w-full aspect-video bg-gray-50 rounded-xl mb-4 flex items-center justify-center p-4 border border-gray-100 group-hover:border-brand-yellow/30">
                    {model.imageUrl ? (
                      <Image
                        src={model.imageUrl}
                        alt={model.name}
                        width={200}
                        height={130}
                        className="object-contain max-h-32 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Laptop className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-brand-black group-hover:text-black">
                      {model.name}
                    </h3>
                    {isContactPrice ? (
                      <p className="text-xs text-orange-600 mt-1 font-semibold">Price on request</p>
                    ) : variant ? (
                      <p className="text-xs text-brand-muted mt-1 font-medium">
                        Get upto{" "}
                        <span className="font-bold text-brand-black">
                          &#8377;{variant.basePrice.toLocaleString("en-IN")}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredModels.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-brand-border mt-6">
              <Laptop className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-black">No {brand.name} laptops matching &quot;{search}&quot;</p>
              <button
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-brand-black underline mt-2"
              >
                Clear search
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
