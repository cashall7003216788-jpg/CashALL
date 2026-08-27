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
import { trackMetaCustomEvent } from "@/lib/analytics/meta";
import {
  CheckCircle2,
  Clock,
  Truck,
  UserCheck,
  Phone,
  Building2,
  Search,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Printer,
  XCircle,
  Ban,
} from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [customerDecision, setCustomerDecision] = useState<"NONE" | "ACCEPTED" | "DECLINED">("NONE");
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`cashall_order_${orderId}`) || localStorage.getItem("cashall_latest_order");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOrder(parsed);
          if (parsed.status === "ACCEPTED" || parsed.status === "PAID" || parsed.status === "COMPLETED") {
            setCustomerDecision("ACCEPTED");
          }
        } catch (e) {}
      }
    }

    if (orderId) {
      fetch(`/api/v1/orders/${orderId}?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.data) {
            const ord = data.data;
            const activePayment = ord.payments?.find((p: any) => p.status === "PAID") || ord.payments?.[0];
            const isPaid = activePayment?.status === "PAID" || ord.status === "COMPLETED";

            const mapped: OrderData = {
              id: ord.id,
              orderNumber: ord.orderNumber,
              quoteId: ord.quoteId || "",
              userId: ord.userId || "",
              customerName: ord.customerName || ord.user?.name || "Customer",
              customerPhone: ord.customerPhone || ord.user?.phone || "—",
              customerEmail: ord.customerEmail || ord.user?.email || "",
              deviceName: ord.deviceName || "Mobile Device",
              addressSummary: ord.addressSummary || "Doorstep Address",
              pincode: ord.pincode || ord.address?.pincode || "700001",
              pickupDate: ord.pickupDate || "Scheduled",
              pickupTimeSlot: ord.pickupTimeSlot || "Standard Slot",
              assignedPartnerName: ord.assignedPartnerName || null,
              assignedPartnerPhone: ord.assignedPartnerPhone || "7003216788",
              assignedPartnerBusiness: ord.assignedPartnerBusiness || "CashALL Express Logistics",
              estimatedPrice: ord.estimatedPrice || ord.quote?.estimatedPrice || 0,
              revisedPrice: ord.revisedPrice || ord.finalPrice || ord.estimatedPrice || 0,
              status: ord.status || "PICKUP_SCHEDULED",
              paymentStatus: isPaid ? "PAID" : "PENDING",
              paymentTxRef: ord.utr || activePayment?.transactionRef || "",
              createdAt: ord.createdAt || new Date().toISOString(),
              updatedAt: ord.updatedAt || new Date().toISOString(),
            };
            setOrder(mapped);
            if (isPaid || ord.status === "ACCEPTED") {
              setCustomerDecision("ACCEPTED");
            }
          }
        })
        .catch((e) => console.warn("Live order fetch warning:", e));
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
    {
      key: "ORDER_ACCEPTED",
      label: "Order Accepted",
      desc: "Doorstep selling request confirmed",
    },
    {
      key: "AGENT_ASSIGNED",
      label: "Agent Assigned",
      desc: order.assignedPartnerName
        ? `Executive ${order.assignedPartnerName} assigned for pickup`
        : "CashALL doorstep executive assigned",
    },
    {
      key: "PHYSICAL_INSPECTION",
      label: "Physical Inspection",
      desc: "Hardware condition & IMEI verified at doorstep",
    },
    {
      key: "PAYMENT_COMPLETED",
      label: "Payment Completed",
      desc: order.paymentStatus === "PAID" || order.status === "COMPLETED"
        ? `₹${(order.revisedPrice || order.estimatedPrice || 0).toLocaleString("en-IN")} payout transferred to seller`
        : "Instant payout transfer to seller",
    },
    {
      key: "BILL_GENERATED",
      label: "Bill Generated",
      desc: "Official Tax Invoice & Purchase Receipt ready",
    },
  ];

  const getStepStatus = (stepKey: string) => {
    const s = order.status;
    const isPaid = order.paymentStatus === "PAID" || s === "COMPLETED" || s === "PAID";
    const isInspected = s === "INSPECTION_COMPLETED" || s === "ACCEPTED" || isPaid;
    const isAssigned = !!order.assignedPartnerName || s === "PARTNER_ASSIGNED" || isInspected;

    if (stepKey === "ORDER_ACCEPTED") return "COMPLETED";
    if (stepKey === "AGENT_ASSIGNED") return isAssigned ? "COMPLETED" : "ACTIVE";
    if (stepKey === "PHYSICAL_INSPECTION") return isInspected ? "COMPLETED" : isAssigned ? "ACTIVE" : "PENDING";
    if (stepKey === "PAYMENT_COMPLETED") return isPaid ? "COMPLETED" : isInspected ? "ACTIVE" : "PENDING";
    if (stepKey === "BILL_GENERATED") return isPaid || isInspected ? "COMPLETED" : "PENDING";
    return "PENDING";
  };

  const handleAcceptOffer = async () => {
    try {
      setCustomerDecision("ACCEPTED");
      await fetch(`/api/v1/orders/${order.id || order.orderNumber}/accept-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: true }),
      });

      const updated: OrderData = {
        ...order,
        status: "IDENTITY_VERIFICATION_PENDING",
        updatedAt: new Date().toISOString(),
      };
      setOrder(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updated));
      }

      trackMetaCustomEvent("OfferAccepted", {
        order_number: order.orderNumber,
        value: order.revisedPrice || order.estimatedPrice || 0,
        currency: "INR",
      }, { eventId: `offer_accept_${order.id || order.orderNumber}` });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelOrder = async (reason = "Customer declined offer / cancelled order.") => {
    setIsCancelling(true);
    try {
      setCustomerDecision("DECLINED");
      await fetch(`/api/v1/orders/${order.id || order.orderNumber}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }).catch(() => null);

      const updated: OrderData = {
        ...order,
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
      };
      setOrder(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`cashall_order_${order.orderNumber}`, JSON.stringify(updated));
        const allSaved = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
        const nextSaved = allSaved.map((o: any) => o.orderNumber === order.orderNumber ? { ...o, status: "CANCELLED" } : o);
        localStorage.setItem("cashall_all_orders", JSON.stringify(nextSaved));
      }
      setCancelModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeclineOffer = async () => {
    await handleCancelOrder("Customer declined final valuation offer.");
  };

  const isRevised = order.priceDifferenceReason && order.declaredConditionSummary;
  const isCancelled = order.status === "CANCELLED" || order.status === "REJECTED" || customerDecision === "DECLINED";
  const isPaid = order.paymentStatus === "PAID" || order.status === "COMPLETED" || customerDecision === "ACCEPTED";

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
                <Badge variant={isCancelled ? "danger" : isPaid ? "success" : "yellow"}>
                  {isCancelled ? "CANCELLED" : order.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <h1 className="text-2xl font-black text-brand-black">
                Order ID: {order.orderNumber}
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Booked on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 space-y-2">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase">CashALL Final Offer</div>
                <div className="text-2xl sm:text-3xl font-black text-brand-black font-price">
                  ₹{(order.revisedPrice || order.estimatedPrice || 31400).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="flex items-center sm:justify-end gap-2">
                <Link href={`/order/${order.orderNumber}/bill`}>
                  <Button variant="outline" size="sm" className="font-extrabold text-xs">
                    <span>View Official Bill</span>
                  </Button>
                </Link>
                {!isPaid && !isCancelled && (
                  <Button
                    onClick={() => setCancelModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="font-bold text-xs text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <span>Cancel Order</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* CANCELLED STATUS BANNER */}
          {isCancelled && (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 sm:p-8 space-y-4 animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-red-950">Order Cancelled</h2>
                  <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
                    This order #{order.orderNumber} has been cancelled. Doorstep pickup and evaluation have been called off. No penalty or fee applies.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/sell/mobile">
                  <Button variant="primary" size="sm" className="font-extrabold shadow-yellowGlow gap-1.5">
                    <span>Sell Another Device / Re-quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline" size="sm" className="font-bold">
                    <span>Go to My Account</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* ASSIGNED PICKUP EXECUTIVE CARD */}
          {order.assignedPartnerName ? (
            <div className="bg-gradient-to-br from-neutral-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 border border-brand-yellow/40 flex items-center justify-center text-brand-yellow shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Pickup Executive Assigned</span>
                    </div>
                    <h2 className="text-xl font-black text-white">
                      {order.assignedPartnerName}
                    </h2>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>{order.assignedPartnerBusiness || "Express Logistics Partner"}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${order.assignedPartnerPhone || "+919876543210"}`}
                  className="inline-flex items-center justify-center gap-2 bg-brand-yellow text-black font-extrabold text-xs px-6 py-3 rounded-2xl border border-black shadow-yellowGlow hover:bg-yellow-400 transition-all text-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Executive ({order.assignedPartnerPhone || "+91 9876543210"})</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300 pt-1">
                <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Scheduled Window</span>
                  <span className="font-extrabold text-white text-sm">{order.pickupDate} ({order.pickupTimeSlot})</span>
                </div>
                <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Pickup Address</span>
                  <span className="font-semibold text-gray-200 truncate block">{order.addressSummary || "Customer Address • PIN: " + order.pincode}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-brand-black">Assigning Local Pickup Agent...</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Our local logistics team is assigning a CashALL executive for pincode <strong className="text-black">{order.pincode}</strong>. Executive details will appear here as soon as dispatched.
                </p>
              </div>
            </div>
          )}

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
          {["FINAL_OFFER", "FINAL_OFFER_PENDING", "CUSTOMER_ACCEPTED", "IDENTITY_VERIFICATION_PENDING", "IDENTITY_VERIFIED", "ACCEPTED", "COMPLETED"].includes(order.status) && (
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
              {customerDecision === "NONE" && (order.status === "FINAL_OFFER" || order.status === "FINAL_OFFER_PENDING") ? (
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
                      onClick={() => setCancelModalOpen(true)}
                      variant="tertiary"
                      size="lg"
                      fullWidth
                      className="font-bold text-red-600 hover:bg-red-50 border-red-200 gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      <span>DECLINE OFFER & CANCEL ORDER</span>
                    </Button>
                  </div>
                  <p className="text-[11px] text-center text-brand-muted">
                    If you decline, your phone will be returned immediately with zero cancellation fee.
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
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Offer declined. Order is marked as cancelled. No pickup or fee applies.</span>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !isCancelling && setCancelModalOpen(false)}
        title="Cancel Order Confirmation"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Are you sure you want to cancel this order?</p>
              <p className="leading-relaxed">
                If you cancel order <strong>#{order.orderNumber}</strong>, doorstep pickup and inspection will be called off immediately with zero cancellation fee.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancelling}
              className="font-bold"
            >
              Keep Order Active
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleCancelOrder("Customer declined offer / cancelled order")}
              disabled={isCancelling}
              className="font-extrabold bg-red-600 hover:bg-red-700 text-white border-transparent shadow-none"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
            </Button>
          </div>
        </div>
      </Modal>

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
