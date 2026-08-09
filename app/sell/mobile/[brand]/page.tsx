"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { INITIAL_BRANDS, INITIAL_MODELS } from "@/lib/store";
import { Search, ChevronRight, Smartphone, Sparkles } from "lucide-react";

export default function ModelSelectionPage() {
  const params = useParams();
  const brandSlug = (params?.brand as string) || "apple";
  const [search, setSearch] = useState("");

  const brand = INITIAL_BRANDS.find((b) => b.slug === brandSlug) || INITIAL_BRANDS[0];

  const brandModels = INITIAL_MODELS.filter((m) => m.brandId === brand.id && m.category === "MOBILE");
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
            <Link href="/sell/mobile" className="hover:text-brand-black">Sell Mobile</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{brand.name}</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-black text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{brand.name} Smartphones</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-black">
              Sell Your {brand.name} Phone
            </h1>
            <p className="text-sm text-brand-muted mt-2">
              Select your exact {brand.name} model to calculate estimated price.
            </p>
          </div>

          {/* SEARCH MODEL INPUT */}
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${brand.name} model (e.g. ${brand.slug === 'apple' ? 'iPhone 15' : 'S24 Ultra'})...`}
              className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow shadow-subtleCard"
            />
          </div>

          {/* MODELS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredModels.map((model) => (
              <Link
                key={model.id}
                href={`/sell/mobile/${brand.slug}/${model.slug}`}
                className="bg-white rounded-2xl p-4 border border-brand-border hover:border-brand-yellow hover:shadow-premium transition-all duration-200 text-center group flex flex-col justify-between"
              >
                <div className="w-full aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center p-2 border border-gray-100 group-hover:border-brand-yellow/30 relative">
                  {model.imageUrl ? (
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      width={120}
                      height={120}
                      className="object-contain max-h-24 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Smartphone className="w-10 h-10 text-gray-400" />
                  )}
                  {model.popular && (
                    <span className="absolute top-2 left-2 bg-brand-yellow text-brand-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      POPULAR
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-brand-black group-hover:text-black leading-snug line-clamp-2 min-h-[2.5rem] flex items-center justify-center text-center">
                    {model.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {filteredModels.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-brand-border mt-6">
              <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-black">No {brand.name} models matching &quot;{search}&quot;</p>
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
