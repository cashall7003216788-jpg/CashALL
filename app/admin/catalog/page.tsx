"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS, BrandData } from "@/lib/store";
import { Smartphone, Plus, HardDrive, Search, Upload, Image as ImageIcon } from "lucide-react";
import { BrandIcon } from "@/components/common/BrandIcon";

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<"MODELS" | "BRANDS" | "VARIANTS">("MODELS");
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<BrandData[]>(INITIAL_BRANDS);
  const [editingBrand, setEditingBrand] = useState<BrandData | null>(null);
  const [newLogoUrl, setNewLogoUrl] = useState("");

  const handleUpdateLogo = (brandId: string) => {
    if (!newLogoUrl) return;
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, logoUrl: newLogoUrl } : b))
    );
    setEditingBrand(null);
    setNewLogoUrl("");
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const filteredModels = INITIAL_MODELS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim())
  ).sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0));

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Device Catalog Management
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Manage brands, models, storage variants, logos and base acquisition prices
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
              {filteredModels.map((model) => (
                <div key={model.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 border border-gray-200">
                      <Smartphone className="w-5 h-5 text-brand-black" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-brand-black">{model.name}</div>
                      <div className="text-[11px] text-gray-400">Sorted by Release Date</div>
                    </div>
                  </div>
                  <Badge variant={model.popular ? "yellow" : "neutral"}>{model.popular ? "Popular" : "Active"}</Badge>
                </div>
              ))}
            </div>
          )}

          {activeTab === "BRANDS" && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Phone & Laptop Brands ({filteredBrands.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBrands.map((brand) => (
                  <div key={brand.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BrandIcon name={brand.name} logoUrl={brand.logoUrl} className="w-12 h-12" />
                      <div>
                        <div className="text-sm font-extrabold text-brand-black">{brand.name}</div>
                        <div className="text-[11px] text-gray-400 uppercase font-semibold">{brand.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBrand(brand);
                        setNewLogoUrl(brand.logoUrl || "");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-brand-yellow text-xs font-bold text-brand-black flex items-center gap-1 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Edit Logo</span>
                    </button>
                  </div>
                ))}
              </div>
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

        {/* EDIT BRAND LOGO MODAL */}
        {editingBrand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-brand-border shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-extrabold text-brand-black">Update Brand Logo — {editingBrand.name}</h3>
                <button onClick={() => setEditingBrand(null)} className="text-gray-400 hover:text-black">✕</button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Logo Image URL / Supabase Path</label>
                <input
                  type="text"
                  value={newLogoUrl}
                  onChange={(e) => setNewLogoUrl(e.target.value)}
                  placeholder="https://... or /brands/apple.png"
                  className="w-full px-3.5 py-2 text-xs font-medium border border-gray-300 rounded-xl focus:outline-none focus:border-brand-yellow"
                />
              </div>

              {newLogoUrl && (
                <div className="p-3 bg-gray-50 rounded-xl border text-center flex flex-col items-center">
                  <span className="text-[11px] text-gray-400 font-bold mb-2">Live Logo Preview</span>
                  <BrandIcon name={editingBrand.name} logoUrl={newLogoUrl} />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingBrand(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateLogo(editingBrand.id)}
                  className="px-4 py-2 rounded-xl bg-brand-black text-white text-xs font-bold hover:bg-black"
                >
                  Save Logo
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
