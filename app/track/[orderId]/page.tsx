"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { OrderData, INITIAL_VARIANTS, INITIAL_MODELS, INITIAL_BRANDS, INITIAL_ORDERS } from "@/lib/store";
import {
  CheckCircle2,
  Clock,
  Truck,
  UserCheck,
  Search,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Printer,
} from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "CA10482";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [customerDecision, setCustomerDecision] = useState<"NONE" | "ACCEPTED" | "DECLINED">("NONE");
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`cashall_order_${orderId}`) || localStorage.getItem("cashall_latest_order");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOrder(parsed);
          if (parsed.status === "ACCEPTED" || parsed.status === "PAID" || parsed.status === "COMPLETED") {
            setCustomerDecision("ACCEPTED");
          } else if (parsed.status === "DECLINED") {
            setCustomerDecision("DECLINED");
          }
          return;
        } catch (e) {
          console.error(e);
        }
      }

      if (INITIAL_ORDERS.length > 0) {
        setOrder(INITIAL_ORDERS[0]);
      } else {
        setOrder(null);
      }
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
        <Header />
        <main className="flex-grow py-16 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-4 text-center space-y-6 bg-white rounded-3xl p-8 border border-brand-border shadow-premium">
            <div className="w-16 h-16 bg-brand-yellow/20 rounded-2xl flex items-center justify-center mx-auto text-brand-black">
              <Search className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-brand-black">Order Not Found</h1>
            <p className="text-xs text-brand-muted leading-relaxed">
              We couldn&apos;t find an order matching <strong className="text-brand-black">#{orderId}</strong>. Please check your order number or log in to view your orders.
            </p>
            <div className="pt-2 flex flex-col gap-3">
              <Link href="/account">
                <Button variant="primary" size="md" fullWidth className="font-extrabold shadow-yellowGlow">
                  Go to My Account
                </Button>
              </Link>
              <Link href="/sell/mobile">
                <Button variant="secondary" size="md" fullWidth className="font-bold">
                  Sell a Mobile Phone
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const steps = [
    { key: "QUOTE_CREATED", label: "Quote Created", desc: "Online estimate generated" },
    { key: "PICKUP_SCHEDULED", label: "Pickup Scheduled", desc: `${order.pickupDate} (${order.pickupTimeSlot})` },
    { key: "EXECUTIVE_ASSIGNED", label: "CashALL Executive Assigned", desc: order.assignedPartnerName || "Doorstep executive assigned" },
    { key: "EXECUTIVE_ON_THE_WAY", label: "Executive On The Way", desc: "CashALL executive traveling to your address" },
    { key: "INSPECTION_STARTED", label: "Device Inspection", desc: "Physical check & IMEI verification" },
    { key: "FINAL_OFFER_PENDING", label: "Final Price Offer", desc: "Confirmed/Revised valuation" },
    { key: "PAYMENT_PROCESSING", label: "Payment", desc: "Direct UPI/Bank payout" },
    { key: "COMPLETED", label: "Completed", desc: "Device handed over & paid" },
  ];

  const getStepStatus = (stepKey: string) => {
    const statusOrder = [
      "QUOTE_CREATED",
      "PICKUP_SCHEDULED",
      "EXECUTIVE_ASSIGNED",
      "EXECUTIVE_ON_THE_WAY",
      "INSPECTION_STARTED",
      "FINAL_OFFER_PENDING",
      "ACCEPTED",
      "PAYMENT_PROCESSING",
      "PAID",
      "COMPLETED",
    ];

    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentIndex >= stepIndex || (stepKey === "FINAL_OFFER_PENDING" && customerDecision === "ACCEPTED")) {
      return "COMPLETED";
    }
    if (currentIndex === stepIndex - 1) {
      return "ACTIVE";
    }
    return "PENDING";
  };

  const handleAcceptOffer = () => {
    setCustomerDecision("ACCEPTED");
    const updated: OrderData = {
      ...order,
      status: "ACCEPTED",
      paymentStatus: "PAID",
      paymentTxRef: `UPI-CASHPAY-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      updatedAt: new Date().toISOString(),
    };
    setOrder(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updated));
    }
  };

  const handleDeclineOffer = () => {
    setCustomerDecision("DECLINED");
    const updated: OrderData = {
      ...order,
      status: "DECLINED",
      updatedAt: new Date().toISOString(),
    };
    setOrder(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updated));
    }
  };

  const isRevised = order.priceDifferenceReason && order.declaredConditionSummary;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* HEADER ORDER SUMMARY */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                <span>Selling Order Tracker</span>
                <span>•</span>
                <Badge variant="yellow">{order.status.replace(/_/g, " ")}</Badge>
              </div>
              <h1 className="text-2xl font-black text-brand-black">
                Order ID: {order.orderNumber}
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Booked on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase">CashALL Final Offer</div>
              <div className="text-2xl sm:text-3xl font-black text-brand-black font-price">
                ₹{(order.revisedPrice || 31400).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* VISUAL TIMELINE STEPPER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-subtleCard space-y-6">
            <h2 className="text-lg font-black text-brand-black">
              Live Order Progress
            </h2>

            <div className="relative border-l-2 border-brand-border ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
              {steps.map((st) => {
                const status = getStepStatus(st.key);
                return (
                  <div key={st.key} className="relative">
                    {/* ICON DOT */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        status === "COMPLETED"
                          ? "bg-brand-yellow text-black border-brand-yellow font-extrabold shadow-yellowGlow"
                          : status === "ACTIVE"
                          ? "bg-black text-brand-yellow border-brand-yellow animate-pulse"
                          : "bg-white text-gray-300 border-gray-300"
                      }`}
                    >
                      {status === "COMPLETED" ? <CheckCircle2 className="w-5 h-5" /> : status === "ACTIVE" ? <Clock className="w-4 h-4" /> : "•"}
                    </div>

                    <div>
                      <h3
                        className={`text-sm font-extrabold ${
                          status === "COMPLETED"
                            ? "text-brand-black"
                            : status === "ACTIVE"
                            ? "text-brand-black"
                            : "text-gray-400"
                        }`}
                      >
                        {st.label}
                      </h3>
                      <p className="text-xs text-brand-muted mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRICE REVISION / FINAL OFFER ACCEPTANCE MODULE (Sections 34 & 35) */}
          {(order.status === "FINAL_OFFER_PENDING" || order.status === "ACCEPTED" || customerDecision === "ACCEPTED") && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-yellow shadow-premium space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-black">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-brand-black">
                      Final Verified CashALL Offer
                    </h2>
                    <p className="text-xs text-brand-muted">
                      Physical inspection results verified by CashALL executive {order.assignedPartnerName || "Rahul Sharma"}
                    </p>
                  </div>
                </div>

                <Badge variant={customerDecision === "ACCEPTED" ? "success" : "yellow"}>
                  {customerDecision === "ACCEPTED" ? "Offer Accepted" : "Action Required"}
                </Badge>
              </div>

              {/* REVISION COMPARISON BREAKDOWN */}
              {isRevised && (
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Inspection Condition Discrepancy Rationale</span>
                  </div>

                  <p className="text-amber-900 leading-relaxed">
                    Reason: <strong>{order.priceDifferenceReason}</strong>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
                      <div className="font-bold text-gray-500 text-[11px] uppercase">Declared Online</div>
                      <div className="font-semibold text-brand-black mt-1">{order.declaredConditionSummary}</div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
                      <div className="font-bold text-gray-500 text-[11px] uppercase">Physical Agent Inspection</div>
                      <div className="font-semibold text-brand-black mt-1">{order.inspectedConditionSummary}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACCEPT / DECLINE ACTIONS */}
              {customerDecision === "NONE" && order.status === "FINAL_OFFER_PENDING" ? (
                <div className="pt-2 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={handleAcceptOffer}
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="font-black text-base py-3.5 gap-2 shadow-yellowGlow"
                    >
                      <span>ACCEPT FINAL OFFER (₹{(order.revisedPrice || 29800).toLocaleString("en-IN")})</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </Button>

                    <Button
                      onClick={handleDeclineOffer}
                      variant="tertiary"
                      size="lg"
                      fullWidth
                      className="font-bold text-red-600 hover:bg-red-50 border-red-200"
                    >
                      DECLINE OFFER
                    </Button>
                  </div>
                  <p className="text-[11px] text-center text-brand-muted">
                    If you decline, your phone will be returned immediately at zero cost.
                  </p>
                </div>
              ) : customerDecision === "ACCEPTED" ? (
                <div className="bg-green-50 rounded-2xl p-5 border border-green-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm text-green-950">
                        Final Offer Accepted & Payment Processed!
                      </h3>
                      <p className="text-xs text-green-800">
                        Payment Reference: <strong>{order.paymentTxRef || "UPI-CASHPAY-984210543"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setHandoverModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-black bg-brand-yellow hover:bg-brand-yellowHover px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Handover Record</span>
                    </button>

                    <Link
                      href={`/sale-receipt/${order.orderNumber}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-black hover:bg-neutral-800 px-4 py-2 rounded-xl border border-neutral-700 transition-colors shadow-sm"
                    >
                      <Printer className="w-4 h-4 text-brand-yellow" />
                      <span>Download Customer Sale Receipt</span>
                    </Link>

                    <Link
                      href={`/receipt/${order.orderNumber}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black bg-white px-3 py-2 rounded-xl border border-gray-300 transition-colors"
                    >
                      <span>Procurement Receipt (Internal)</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200 text-xs text-red-800">
                  Offer declined. Device return initiated by pickup agent.
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* IN-APP DEVICE HANDOVER RECORD MODAL (Section 37) */}
      <Modal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
        title="CashALL Device Handover Record"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <div>
              <div className="text-base font-black text-brand-black">CashALL Digital Handover Certificate</div>
              <div className="text-gray-400">Order ID: {order.orderNumber}</div>
            </div>
            <Badge variant="success">PAID & COMPLETED</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 font-bold block">Customer</span>
              <span className="font-bold text-brand-black">{order.customerName} ({order.customerPhone})</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">Masked IMEI</span>
              <span className="font-bold text-brand-black">{order.imeiNumber || "864502******482"}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">Final Payout Amount</span>
              <span className="font-black text-brand-black text-sm">₹{(order.revisedPrice || 29800).toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">Payment Reference</span>
              <span className="font-bold text-brand-black">{order.paymentTxRef || "UPI-CASHPAY-984210543"}</span>
            </div>
          </div>

          <div className="p-3 bg-green-50 text-green-900 rounded-xl border border-green-200 font-medium">
            Customer acceptance recorded electronically. Assisted factory data reset verified before handover.
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => window.print()} variant="tertiary" size="sm" className="gap-1">
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Certificate</span>
            </Button>
            <Button onClick={() => setHandoverModalOpen(false)} variant="secondary" size="sm">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
