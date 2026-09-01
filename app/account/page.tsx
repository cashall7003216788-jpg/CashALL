"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CustomerAnswersModal } from "@/components/admin/CustomerAnswersModal";
import { OrderData, QuoteData } from "@/lib/store";
import { User, Smartphone, ArrowRight, Clock, UserCheck, Phone, XCircle, Ban, AlertTriangle, FileText, ClipboardList } from "lucide-react";
import { cleanDeviceName } from "@/lib/device";

export default function CustomerAccountPage() {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);

  // View Answers / Condition modal state
  const [selectedOrderForAnswers, setSelectedOrderForAnswers] = useState<OrderData | null>(null);

  // Cancel order modal state
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // Cancel quote modal state
  const [quoteToCancel, setQuoteToCancel] = useState<string | null>(null);
  const [isCancellingQuote, setIsCancellingQuote] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let phoneNum = "";
      const u = localStorage.getItem("cashall_user");
      if (u) {
        try {
          const parsedUser = JSON.parse(u);
          setUser(parsedUser);
          if (parsedUser.phone) phoneNum = parsedUser.phone;
        } catch (e) {
          console.error(e);
        }
      }

      // 1. Load local storage orders
      let localOrders: OrderData[] = [];
      const all = localStorage.getItem("cashall_all_orders");
      if (all) {
        try {
          const parsed = JSON.parse(all);
          if (Array.isArray(parsed)) {
            localOrders = parsed.filter((o: OrderData) => {
              if (!phoneNum) return true;
              const cleanStored = (o.customerPhone || "").replace(/\D/g, "").slice(-10);
              const cleanCurrent = phoneNum.replace(/\D/g, "").slice(-10);
              return !cleanStored || cleanStored === cleanCurrent;
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Load saved quotes
      let localQuotes: QuoteData[] = [];
      const savedQ = localStorage.getItem("cashall_quotes");
      const latestQ = localStorage.getItem("cashall_latest_quote");
      if (savedQ) {
        try {
          const parsed = JSON.parse(savedQ);
          if (Array.isArray(parsed)) localQuotes = parsed;
        } catch (e) {}
      } else if (latestQ) {
        try {
          const parsed = JSON.parse(latestQ);
          if (parsed) localQuotes = [parsed];
        } catch (e) {}
      }
      setQuotes(localQuotes);

      // 3. Auto-sync local storage orders to PostgreSQL
      if (localOrders.length > 0) {
        fetch("/api/v1/orders/sync-local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: localOrders }),
        }).catch((err) => console.warn("Auto-sync error:", err));
      }

      // 4. Fetch central PostgreSQL database orders for this user's phone
      if (phoneNum) {
        fetch(`/api/v1/orders/user?phone=${encodeURIComponent(phoneNum)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
              const map = new Map<string, OrderData>();
              data.orders.forEach((o: OrderData) => map.set(o.orderNumber, o));
              localOrders.forEach((o: OrderData) => {
                if (!map.has(o.orderNumber)) map.set(o.orderNumber, o);
              });
              setOrders(Array.from(map.values()));
            } else if (localOrders.length > 0) {
              setOrders(localOrders);
            } else {
              setOrders([]);
            }
          })
          .catch(() => {
            if (localOrders.length > 0) setOrders(localOrders);
            else setOrders([]);
          });
      } else if (localOrders.length > 0) {
        setOrders(localOrders);
      } else {
        setOrders([]);
      }
    }
  }, []);

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancellingOrder(true);
    try {
      await fetch(`/api/v1/orders/${orderToCancel}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Customer cancelled from account portal" }),
      }).catch(() => null);

      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === orderToCancel ? { ...o, status: "CANCELLED" } : o))
      );

      if (typeof window !== "undefined") {
        const allSaved = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
        const nextSaved = allSaved.map((o: any) =>
          o.orderNumber === orderToCancel ? { ...o, status: "CANCELLED" } : o
        );
        localStorage.setItem("cashall_all_orders", JSON.stringify(nextSaved));

        const singleOrder = localStorage.getItem(`cashall_order_${orderToCancel}`);
        if (singleOrder) {
          const parsed = JSON.parse(singleOrder);
          parsed.status = "CANCELLED";
          localStorage.setItem(`cashall_order_${orderToCancel}`, JSON.stringify(parsed));
        }
      }
      setOrderToCancel(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const confirmCancelQuote = async () => {
    if (!quoteToCancel) return;
    setIsCancellingQuote(true);
    try {
      await fetch(`/api/v1/quotes/${quoteToCancel}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Customer cancelled quote from account portal" }),
      }).catch(() => null);

      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteToCancel || q.quoteNumber === quoteToCancel ? { ...q, status: "CANCELLED" } : q
        )
      );

      if (typeof window !== "undefined") {
        const allQ = JSON.parse(localStorage.getItem("cashall_quotes") || "[]");
        const nextQ = allQ.map((q: any) =>
          q.id === quoteToCancel || q.quoteNumber === quoteToCancel ? { ...q, status: "CANCELLED" } : q
        );
        localStorage.setItem("cashall_quotes", JSON.stringify(nextQ));

        const latestQ = localStorage.getItem("cashall_latest_quote");
        if (latestQ) {
          const parsed = JSON.parse(latestQ);
          if (parsed.id === quoteToCancel || parsed.quoteNumber === quoteToCancel) {
            parsed.status = "CANCELLED";
            localStorage.setItem("cashall_latest_quote", JSON.stringify(parsed));
          }
        }
      }
      setQuoteToCancel(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancellingQuote(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* PROFILE WELCOME CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-yellow text-brand-black flex items-center justify-center font-extrabold shadow-yellowGlow shrink-0">
              <User className="w-7 h-7 text-brand-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-black">
                Hello, {user?.name || "CashALL Seller"}!
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                {user?.phone ? `Mobile: ${user.phone}` : "Manage your device sales, orders, and pickups"}
              </p>
            </div>
          </div>

          {/* ORDERS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-brand-black">
                My Device Orders ({orders.length})
              </h2>
              <Link href="/sell/mobile">
                <Button variant="primary" size="sm" className="font-extrabold text-xs shadow-yellowGlow">
                  <span>+ Sell Another Phone</span>
                </Button>
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const isCancelled = ord.status === "CANCELLED" || ord.status === "REJECTED";
                  const isCompleted = ord.status === "COMPLETED" || ord.paymentStatus === "PAID";

                  return (
                    <div
                      key={ord.id || ord.orderNumber}
                      className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCancelled
                          ? "border-red-200 bg-red-50/20"
                          : "border-brand-border shadow-subtleCard hover:shadow-premium"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="yellow">ORDER #{ord.orderNumber}</Badge>
                          <Badge variant={isCancelled ? "danger" : isCompleted ? "success" : "neutral"}>
                            {isCancelled ? "CANCELLED" : ord.status.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <div className="text-base font-black text-brand-black flex items-center gap-2">
                          <Smartphone className={`w-4 h-4 ${isCancelled ? "text-red-400" : "text-brand-yellow"}`} />
                          <span className={isCancelled ? "text-gray-600 line-through" : ""}>
                            {cleanDeviceName(ord.deviceName || "Mobile Device")}
                          </span>
                        </div>

                        <div className="text-xs text-brand-muted flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Pickup: {ord.pickupDate} ({ord.pickupTimeSlot})</span>
                          </span>
                        </div>

                        {ord.assignedPartnerName && !isCancelled && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-800 rounded-full text-xs font-bold">
                              <UserCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                              <span>Executive: {ord.assignedPartnerName}</span>
                            </div>
                            {ord.assignedPartnerPhone && (
                              <a
                                href={`tel:${ord.assignedPartnerPhone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-yellow text-brand-black rounded-full text-xs font-black hover:bg-brand-yellowHover transition-colors shadow-xs"
                                title={`Call ${ord.assignedPartnerName}`}
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call ({ord.assignedPartnerPhone})</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[11px] font-bold text-gray-400 uppercase">Valuation</span>
                          <div className={`text-xl font-black font-price ${isCancelled ? "text-gray-400 line-through" : "text-brand-black"}`}>
                            ₹{(ord.revisedPrice || ord.estimatedPrice || 32500).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/track/${ord.orderNumber}`}>
                            <Button variant="primary" size="sm" className="font-extrabold gap-1.5 shadow-yellowGlow">
                              <span>Track Order</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => setSelectedOrderForAnswers(ord)}
                            variant="outline"
                            size="sm"
                            className="font-extrabold gap-1.5 bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-neutral-900"
                          >
                            <ClipboardList className="w-4 h-4 text-yellow-600" />
                            <span>Condition Answers</span>
                          </Button>
                          <Link href={`/order/${ord.orderNumber}/bill`}>
                            <Button variant="outline" size="sm" className="font-extrabold gap-1.5">
                              <span>View Bill</span>
                            </Button>
                          </Link>
                          {!isCompleted && !isCancelled && (
                            <Button
                              onClick={() => setOrderToCancel(ord.orderNumber)}
                              variant="outline"
                              size="sm"
                              className="font-bold text-xs text-red-600 hover:bg-red-50 border-red-200"
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              <span>Cancel</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-brand-border">
                <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-brand-black">You haven&apos;t placed any orders yet.</h3>
                <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                  Find out what your old phone is worth and schedule a fast doorstep pickup in 3 simple steps.
                </p>
                <Link href="/sell/mobile" className="inline-block mt-4">
                  <Button variant="primary" size="md" className="font-extrabold shadow-yellowGlow">
                    Sell A Phone Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* SAVED QUOTES LIST */}
          {quotes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-black text-brand-black">
                My Saved Price Quotes ({quotes.length})
              </h2>

              <div className="space-y-3">
                {quotes.map((q) => {
                  const isCancelled = q.status === "CANCELLED";
                  let deviceName = "Mobile Device";
                  try {
                    const parsed = JSON.parse(q.breakdownJson || "{}");
                    if (parsed?.deviceName) deviceName = parsed.deviceName;
                  } catch {}

                  return (
                    <div
                      key={q.id || q.quoteNumber}
                      className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCancelled ? "border-red-200 bg-red-50/20" : "border-brand-border shadow-subtleCard hover:shadow-premium"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={isCancelled ? "danger" : "neutral"}>
                            {isCancelled ? "CANCELLED" : `QUOTE #${q.quoteNumber}`}
                          </Badge>
                          <span className="text-[11px] text-gray-400">
                            {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-brand-black flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-brand-yellow" />
                          <span className={isCancelled ? "text-gray-500 line-through" : ""}>{deviceName}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Estimated Value</span>
                          <div className={`text-lg font-black font-price ${isCancelled ? "text-gray-400 line-through" : "text-brand-black"}`}>
                            ₹{q.estimatedPrice.toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isCancelled ? (
                            <>
                              <Link href={`/quote/${q.id}`}>
                                <Button variant="primary" size="sm" className="font-extrabold text-xs shadow-yellowGlow gap-1">
                                  <span>View & Book</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                              <Button
                                onClick={() => setQuoteToCancel(q.id || q.quoteNumber)}
                                variant="outline"
                                size="sm"
                                className="font-bold text-xs text-red-600 hover:bg-red-50 border-red-200"
                              >
                                <Ban className="w-3.5 h-3.5 mr-1" />
                                <span>Cancel</span>
                              </Button>
                            </>
                          ) : (
                            <Link href="/sell/mobile">
                              <Button variant="outline" size="sm" className="font-bold text-xs">
                                <span>Re-evaluate</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      <Modal
        isOpen={!!orderToCancel}
        onClose={() => !isCancellingOrder && setOrderToCancel(null)}
        title="Cancel Order Confirmation"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Cancel Order #{orderToCancel}?</p>
              <p className="leading-relaxed">
                Are you sure you want to cancel this order? Doorstep pickup will be called off immediately at zero cost.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrderToCancel(null)}
              disabled={isCancellingOrder}
              className="font-bold"
            >
              Keep Order
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmCancelOrder}
              disabled={isCancellingOrder}
              className="font-extrabold bg-red-600 hover:bg-red-700 text-white border-transparent shadow-none"
            >
              {isCancellingOrder ? "Cancelling..." : "Yes, Cancel Order"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CANCEL QUOTE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!quoteToCancel}
        onClose={() => !isCancellingQuote && setQuoteToCancel(null)}
        title="Cancel Quote Confirmation"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Decline / Cancel this quote?</p>
              <p className="leading-relaxed">
                This valuation quote will be marked as cancelled and closed.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuoteToCancel(null)}
              disabled={isCancellingQuote}
              className="font-bold"
            >
              Keep Quote
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmCancelQuote}
              disabled={isCancellingQuote}
              className="font-extrabold bg-red-600 hover:bg-red-700 text-white border-transparent shadow-none"
            >
              {isCancellingQuote ? "Cancelling..." : "Yes, Cancel Quote"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* VIEW CONDITION ANSWERS AUDIT MODAL */}
      <CustomerAnswersModal
        isOpen={!!selectedOrderForAnswers}
        onClose={() => setSelectedOrderForAnswers(null)}
        orderOrQuote={selectedOrderForAnswers}
      />

      <Footer />
    </div>
  );
}

