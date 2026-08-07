"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { INITIAL_PARTNERS } from "@/lib/store";
import { Truck, UserCheck, Calendar, MapPin } from "lucide-react";

export default function AdminPickupsPage() {
  const pickups = [
    { id: "pk-1", orderNumber: "CA10482", customer: "Ananya Roy", area: "Connaught Place (110001)", slot: "Tomorrow (10 AM - 1 PM)", partner: "Rahul Sharma (Express Logistics)", status: "ASSIGNED" },
    { id: "pk-2", orderNumber: "CA10483", customer: "Vikram Mehta", area: "Andheri West (400001)", slot: "Tomorrow (1 PM - 4 PM)", partner: "Vikram Patil (Apex Courier)", status: "ON_THE_WAY" },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-brand-black">
            Pickup Dispatch & Agent Assignment
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Assign logistics agents, manage pickup date slots and track agent location
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Area / PIN</th>
                <th className="p-3">Pickup Window</th>
                <th className="p-3">Assigned CashALL Executive</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pickups.map((pk) => (
                <tr key={pk.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-extrabold text-brand-black">{pk.orderNumber}</td>
                  <td className="p-3 font-bold text-brand-black">{pk.customer}</td>
                  <td className="p-3 font-medium text-gray-500">{pk.area}</td>
                  <td className="p-3 font-semibold text-brand-black">{pk.slot}</td>
                  <td className="p-3">
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none">
                      {INITIAL_PARTNERS.map((part) => (
                        <option key={part.id} value={part.id}>{part.name} ({part.businessName})</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <Badge variant="yellow">{pk.status}</Badge>
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
