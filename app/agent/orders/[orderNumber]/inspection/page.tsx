"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Save,
  Loader2,
  User,
  Phone,
  MapPin,
  Barcode,
  Mail,
  IndianRupee,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function AgentOrderInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumberParam = params.orderNumber as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agentSession, setAgentSession] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Inspection Form State
  const [imei, setImei] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [screenFinding, setScreenFinding] = useState("Flawless Screen - No Scratches");
  const [bodyFinding, setBodyFinding] = useState("Flawless Body - Like New");
  const [camerasOk, setCamerasOk] = useState(true);
  const [touchOk, setTouchOk] = useState(true);
  const [biometricsOk, setBiometricsOk] = useState(true);
  const [batteryOk, setBatteryOk] = useState(true);
  const [revisedPrice, setRevisedPrice] = useState<string | number>("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cashall_agent_session");
      if (!saved) {
        router.replace("/agent/login");
        return;
      }
      try {
        setAgentSession(JSON.parse(saved).agent || { name: "Field Agent" });
      } catch (e) {}
    }
  }, [router]);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumberParam) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/agent/orders?name=${encodeURIComponent(agentSession?.name || "")}&phone=${agentSession?.phone || ""}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          const match = json.orders.find(
            (o: any) => o.orderNumber === orderNumberParam || o.id === orderNumberParam
          );
          if (match) {
            setOrder(match);
            const initialPrice = match.finalPrice || match.estimatedPrice || match.amount || 0;
            setRevisedPrice(initialPrice);
            setImei(match.imeiNumber || "");
            setCustomerEmail(match.customerEmail && match.customerEmail !== "—" ? match.customerEmail : "");
          } else {
            setErrorMsg(`Order #${orderNumberParam} not found in your assigned list.`);
          }
        }
      } catch (err: any) {
        console.error("Error loading order:", err);
        setErrorMsg("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    if (agentSession) {
      loadOrder();
    }
  }, [orderNumberParam, agentSession]);

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei.trim() || imei.trim().length < 5) {
      alert("Please enter a valid IMEI / Serial number (minimum 5 digits).");
      return;
    }

    const finalAmount = Number(revisedPrice);
    if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
      alert("Please enter a valid final payout price.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/agent/orders/${orderNumberParam}/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imei: imei.trim(),
          screenFinding,
          bodyFinding,
          functionalChecks: {
            cameras: camerasOk ? "Pass" : "Fail",
            touchscreen: touchOk ? "Pass" : "Fail",
            biometrics: biometricsOk ? "Pass" : "Fail",
            batteryHealth: batteryOk ? "Pass" : "Fail",
          },
          revisedPrice: Number(revisedPrice),
          reason: reason.trim(),
          customerEmail: customerEmail.trim(),
          agentName: agentSession?.name || "Field Agent",
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Also update local storage if present
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`cashall_order_${orderNumberParam}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.revisedPrice = Number(revisedPrice);
              parsed.finalPrice = Number(revisedPrice);
              parsed.imeiNumber = imei.trim();
              parsed.status = "ACCEPTED";
              if (customerEmail.trim()) parsed.customerEmail = customerEmail.trim();
              localStorage.setItem(`cashall_order_${orderNumberParam}`, JSON.stringify(parsed));
            } catch (e) {}
          }
        }

        alert(`✅ Physical Inspection Completed for Order #${orderNumberParam}!\nVerified IMEI: ${imei.trim()}\nFinal Valuation: ₹${Number(revisedPrice).toLocaleString("en-IN")}`);
        router.push("/agent/dashboard");
      } else {
        alert(`Failed to save inspection: ${json.error || "Server error"}`);
      }
    } catch (err: any) {
      alert(`Error submitting inspection: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
          <p className="text-xs text-neutral-400 font-semibold">Loading Doorstep Inspection Console...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Order Not Found</h2>
          <p className="text-xs text-neutral-400">{errorMsg || "Unable to find this order in your assignments."}</p>
          <Link
            href="/agent/dashboard"
            className="inline-flex items-center gap-2 bg-yellow-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agent Console
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* TOP HEADER BAR */}
      <header className="bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 py-3.5 px-4 sm:px-8 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/agent/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-yellow-400 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-neutral-800" />
          <span className="text-sm font-black text-white font-price tracking-wide">
            Doorstep Physical Inspection
          </span>
        </div>

        <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black px-3 py-1 rounded-xl">
          Order #{order.orderNumber}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* CUSTOMER & DEVICE BANNER */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <h1 className="text-base font-extrabold text-white">{order.deviceName}</h1>
                <p className="text-[11px] text-neutral-400">Order ID: #{order.orderNumber}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-neutral-400 font-medium">Original Online Quote</div>
              <div className="text-lg font-black text-yellow-400 font-price">
                ₹{(order.estimatedPrice || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-black/40 p-3 rounded-2xl border border-neutral-800">
              <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                <User className="w-3 h-3 text-yellow-400" /> Customer Information
              </div>
              <div className="font-bold text-white text-sm">{order.customerName}</div>
              <div className="text-neutral-300">📞 {order.customerPhone}</div>
            </div>

            <div className="space-y-1 bg-black/40 p-3 rounded-2xl border border-neutral-800">
              <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-yellow-400" /> Pickup Location
              </div>
              <div className="text-neutral-300 line-clamp-2">{order.address || order.addressSummary}</div>
            </div>
          </div>
        </div>

        {/* INSPECTION FORM */}
        <form onSubmit={handleSubmitInspection} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Physical QC Verification Form
            </h2>
          </div>

          {/* 1. MANDATORY IMEI NUMBER */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-300">
              Verified IMEI / Serial Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="e.g. 864932057391842 (Dial *#06# on device)"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none transition"
              />
            </div>
            <p className="text-[10px] text-neutral-500">
              Dial <span className="text-yellow-400 font-mono">*#06#</span> on the seller&apos;s phone to retrieve and match the 15-digit IMEI.
            </p>
          </div>

          {/* 2. SCREEN CONDITION */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-300">Screen Physical Condition</label>
            <select
              value={screenFinding}
              onChange={(e) => setScreenFinding(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:outline-none transition cursor-pointer"
            >
              <option value="Flawless Screen - No Scratches">✨ Flawless (No scratches, crystal clear)</option>
              <option value="Minor Normal Wear Scratches">Minor Scratches (1-2 hairline scratches)</option>
              <option value="Heavy Scratches on Glass">Heavy Scratches (Noticeable fingernail deep)</option>
              <option value="Cracked Glass / Display Issue">Cracked Screen / Display Lines / Bleeding</option>
            </select>
          </div>

          {/* 3. BODY CONDITION */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-300">Body & Frame Condition</label>
            <select
              value={bodyFinding}
              onChange={(e) => setBodyFinding(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:outline-none transition cursor-pointer"
            >
              <option value="Flawless Body - Like New">✨ Flawless Body (No dents or marks)</option>
              <option value="Minor Scratches on Frame">Minor Scratches / Paint wear on edges</option>
              <option value="Visible Dents / Deep Scratches">Visible Dents / Corner impacts</option>
              <option value="Bent Frame / Loose Back Panel">Bent Frame / Broken or Loose Back Panel</option>
            </select>
          </div>

          {/* 4. FUNCTIONAL CHECKS */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-neutral-300">Hardware Functional Checks</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setCamerasOk(!camerasOk)}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  camerasOk ? "bg-emerald-950/40 border-emerald-700 text-emerald-300" : "bg-red-950/40 border-red-700 text-red-300"
                }`}
              >
                <span>📷 Cameras</span>
                <span className="text-[10px] opacity-80">{camerasOk ? "✓ PASS" : "✕ FAIL"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTouchOk(!touchOk)}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  touchOk ? "bg-emerald-950/40 border-emerald-700 text-emerald-300" : "bg-red-950/40 border-red-700 text-red-300"
                }`}
              >
                <span>📱 Touchscreen</span>
                <span className="text-[10px] opacity-80">{touchOk ? "✓ PASS" : "✕ FAIL"}</span>
              </button>

              <button
                type="button"
                onClick={() => setBiometricsOk(!biometricsOk)}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  biometricsOk ? "bg-emerald-950/40 border-emerald-700 text-emerald-300" : "bg-red-950/40 border-red-700 text-red-300"
                }`}
              >
                <span>🔒 Face / Finger</span>
                <span className="text-[10px] opacity-80">{biometricsOk ? "✓ PASS" : "✕ FAIL"}</span>
              </button>

              <button
                type="button"
                onClick={() => setBatteryOk(!batteryOk)}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  batteryOk ? "bg-emerald-950/40 border-emerald-700 text-emerald-300" : "bg-red-950/40 border-red-700 text-red-300"
                }`}
              >
                <span>🔋 Battery / Charge</span>
                <span className="text-[10px] opacity-80">{batteryOk ? "✓ PASS" : "✕ FAIL"}</span>
              </button>
            </div>
          </div>

          {/* 5. CUSTOMER EMAIL FOR INVOICE */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-neutral-300">
              Customer Email Address <span className="text-yellow-400">(for official tax invoice delivery)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* 6. FINAL AGREED VALUATION */}
          <div className="bg-black/60 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                Final Settled Payout Offer (Agreed with Seller) <span className="text-red-400">*</span>
              </label>
              <div className="text-[11px] text-neutral-400">
                Online Quote: <span className="font-bold text-yellow-400">₹{(order.estimatedPrice || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="relative">
              <span className="text-emerald-400 font-bold absolute left-4 top-1/2 -translate-y-1/2 text-base">₹</span>
              <input
                type="number"
                required
                min={0}
                placeholder="Enter final payout offer"
                value={revisedPrice}
                onChange={(e) => setRevisedPrice(e.target.value)}
                className="w-full bg-neutral-950 border border-emerald-600/60 focus:border-emerald-400 rounded-xl pl-9 pr-4 py-3 text-lg font-black font-price text-emerald-400 focus:outline-none transition placeholder-neutral-700"
              />
            </div>

            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for price adjustment (e.g. Scratched screen or verified flawless condition)"
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none transition"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm py-3.5 px-6 rounded-2xl transition shadow-yellowGlow disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting & Locking Valuation...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Physical Inspection & Lock Offer</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
