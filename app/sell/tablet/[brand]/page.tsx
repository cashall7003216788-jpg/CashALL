"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "@/lib/store";
import { Search, ChevronRight, Tablet, Sparkles, PhoneCall } from "lucide-react";

export default function TabletModelSelectionPage() {
  const params = useParams();
  const brandSlug = (params?.brand as string) || "apple";
  const [search, setSearch] = useState("");

  const brand = INITIAL_BRANDS.find(
    (b) => b.slug.toLowerCase() === brandSlug.toLowerCase()
  ) || { id: `b-${brandSlug}`, name: brandSlug.toUpperCase(), slug: brandSlug, category: "TABLET" };

  const brandModels = INITIAL_MODELS.filter(
    (m) =>
      (m.brandId === brand.id || m.brandSlug?.toLowerCase() === brandSlug.toLowerCase()) &&
      m.category === "TABLET"
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
            <Link href="/sell" className="hover:text-brand-black">Sell Device</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell/tablet" className="hover:text-brand-black">Sell Tablet</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-black font-bold">{brand.name}</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-black text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{brand.name} Tablets &amp; iPads</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-black">
              Sell Your {brand.name} Tablet
            </h1>
            <p className="text-sm text-brand-muted mt-2">
              Select your exact {brand.name} tablet or iPad model to calculate instant estimated price.
            </p>
          </div>

          {/* SEARCH INPUT */}
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${brand.name} model (e.g. iPad Air, Galaxy Tab S9)...`}
              className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow shadow-subtleCard"
            />
          </div>

          {/* MODELS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredModels.map((model) => {
              const modelVariants = INITIAL_VARIANTS.filter((v) => v.modelId === model.id);
              const maxPrice = modelVariants.length > 0
                ? Math.max(...modelVariants.map((v) => v.basePrice))
                : 0;
              const isContactPrice = model.contactForPrice === true;

              return (
                <Link
                  key={model.id}
                  href={`/sell/tablet/${brand.slug}/${model.slug}`}
                  className="bg-white rounded-2xl p-6 border border-brand-border hover:border-brand-yellow hover:shadow-premium transition-all duration-200 text-center group flex flex-col justify-between relative overflow-hidden"
                >
                  {isContactPrice && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      <PhoneCall className="w-3 h-3" />
                      Get Exact Value
                    </div>
                  )}

                  <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 flex items-center justify-center p-4 border border-gray-100 group-hover:border-brand-yellow/30 relative overflow-hidden">
                    <img
                      src={model.imageUrl || "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop"}
                      alt={model.name}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-icon flex flex-col items-center justify-center text-gray-400';
                          fallback.innerHTML = '<svg class="w-12 h-12 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
                          parent.appendChild(fallback);
                        }
                      }}
                      className="object-contain max-h-36 w-full h-full group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-brand-black group-hover:text-black line-clamp-2">
                      {model.name}
                    </h3>
                    {isContactPrice ? (
                      <p className="text-xs text-orange-600 mt-1 font-semibold">Price on request</p>
                    ) : maxPrice > 0 ? (
                      <p className="text-xs text-brand-muted mt-1 font-medium">
                        Get upto{" "}
                        <span className="font-bold text-brand-black">
                          &#8377;{maxPrice.toLocaleString("en-IN")}
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
              <Tablet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-black">No {brand.name} tablets matching &quot;{search}&quot;</p>
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
