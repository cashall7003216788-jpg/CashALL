"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "@/lib/store";
import { Smartphone, Plus, Edit, HardDrive, Search } from "lucide-react";

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<"MODELS" | "BRANDS" | "VARIANTS">("MODELS");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Device Catalog Management
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Manage brands, models, storage variants, images and base acquisition prices
            </p>
          </div>

          <Button variant="primary" size="sm" className="font-extrabold gap-1.5 shadow-yellowGlow">
            <Plus className="w-4 h-4" />
            <span>Add New Device Model</span>
          </Button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          {(["MODELS", "BRANDS", "VARIANTS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === tab
                  ? "bg-brand-black text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-brand-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${activeTab.toLowerCase()}...`}
            className="w-full pl-10 pr-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
          />
        </div>

        {/* CONTENT MATRIX */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard">
          {activeTab === "MODELS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {INITIAL_MODELS.map((model) => (
                <div key={model.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 border border-gray-200">
                      <Smartphone className="w-5 h-5 text-brand-black" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-brand-black">{model.name}</div>
                      <div className="text-[11px] text-gray-400">Year: {model.releaseYear}</div>
                    </div>
                  </div>
                  <Badge variant={model.popular ? "yellow" : "neutral"}>{model.popular ? "Popular" : "Active"}</Badge>
                </div>
              ))}
            </div>
          )}

          {activeTab === "BRANDS" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {INITIAL_BRANDS.map((brand) => (
                <div key={brand.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center font-extrabold text-xs text-brand-black">
                  {brand.name}
                </div>
              ))}
            </div>
          )}

          {activeTab === "VARIANTS" && (
            <div className="divide-y divide-gray-100 text-xs">
              {INITIAL_VARIANTS.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-brand-yellow" />
                    <span>Variant ID: {v.id} ({v.storage})</span>
                  </div>
                  <span className="font-price font-black text-sm">Base Valuation: ₹{v.basePrice.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
