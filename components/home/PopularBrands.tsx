"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";

export function PopularBrands() {
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch("/api/catalog/brands?category=MOBILE").then((r) => r.json());
        if (res.success && res.data) {
          setBrands(res.data);
        }
      } catch (e) {
        console.error("Failed to load brands:", e);
      }
    }
    loadBrands();
  }, []);

  const displayBrands = brands.length > 0 ? brands.slice(0, 6) : [
    { id: "b-apple", name: "Apple", slug: "apple" },
    { id: "b-samsung", name: "Samsung", slug: "samsung" },
    { id: "b-oneplus", name: "OnePlus", slug: "oneplus" },
  ];

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
          {displayBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/sell/mobile/${brand.slug}`}
              className="bg-brand-bg rounded-2xl p-6 border border-brand-border hover:border-brand-yellow hover:bg-white shadow-subtleCard hover:shadow-premium transition-all duration-200 text-center group flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-brand-yellow/20 flex items-center justify-center p-3 border border-gray-100 transition-colors">
                <Smartphone className="w-7 h-7 text-brand-black group-hover:scale-110 transition-transform" />
              </div>
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
