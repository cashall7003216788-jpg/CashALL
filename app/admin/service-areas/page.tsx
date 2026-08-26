"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_SERVICE_AREAS, ServiceAreaData } from "@/lib/store";
import { MapPin, Plus, CheckCircle2 } from "lucide-react";

export default function AdminServiceAreasPage() {
  const [areas, setAreas] = React.useState<ServiceAreaData[]>([]);

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

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl font-black text-brand-black">
            Service Area PIN Code Management
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Configure active serviceability PIN codes and doorstep pickup availability across active states (West Bengal, Uttar Pradesh)
          </p>
        </div>

        {/* ADD PIN CODE FORM */}
        <form onSubmit={handleAddArea} className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <input
              type="text"
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              placeholder="PIN Code (e.g. 700001)"
              required
              className="px-3.5 py-2 text-xs font-bold bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
            />
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="City (e.g. Kolkata)"
              required
              className="px-3.5 py-2 text-xs font-bold bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
            />
            <input
              type="text"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              placeholder="State (e.g. West Bengal)"
              className="px-3.5 py-2 text-xs font-bold bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto font-extrabold gap-1.5 shadow-yellowGlow whitespace-nowrap">
            <Plus className="w-4 h-4" />
            <span>Enable PIN Code</span>
          </Button>
        </form>

        {/* SERVICE AREAS TABLE */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="p-3">PIN Code</th>
                <th className="p-3">City</th>
                <th className="p-3">State</th>
                <th className="p-3">Pickup Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {areas.map((sa) => (
                <tr key={sa.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-extrabold text-brand-black font-mono">{sa.pincode}</td>
                  <td className="p-3 font-bold text-brand-black">{sa.city}</td>
                  <td className="p-3 font-medium text-gray-500">{sa.state}</td>
                  <td className="p-3">
                    <Badge variant="success">Active Doorstep Service</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
