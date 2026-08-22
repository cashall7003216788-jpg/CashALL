"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { INITIAL_BRANDS, INITIAL_MODELS, BrandData } from "@/lib/store";
import { Search, ChevronRight } from "lucide-react";
import { BrandIcon } from "@/components/common/BrandIcon";

export default function BrandSelectionPage() {
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<BrandData[]>(INITIAL_BRANDS);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch("/api/v1/catalog?category=MOBILE");
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.brands) && json.data.brands.length > 0) {
          const apiBrands = json.data.brands;
          // Merge API brands into INITIAL_BRANDS without discarding any initial brands
          setBrands((prev) => {
            const mergedMap = new Map<string, BrandData>();
            prev.forEach((b) => mergedMap.set(b.slug || b.name.toLowerCase(), b));
            apiBrands.forEach((b: BrandData) => mergedMap.set(b.slug || b.name.toLowerCase(), b));
            return Array.from(mergedMap.values());
          });
        }
      } catch (e) {
        console.error("Error loading brands", e);
      }
    }
    loadBrands();
  }, []);

  const mobileBrands = brands.filter((b) =>
    INITIAL_MODELS.some(
      (m) =>
        (m.brandId === b.id || m.brandSlug?.toLowerCase() === b.slug?.toLowerCase()) &&
        m.category === "MOBILE"
    )
  );

  const filteredBrands = mobileBrands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase().trim())
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
            <span className="text-brand-black">Sell Mobile</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-black">
              Choose Your Phone Brand
            </h1>
            <p className="text-sm text-brand-muted mt-2">
              Select the manufacturer of the phone you want to sell.
            </p>
          </div>

          {/* SEARCH INPUT */}
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand (e.g. Apple, Samsung, OnePlus)"
              className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow shadow-subtleCard"
            />
          </div>

          {/* POPULAR BRANDS GRID */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Popular Smartphone Manufacturers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {filteredBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/sell/mobile/${brand.slug}`}
                    className="bg-white rounded-2xl p-6 border border-brand-border hover:border-brand-yellow hover:shadow-premium transition-all duration-200 text-center group flex flex-col items-center justify-center space-y-3"
                  >
                    <BrandIcon name={brand.name} logoUrl={brand.logoUrl} />
                    <span className="text-base font-extrabold text-brand-black group-hover:text-black">
                      {brand.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {filteredBrands.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-brand-border">
                <p className="text-sm font-bold text-brand-black">No brands matching &quot;{search}&quot;</p>
                <button
                  onClick={() => setSearch("")}
                  className="text-xs font-semibold text-brand-black underline mt-2"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
