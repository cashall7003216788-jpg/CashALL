"use client";

import React, { useState, useEffect } from "react";
import { MapPin, X, ArrowLeft, Search, Check, Building2, AlertCircle } from "lucide-react";
import { INITIAL_SERVICE_AREAS } from "@/lib/store";

interface StateData {
  name: string;
  cities: { city: string; pincode: string }[];
}

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
  const [states, setStates] = useState<StateData[]>([]);
  const [activeState, setActiveState] = useState<StateData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/v1/serviceability");
        const json = await res.json();
        if (json.success && json.data?.states?.length > 0) {
          setStates(json.data.states);
        } else {
          fallbackStates();
        }
      } catch (err) {
        fallbackStates();
      } finally {
        setLoading(false);
      }
    }

    function fallbackStates() {
      const statesMap: Record<string, { city: string; pincode: string }[]> = {};
      INITIAL_SERVICE_AREAS.forEach((area) => {
        if (!statesMap[area.state]) statesMap[area.state] = [];
        if (!statesMap[area.state].some((c) => c.city.toLowerCase() === area.city.toLowerCase())) {
          statesMap[area.state].push({ city: area.city, pincode: area.pincode });
        }
      });
      const stList = Object.keys(statesMap).map((name) => ({
        name,
        cities: statesMap[name],
      }));
      setStates(stList);
    }

    if (isOpen) {
      fetchLocations();
      setSearch("");
      // Pre-select active state if user already has selected location
      if (selectedLocation) {
        const matchState = states.find((s) => s.name.toLowerCase() === selectedLocation.state.toLowerCase());
        if (matchState) setActiveState(matchState);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCities = activeState
    ? activeState.cities.filter((c) =>
        c.city.toLowerCase().includes(search.toLowerCase().trim())
      )
    : [];

  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
    s.cities.some((c) => c.city.toLowerCase().includes(search.toLowerCase().trim()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-brand-black border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-3">
            {activeState ? (
              <button
                onClick={() => {
                  setActiveState(null);
                  setSearch("");
                }}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-300 hover:text-white transition-colors"
                title="Back to states"
              >
                <ArrowLeft className="w-5 h-5 text-brand-yellow" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/30">
                <MapPin className="w-5 h-5 text-brand-yellow" />
              </div>
            )}
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                {activeState ? activeState.name : "Select Your State"}
              </h3>
              <p className="text-xs text-gray-400">
                {activeState
                  ? `Select city/district in ${activeState.name}`
                  : "Choose your state to view available delivery locations"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b border-neutral-800 bg-brand-black">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeState
                  ? `Search city in ${activeState.name}...`
                  : "Search state or city..."
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:outline-none focus:border-brand-yellow/60"
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-4 flex-grow overflow-y-auto space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
              Loading serviceable locations...
            </div>
          ) : activeState ? (
            /* STEP 2: CITY SELECTION FOR ACTIVE STATE */
            <>
              <div className="text-[11px] font-bold text-brand-yellow uppercase tracking-wider px-2 pb-1">
                Available Locations in {activeState.name}
              </div>
              {filteredCities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCities.map((c) => {
                    const isSelected =
                      selectedLocation?.city.toLowerCase() === c.city.toLowerCase() &&
                      selectedLocation?.state.toLowerCase() === activeState.name.toLowerCase();

                    return (
                      <button
                        key={c.city}
                        onClick={() => {
                          onSelectLocation({ city: c.city, state: activeState.name });
                          onClose();
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition-all ${
                          isSelected
                            ? "bg-brand-yellow/15 border-brand-yellow text-brand-yellow font-extrabold"
                            : "bg-neutral-900/70 border-neutral-800 text-gray-200 hover:border-brand-yellow/50 hover:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${isSelected ? "text-brand-yellow" : "text-gray-400"}`} />
                          <span>{c.city}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-yellow" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800 text-gray-400">
                  <AlertCircle className="w-8 h-8 text-brand-yellow/60 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">Currently, we don&apos;t serve this location.</p>
                  <p className="text-[11px] text-gray-400 mt-1">No matching city found in {activeState.name}.</p>
                </div>
              )}
            </>
          ) : (
            /* STEP 1: STATE SELECTION LIST */
            <>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-1">
                Serviceable States ({filteredStates.length})
              </div>
              {filteredStates.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredStates.map((st) => {
                    const isSelectedState =
                      selectedLocation?.state.toLowerCase() === st.name.toLowerCase();

                    return (
                      <div
                        key={st.name}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                          isSelectedState
                            ? "bg-brand-yellow/10 border-brand-yellow/60 text-brand-yellow"
                            : "bg-neutral-900/80 border-neutral-800 text-gray-200 hover:border-brand-yellow/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-brand-yellow shrink-0 border border-neutral-700">
                            <MapPin className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-white">{st.name}</div>
                            <div className="text-[11px] text-gray-400 font-normal">
                              {st.cities.length} {st.cities.length === 1 ? "location" : "locations"} available
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const defaultCity = st.cities[0]?.city || st.name;
                              onSelectLocation({ city: defaultCity, state: st.name });
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-brand-yellow text-brand-black text-[11px] font-extrabold hover:bg-brand-yellowHover shadow-sm transition-all"
                          >
                            Select State
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveState(st);
                              setSearch("");
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-[11px] font-bold transition-colors"
                            title="View cities in state"
                          >
                            Cities &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800 text-gray-400">
                  <AlertCircle className="w-8 h-8 text-brand-yellow/60 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">Currently, we don&apos;t serve this location.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between text-xs text-gray-400">
          <span>
            Current Location:{" "}
            <strong className="text-brand-yellow">
              {selectedLocation ? `${selectedLocation.city}, ${selectedLocation.state}` : "None Selected"}
            </strong>
          </span>
          {activeState && (
            <button
              onClick={() => {
                setActiveState(null);
                setSearch("");
              }}
              className="text-xs text-brand-yellow hover:underline font-semibold"
            >
              Change State
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
