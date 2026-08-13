"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  Truck,
  Phone,
  MapPin,
  ClipboardCheck,
  CreditCard,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
} from "lucide-react";

interface PartnerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  addressText: string;
  pickupDate: string;
  pickupTimeSlot: string;
  deviceName: string;
  storage: string;
  estimatedPrice: number;
  finalPrice: number | null;
  status: string;
  identityStatus: string;
  imeiStatus: string;
  hasQcReport: boolean;
  paymentStatus: string;
  isSigned: boolean;
}

export default function PartnerOrdersPage() {
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/v1/partner/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to load partner orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.deviceName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-12">
      {/* Mobile Top Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/40">
            <Truck className="w-4 h-4 text-brand-yellow" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-tight">Partner Pickups</h1>
            <p className="text-[10px] text-gray-400">Assigned Field Tasks</p>
          </div>
        </div>

        <Badge variant="yellow" className="text-[10px] font-bold">
          {orders.length} Active
        </Badge>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search Order #, customer name, device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-gray-500 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-yellow"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-yellow mr-2" />
            <span>Loading assigned pickups...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/50 rounded-3xl border border-neutral-800 p-6 text-gray-400 space-y-2">
            <Truck className="w-10 h-10 mx-auto opacity-30 text-brand-yellow" />
            <p className="text-xs font-bold text-white">No assigned pickups found</p>
            <p className="text-[11px] text-gray-500">
              When CashALL admin assigns doorstep pickups to you, they will appear here.
            </p>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
                <div>
                  <div className="text-xs font-black text-brand-yellow">#{ord.orderNumber}</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">{ord.deviceName} ({ord.storage})</div>
                </div>
                <Badge variant="yellow" className="text-[10px] uppercase font-black">
                  {ord.status.replace(/_/g, " ")}
                </Badge>
              </div>

              {/* Customer & Address */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-300 font-semibold">
                  <span>{ord.customerName}</span>
                  <a
                    href={`tel:${ord.customerPhone}`}
                    className="flex items-center gap-1 bg-brand-yellow/10 text-brand-yellow px-2.5 py-1 rounded-lg border border-brand-yellow/30 text-[11px] font-bold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>

                <div className="flex items-start gap-1.5 text-gray-400 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-brand-yellow shrink-0 mt-0.5" />
                  <span className="leading-snug">{ord.addressText}</span>
                </div>
              </div>

              {/* Price & Status Tags */}
              <div className="bg-neutral-950 rounded-2xl p-3 flex items-center justify-between border border-neutral-850">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Valuation</span>
                  <span className="text-base font-black text-brand-yellow font-price">
                    ₹{(ord.finalPrice || ord.estimatedPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ord.identityStatus === "VERIFIED" ? "bg-green-950 text-green-400 border border-green-800" : "bg-neutral-800 text-gray-400"}`}>
                    ID: {ord.identityStatus}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ord.imeiStatus === "CLEAR" || ord.imeiStatus === "VERIFIED" ? "bg-green-950 text-green-400 border border-green-800" : ord.imeiStatus === "FLAGGED" ? "bg-red-950 text-red-400 border border-red-800" : "bg-neutral-800 text-gray-400"}`}>
                    IMEI: {ord.imeiStatus}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {(() => {
                let targetHref = `/partner/orders/${ord.id}/inspection`;
                let btnLabel = "Inspect Device";

                if (["FINAL_OFFER", "CUSTOMER_ACCEPTED", "IDENTITY_VERIFICATION_PENDING"].includes(ord.status)) {
                  targetHref = `/partner/orders/${ord.id}/verification`;
                  btnLabel = ord.status === "FINAL_OFFER" ? "Offer Pending" : "Seller Verification";
                } else if (["IDENTITY_VERIFIED", "ESIGN_PENDING"].includes(ord.status)) {
                  targetHref = `/partner/orders/${ord.id}/signature`;
                  btnLabel = "eSign Agreement";
                } else if (["ESIGNED", "PAYMENT_PENDING", "PAYMENT_CONFIRMED", "DEVICE_RECEIVED"].includes(ord.status)) {
                  targetHref = `/partner/orders/${ord.id}/payment`;
                  btnLabel = ord.status === "PAYMENT_CONFIRMED" ? "Handover & Bill" : "UPI Payment";
                } else if (ord.status === "COMPLETED") {
                  targetHref = `/order/${ord.orderNumber}/bill`;
                  btnLabel = "View Final Bill";
                }

                return (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ord.addressText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>Google Maps</span>
                    </a>

                    <Link
                      href={targetHref}
                      className="py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-yellowGlow transition-all"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>{btnLabel}</span>
                    </Link>
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
