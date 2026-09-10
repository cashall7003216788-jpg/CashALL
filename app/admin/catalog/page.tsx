"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS, BrandData } from "@/lib/store";
import { Smartphone, Plus, HardDrive, Search, Image as ImageIcon } from "lucide-react";
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
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
              Device Catalog Management
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Manage brands, models, storage variants, logos and base acquisition prices
            </p>
          </div>

          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl shadow-yellowGlow transition self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span>Add Device Model</span>
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
          {(["MODELS", "BRANDS", "VARIANTS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                activeTab === tab
                  ? "bg-yellow-400 text-black shadow-md"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${activeTab.toLowerCase()}...`}
            className="w-full pl-10 pr-3 py-2 text-xs bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400"
          />
        </div>

        {/* CONTENT MATRIX */}
        <div className="bg-neutral-800 rounded-3xl p-6 border border-neutral-700 shadow-xl">
          {activeTab === "MODELS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredModels.map((model) => (
                <div key={model.id} className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/50 flex items-center justify-center p-1 border border-neutral-800 text-yellow-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">{model.name}</div>
                      <div className="text-[11px] text-neutral-400">Released: {model.releaseYear || "Recent"}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    model.popular ? "bg-amber-950 text-yellow-400 border border-yellow-800" : "bg-neutral-800 text-neutral-400"
                  }`}>
                    {model.popular ? "Popular" : "Active"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "BRANDS" && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Phone &amp; Laptop Brands ({filteredBrands.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBrands.map((brand) => (
                  <div key={brand.id} className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BrandIcon name={brand.name} logoUrl={brand.logoUrl} className="w-12 h-12" />
                      <div>
                        <div className="text-sm font-extrabold text-white">{brand.name}</div>
                        <div className="text-[11px] text-neutral-400 uppercase font-semibold">{brand.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBrand(brand);
                        setNewLogoUrl(brand.logoUrl || "");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-yellow-400 text-xs font-bold text-neutral-200 flex items-center gap-1 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Edit Logo</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "VARIANTS" && (
            <div className="divide-y divide-neutral-700/60 text-xs">
              {INITIAL_VARIANTS.map((v) => (
                <div key={v.id} className="py-3.5 flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">Variant ID: {v.id} ({v.storage})</span>
                  </div>
                  <span className="font-price font-black text-green-400 text-sm">Base Valuation: ₹{v.basePrice.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EDIT BRAND LOGO MODAL */}
        {editingBrand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-neutral-700 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-base font-extrabold text-white">Update Brand Logo — {editingBrand.name}</h3>
                <button onClick={() => setEditingBrand(null)} className="text-neutral-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300">Logo Image URL / Supabase Path</label>
                <input
                  type="text"
                  value={newLogoUrl}
                  onChange={(e) => setNewLogoUrl(e.target.value)}
                  placeholder="https://... or /brands/apple.png"
                  className="w-full px-3.5 py-2 text-xs font-medium bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:outline-none focus:border-yellow-400"
                />
              </div>

              {newLogoUrl && (
                <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700 text-center flex flex-col items-center">
                  <span className="text-[11px] text-neutral-400 font-bold mb-2">Live Logo Preview</span>
                  <BrandIcon name={editingBrand.name} logoUrl={newLogoUrl} />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingBrand(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-bold hover:bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateLogo(editingBrand.id)}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black"
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
