"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, Smartphone, Sparkles } from "lucide-react";

export function DeviceSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/models?search=${encodeURIComponent(query.trim())}`).then((r) => r.json());
        if (res.success && res.data) {
          setSearchResults(res.data.slice(0, 6));
        }
      } catch (e) {
        console.error("Search error:", e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-3xl mx-auto relative z-30">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-6 h-6 absolute left-5 text-brand-black/60 pointer-events-none z-10" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search by brand or model (e.g. iPhone 15, Galaxy S24, OnePlus 12)"
            className="w-full pl-14 pr-12 py-4 text-base md:text-lg font-medium text-brand-black bg-white rounded-2xl border-2 border-brand-border shadow-premium focus:outline-none focus:border-brand-yellow transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 text-xs font-bold text-gray-400 hover:text-brand-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* AUTOCOMPLETE DROPDOWN */}
        {focused && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-brand-border overflow-hidden z-50 animate-fadeIn">
            {searchResults.length > 0 ? (
              <div className="divide-y divide-gray-100">
                <div className="px-4 py-2 bg-brand-bg text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Select Your Device Model
                </div>
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/sell/mobile/${item.brand?.slug || "apple"}/${item.slug}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-yellow/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center p-1 border border-gray-100 group-hover:border-brand-yellow/50">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="object-contain max-h-8"
                          />
                        ) : (
                          <Smartphone className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-black group-hover:text-black">
                          {item.brand?.name} {item.name}
                        </div>
                        <div className="text-[11px] text-brand-muted">Released {item.releaseYear || 2024}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-brand-black group-hover:translate-x-1 transition-transform">
                      <span>Get Valuation</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-black" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-brand-black">No devices found matching &quot;{query}&quot;</p>
                <p className="text-xs text-brand-muted mt-1">
                  Try searching for brand names like &quot;Apple&quot; or popular models like &quot;iPhone 15&quot;.
                </p>
                <Link
                  href="/sell/mobile"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-black bg-brand-yellow px-4 py-2 rounded-xl mt-4 hover:bg-brand-yellowHover transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Browse All Brands</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* POPULAR SEARCH QUICK TAGS */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-gray-400">
        <span className="font-semibold text-gray-500">Popular:</span>
        {["iPhone 15", "iPhone 15 Pro", "Galaxy S24"].map((tag) => (
          <button
            key={tag}
            onClick={() => setQuery(tag)}
            className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-brand-yellow/20 hover:text-brand-black border border-gray-200 text-brand-muted transition-colors text-[11px]"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
