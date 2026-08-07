"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Smartphone,
  Plus,
  Edit,
  Trash2,
  Copy,
  HardDrive,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<"MODELS" | "BRANDS" | "VARIANTS">("MODELS");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [questionSets, setQuestionSets] = useState<any[]>([]);

  // Modal States
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const [selectedModel, setSelectedModel] = useState<any>(null);

  // Form States
  const [brandForm, setBrandForm] = useState({ id: "", name: "", slug: "", category: "MOBILE", active: true });
  const [modelForm, setModelForm] = useState({
    id: "",
    brandId: "",
    name: "",
    slug: "",
    category: "MOBILE",
    basePrice: "30000",
    releaseYear: "2024",
    questionSetId: "",
    popular: false,
    active: true,
  });
  const [duplicateForm, setDuplicateForm] = useState({ sourceId: "", newName: "", newSlug: "" });
  const [variantForm, setVariantForm] = useState({ modelId: "", storage: "128 GB", ram: "8 GB", basePrice: "30000" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resB, resM, resQ] = await Promise.all([
        fetch("/api/admin/catalog/brands").then((r) => r.json()),
        fetch("/api/admin/catalog/models").then((r) => r.json()),
        fetch("/api/admin/catalog/question-sets").then((r) => r.json()),
      ]);

      if (resB.success) setBrands(resB.data);
      if (resM.success) setModels(resM.data);
      if (resQ.success) setQuestionSets(resQ.data);
    } catch (e) {
      console.error("Failed to load catalog data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Brand
  const handleSaveBrand = async () => {
    if (!brandForm.name || !brandForm.slug) return alert("Please fill Brand Name and Slug");
    try {
      const method = brandForm.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/catalog/brands", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandForm),
      }).then((r) => r.json());

      if (res.success) {
        setShowBrandModal(false);
        setBrandForm({ id: "", name: "", slug: "", category: "MOBILE", active: true });
        fetchData();
      } else {
        alert(res.error || "Operation failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Model
  const handleSaveModel = async () => {
    if (!modelForm.brandId || !modelForm.name || !modelForm.slug) {
      return alert("Please select Brand and fill Model Name & Slug");
    }
    try {
      const method = modelForm.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/catalog/models", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelForm),
      }).then((r) => r.json());

      if (res.success) {
        setShowModelModal(false);
        fetchData();
      } else {
        alert(res.error || "Operation failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Duplicate Model
  const handleDuplicateModel = async () => {
    if (!duplicateForm.sourceId || !duplicateForm.newName || !duplicateForm.newSlug) {
      return alert("Please enter new Model Name and Slug");
    }
    try {
      const res = await fetch(`/api/admin/catalog/models/${duplicateForm.sourceId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicateForm),
      }).then((r) => r.json());

      if (res.success) {
        setShowDuplicateModal(false);
        fetchData();
      } else {
        alert(res.error || "Duplication failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Variant
  const handleSaveVariant = async () => {
    if (!variantForm.modelId || !variantForm.storage || !variantForm.basePrice) {
      return alert("Please fill variant details");
    }
    try {
      const res = await fetch("/api/admin/catalog/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variantForm),
      }).then((r) => r.json());

      if (res.success) {
        setShowVariantModal(false);
        fetchData();
      } else {
        alert(res.error || "Variant creation failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Dynamic Device Catalog & Recommerce Manager
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Control Brands, Models, Storage Variants, Base Prices, and Question Sets in PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setBrandForm({ id: "", name: "", slug: "", category: "MOBILE", active: true });
                setShowBrandModal(true);
              }}
              variant="secondary"
              size="sm"
              className="font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Brand</span>
            </Button>

            <Button
              onClick={() => {
                setModelForm({
                  id: "",
                  brandId: brands[0]?.id || "",
                  name: "",
                  slug: "",
                  category: "MOBILE",
                  basePrice: "32000",
                  releaseYear: "2024",
                  questionSetId: questionSets[0]?.id || "",
                  popular: true,
                  active: true,
                });
                setShowModelModal(true);
              }}
              variant="primary"
              size="sm"
              className="font-extrabold text-xs shadow-yellowGlow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Device Model</span>
            </Button>
          </div>
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
              {tab} ({tab === "MODELS" ? models.length : tab === "BRANDS" ? brands.length : "Variants"})
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
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            className="w-full pl-10 pr-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
          />
        </div>

        {/* CONTENT MATRIX */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard">
          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-gray-400">Loading catalog from database...</div>
          ) : activeTab === "MODELS" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((m) => (
                <div
                  key={m.id}
                  className="p-5 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-3 relative group hover:border-brand-yellow transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 text-brand-black shrink-0 font-bold">
                        <Smartphone className="w-5 h-5 text-brand-black" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-brand-black">{m.brand?.name} {m.name}</div>
                        <div className="text-[11px] text-gray-400">Released: {m.releaseYear} | Slug: /{m.slug}</div>
                      </div>
                    </div>
                    <Badge variant={m.active ? "yellow" : "neutral"}>{m.active ? "Active" : "Archived"}</Badge>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 font-medium text-[11px]">Base Price:</span>
                      <span className="font-price font-black text-brand-black ml-1">
                        ₹{(m.basePrice || m.variants[0]?.basePrice || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-gray-500">
                      {m.questionSet?.name || "Default Questionnaire"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => {
                        setModelForm({
                          id: m.id,
                          brandId: m.brandId,
                          name: m.name,
                          slug: m.slug,
                          category: m.category || "MOBILE",
                          basePrice: String(m.basePrice || 30000),
                          releaseYear: String(m.releaseYear || 2024),
                          questionSetId: m.questionSetId || "",
                          popular: m.popular,
                          active: m.active,
                        });
                        setShowModelModal(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-brand-black"
                    >
                      <Edit className="w-3 h-3 inline mr-1" />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setDuplicateForm({
                          sourceId: m.id,
                          newName: `${m.name} (Copy)`,
                          newSlug: `${m.slug}-copy`,
                        });
                        setShowDuplicateModal(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-brand-yellow/20 border border-gray-200 rounded-lg text-brand-black"
                    >
                      <Copy className="w-3 h-3 inline mr-1" />
                      Duplicate Config
                    </button>

                    <button
                      onClick={() => {
                        setVariantForm({ modelId: m.id, storage: "256 GB", ram: "8 GB", basePrice: String(m.basePrice || 30000) });
                        setShowVariantModal(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-brand-black text-white rounded-lg hover:bg-neutral-800"
                    >
                      + Variant
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "BRANDS" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {filteredBrands.map((b) => (
                <div key={b.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-center">
                  <div className="font-extrabold text-sm text-brand-black">{b.name}</div>
                  <div className="text-[11px] text-gray-400">Category: {b.category}</div>
                  <div className="text-[11px] font-semibold text-brand-muted">{b._count?.models || 0} Models</div>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setBrandForm({ id: b.id, name: b.name, slug: b.slug, category: b.category, active: b.active });
                        setShowBrandModal(true);
                      }}
                      className="text-[11px] font-bold text-brand-black hover:underline"
                    >
                      Edit Brand
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((m) => (
                <div key={m.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="font-extrabold text-sm text-brand-black flex items-center justify-between">
                    <span>{m.brand?.name} {m.name}</span>
                    <button
                      onClick={() => {
                        setVariantForm({ modelId: m.id, storage: "256 GB", ram: "8 GB", basePrice: String(m.basePrice || 30000) });
                        setShowVariantModal(true);
                      }}
                      className="text-xs font-bold bg-brand-yellow px-3 py-1 rounded-xl text-black"
                    >
                      + Storage Variant
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    {m.variants?.map((v: any) => (
                      <div key={v.id} className="p-3 bg-white rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold">{v.storage} {v.ram ? `(${v.ram})` : ""}</div>
                          <div className="text-[10px] text-gray-400">Variant ID: {v.id.slice(0, 8)}</div>
                        </div>
                        <div className="font-price font-black text-brand-black">₹{v.basePrice.toLocaleString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL: ADD / EDIT BRAND */}
        {showBrandModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fadeIn">
              <h3 className="text-lg font-black text-brand-black">
                {brandForm.id ? "Edit Brand" : "Add Brand"}
              </h3>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-gray-500 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. Sony"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={brandForm.slug}
                    onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. sony"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">Device Category</label>
                  <select
                    value={brandForm.category}
                    onChange={(e) => setBrandForm({ ...brandForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                  >
                    <option value="MOBILE">Mobile Phone</option>
                    <option value="LAPTOP">Laptop</option>
                    <option value="TABLET">Tablet</option>
                    <option value="SMARTWATCH">Smart Watch</option>
                    <option value="CONSOLE">Gaming Console</option>
                    <option value="ACCESSORY">Accessory</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setShowBrandModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSaveBrand} className="font-extrabold shadow-yellowGlow">Save Brand</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT MODEL */}
        {showModelModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-fadeIn">
              <h3 className="text-lg font-black text-brand-black">
                {modelForm.id ? "Edit Device Model" : "Launch New Device Model"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <div>
                  <label className="block text-gray-500 mb-1">Select Brand</label>
                  <select
                    value={modelForm.brandId}
                    onChange={(e) => setModelForm({ ...modelForm, brandId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. Pixel 9 Pro"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={modelForm.slug}
                    onChange={(e) => setModelForm({ ...modelForm, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="pixel-9-pro"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={modelForm.basePrice}
                    onChange={(e) => setModelForm({ ...modelForm, basePrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow font-price font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-500 mb-1">Assign Question Set</label>
                  <select
                    value={modelForm.questionSetId}
                    onChange={(e) => setModelForm({ ...modelForm, questionSetId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                  >
                    <option value="">Default Category Questionnaire</option>
                    {questionSets.map((qs) => (
                      <option key={qs.id} value={qs.id}>{qs.name} ({qs.questions?.length || 0} Questions)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setShowModelModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSaveModel} className="font-extrabold shadow-yellowGlow">Save Device Model</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DUPLICATE MODEL */}
        {showDuplicateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fadeIn">
              <h3 className="text-lg font-black text-brand-black">Duplicate Device Configuration</h3>
              <p className="text-xs text-brand-muted">
                Creates a new device model with identical variants, color options, images, and question assignments.
              </p>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-gray-500 mb-1">New Model Name</label>
                  <input
                    type="text"
                    value={duplicateForm.newName}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, newName: e.target.value, newSlug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">New URL Slug</label>
                  <input
                    type="text"
                    value={duplicateForm.newSlug}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, newSlug: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setShowDuplicateModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleDuplicateModel} className="font-extrabold shadow-yellowGlow">Duplicate Now</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD VARIANT */}
        {showVariantModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fadeIn">
              <h3 className="text-lg font-black text-brand-black">Add Storage Variant</h3>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-gray-500 mb-1">Storage Capacity</label>
                  <input
                    type="text"
                    value={variantForm.storage}
                    onChange={(e) => setVariantForm({ ...variantForm, storage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. 256 GB"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">RAM (Optional)</label>
                  <input
                    type="text"
                    value={variantForm.ram}
                    onChange={(e) => setVariantForm({ ...variantForm, ram: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. 8 GB"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Variant Base Price (₹)</label>
                  <input
                    type="number"
                    value={variantForm.basePrice}
                    onChange={(e) => setVariantForm({ ...variantForm, basePrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow font-price font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setShowVariantModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSaveVariant} className="font-extrabold shadow-yellowGlow">Save Variant</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
