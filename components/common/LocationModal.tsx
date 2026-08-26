"use client";

import React, { useState } from "react";
import { MapPin, X, Search, Check, Building2, AlertCircle, Sparkles } from "lucide-react";
import { SERVICEABLE_DISTRICTS, isPincodeServiced, getPincodeDetails } from "@/lib/serviceability";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: { city: string; state: string } | null;
  onSelectLocation: (loc: { city: string; state: string }) => void;
}

export function LocationModal({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
}: LocationModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const query = search.trim().toLowerCase();

  // If search is a 6-digit PIN code
  const isPinQuery = /^\d{6}$/.test(query);
  const pinMatch = isPinQuery ? getPincodeDetails(query) : null;

  // Filter districts based on search query (name, state, or containing pin code)
  const filteredDistricts = SERVICEABLE_DISTRICTS.filter((d) => {
    if (!query) return true;
    if (d.name.toLowerCase().includes(query)) return true;
    if (d.state.toLowerCase().includes(query)) return true;
    if (d.pincodes.some((p) => p.includes(query))) return true;
    return false;
  });

  const handleSelect = (city: string, state: string) => {
    onSelectLocation({ city, state });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#121212] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-yellow/15 flex items-center justify-center border border-brand-yellow/30 text-brand-yellow shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white leading-tight">
                  Select Your Location
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40 px-2 py-0.5 rounded-full">
                  {SERVICEABLE_DISTRICTS.length} Districts
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Fix your city/district for instant doorstep pickup & best valuation
              </p>
            </div>
          </div>
          {selectedLocation && (
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b border-neutral-800 bg-[#121212]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search district name or 6-digit PIN code..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:outline-none focus:border-brand-yellow/60 transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 flex-grow overflow-y-auto space-y-3.5">
          {/* PINCODE MATCH BANNER */}
          {isPinQuery && pinMatch && (
            <div className="bg-green-500/10 border border-green-500/40 rounded-2xl p-3.5 flex items-center justify-between animate-fadeIn">
              <div>
                <div className="text-xs font-bold text-green-400">PIN Code {query} Matched!</div>
                <div className="text-sm font-extrabold text-white">{pinMatch.city}, {pinMatch.state}</div>
              </div>
              <button
                type="button"
                onClick={() => handleSelect(pinMatch.city, pinMatch.state)}
                className="px-3.5 py-1.5 bg-brand-yellow text-brand-black text-xs font-black rounded-xl hover:bg-brand-yellowHover transition-all shadow-sm"
              >
                Select & Proceed
              </button>
            </div>
          )}

          {/* PINCODE NOT SERVICED WARNING */}
          {isPinQuery && !pinMatch && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 text-xs text-red-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">PIN Code {query} is Outside Service Area</strong>
                <span>We currently only serve our {SERVICEABLE_DISTRICTS.length} designated districts. Please choose from below:</span>
              </div>
            </div>
          )}

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Available Serviceable Districts</span>
            <span className="text-brand-yellow text-[10px]">100% Free Doorstep Pickup</span>
          </div>

          {filteredDistricts.length > 0 ? (
            <div className="space-y-2.5">
              {filteredDistricts.map((dist) => {
                const isSelected =
                  selectedLocation?.city.toLowerCase() === dist.name.toLowerCase() &&
                  selectedLocation?.state.toLowerCase() === dist.state.toLowerCase();

                return (
                  <button
                    key={dist.id}
                    type="button"
                    onClick={() => handleSelect(dist.name, dist.state)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all group ${
                      isSelected
                        ? "bg-brand-yellow/15 border-brand-yellow text-brand-yellow font-extrabold shadow-yellowGlow"
                        : "bg-neutral-900/80 border-neutral-800 text-gray-200 hover:border-brand-yellow/60 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-brand-yellow text-brand-black border-brand-yellow font-black"
                            : "bg-neutral-800 text-brand-yellow border-neutral-700 group-hover:border-brand-yellow/40"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white group-hover:text-brand-yellow transition-colors">
                          {dist.name}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {dist.state} • <span className="text-gray-300 font-semibold">{dist.count} PIN Codes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="flex items-center gap-1.5 text-xs font-black text-brand-yellow bg-brand-yellow/10 px-3 py-1.5 rounded-xl border border-brand-yellow/30">
                          <Check className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white bg-neutral-800 group-hover:bg-brand-yellow group-hover:text-brand-black px-3 py-1.5 rounded-xl transition-all">
                          Select &rarr;
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 text-gray-400 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div>
                <p className="text-sm font-bold text-white">We don&apos;t serve this location yet.</p>
                <p className="text-xs text-gray-400 mt-1">CashALL currently provides doorstep pickup in these {SERVICEABLE_DISTRICTS.length} districts:</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {SERVICEABLE_DISTRICTS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect(d.name, d.state)}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-brand-yellow hover:text-brand-black border border-neutral-700 text-gray-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {d.name} ({d.state})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between text-xs text-gray-400">
          <span>
            Current Location:{" "}
            <strong className="text-brand-yellow">
              {selectedLocation ? `${selectedLocation.city}, ${selectedLocation.state}` : "None Selected"}
            </strong>
          </span>
          <span className="text-[11px] text-gray-500">
            Express verification active
          </span>
        </div>

      </div>
    </div>
  );
}
