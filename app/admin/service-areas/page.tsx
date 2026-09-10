"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { INITIAL_SERVICE_AREAS, ServiceAreaData } from "@/lib/store";
import { MapPin, Plus, CheckCircle2, ShieldCheck, Search, Trash2 } from "lucide-react";

export default function AdminServiceAreasPage() {
  const [areas, setAreas] = React.useState<ServiceAreaData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      let combined = [...INITIAL_SERVICE_AREAS];
      try {
        const stored = JSON.parse(localStorage.getItem("cashall_service_areas") || "[]");
        stored.forEach((item: any) => {
          if (item && item.pincode && !combined.some((a) => a.pincode === item.pincode)) {
            combined.unshift(item);
          }
        });
      } catch (e) {
        console.error(e);
      }
      setAreas(combined);
    }
  }, []);

  const [newPincode, setNewPincode] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPincode || !newCity) return;

    const newItem: ServiceAreaData = {
      id: `sa-${Date.now()}`,
      pincode: newPincode,
      city: newCity,
      state: newState.trim() || "West Bengal",
      active: true,
      pickupAvailable: true,
    };

    const updated = [newItem, ...areas];
    setAreas(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_service_areas", JSON.stringify(updated));
    }

    setNewPincode("");
    setNewCity("");
    setNewState("");
  };

  const filteredAreas = areas.filter((sa) => {
    const q = searchQuery.toLowerCase();
    return (
      sa.pincode.toLowerCase().includes(q) ||
      sa.city.toLowerCase().includes(q) ||
      sa.state.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-yellow-400 tracking-wide font-price">
                Service Area PIN Codes
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Configure serviceable postal PIN codes and doorstep pickup zones across active cities
            </p>
          </div>
          <div className="bg-neutral-900 px-4 py-2 rounded-2xl border border-neutral-700 text-xs font-bold text-yellow-400 self-start sm:self-auto">
            {areas.length} Active PINs
          </div>
        </div>

        {/* ADD PIN CODE FORM */}
        <div className="bg-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-neutral-700 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-700">
            <Plus className="w-4 h-4 text-yellow-400" />
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              Enable New Service PIN Code
            </h2>
          </div>

          <form onSubmit={handleAddArea} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <input
                type="text"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                placeholder="6-Digit PIN Code (e.g. 700001)"
                required
                className="px-4 py-2.5 text-xs font-mono font-bold bg-neutral-900 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400 transition"
              />
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="City (e.g. Kolkata, Howrah)"
                required
                className="px-4 py-2.5 text-xs font-bold bg-neutral-900 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400 transition"
              />
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="State (e.g. West Bengal)"
                className="px-4 py-2.5 text-xs font-bold bg-neutral-900 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-yellow-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl shadow-yellowGlow transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Enable PIN</span>
            </button>
          </form>
        </div>

        {/* SERVICE AREAS CARDS GRID */}
        <div className="bg-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-neutral-700 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-700 pb-3">
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              Active Doorstep PIN Codes ({filteredAreas.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search PIN code, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-yellow-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAreas.map((sa) => (
              <div
                key={sa.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono font-black text-yellow-400 text-base">
                    <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>{sa.pincode}</span>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                </div>

                <div className="text-xs">
                  <div className="font-bold text-white text-sm">{sa.city}</div>
                  <div className="text-[11px] text-neutral-400">{sa.state}</div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Doorstep Pickup Live</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
