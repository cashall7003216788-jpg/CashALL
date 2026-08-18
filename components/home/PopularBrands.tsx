"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { INITIAL_BRANDS, BrandData } from "@/lib/store";
import { ArrowRight } from "lucide-react";
import { BrandIcon } from "@/components/common/BrandIcon";

export function PopularBrands() {
  const [brands, setBrands] = useState<BrandData[]>([]);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch("/api/v1/catalog");
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.brands) && json.data.brands.length > 0) {
          const apiBrands = json.data.brands;
          setBrands(() => {
            const mergedMap = new Map<string, BrandData>();
            INITIAL_BRANDS.forEach((b) => mergedMap.set(b.slug || b.name.toLowerCase(), b));
            apiBrands.forEach((b: BrandData) => mergedMap.set(b.slug || b.name.toLowerCase(), b));
            return Array.from(mergedMap.values());
          });
        } else {
          setBrands(INITIAL_BRANDS);
        }
      } catch (err) {
        setBrands(INITIAL_BRANDS);
      }
    }
    loadBrands();
  }, []);

  const displayBrands = brands.length > 0 ? brands : INITIAL_BRANDS;
  const mobileBrands = displayBrands
    .filter((b) => b.category === "MOBILE" || b.category === "BOTH")
    .slice(0, 6);

  return (
    <section className="py-16 bg-white border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black">
              Popular Phone Brands
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              Select your smartphone manufacturer to view available models
            </p>
          </div>

          <Link
            href="/sell/mobile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-black hover:text-black group"
          >
            <span>View All Brands</span>
            <ArrowRight className="w-4 h-4 text-brand-black group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {mobileBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/sell/mobile/${brand.slug}`}
              className="bg-brand-bg rounded-2xl p-6 border border-brand-border hover:border-brand-yellow hover:bg-white shadow-subtleCard hover:shadow-premium transition-all duration-200 text-center group flex flex-col items-center justify-center space-y-3"
            >
              <BrandIcon name={brand.name} logoUrl={brand.logoUrl} />
              <div>
                <h3 className="text-base font-extrabold text-brand-black group-hover:text-black">
                  {brand.name}
                </h3>
                <p className="text-[11px] text-brand-muted font-medium mt-0.5">
                  Sell {brand.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
