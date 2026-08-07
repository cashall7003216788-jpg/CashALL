"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Building2, CheckCircle2, ShieldCheck, Truck, Zap } from "lucide-react";

export default function BulkSellPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    deviceCount: "10-50",
    deviceTypes: "Smartphones",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-black text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate & Retail Solutions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-black">
              Bulk Device Selling & Asset Liquidation
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted">
              Sell corporate smartphones, IT assets, or trade-in stock in bulk with transparent enterprise valuation and customized logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* FORM */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-base font-bold text-brand-black border-b border-gray-100 pb-3">
                    Request Bulk Price Valuation
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Company / Retailer Name</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="Acme Tech Pvt Ltd"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Business Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="john@acme.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Approx Number of Devices</label>
                      <select
                        value={formData.deviceCount}
                        onChange={(e) => setFormData({ ...formData, deviceCount: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                      >
                        <option value="5-20">5 - 20 Devices</option>
                        <option value="20-50">20 - 50 Devices</option>
                        <option value="50-200">50 - 200 Devices</option>
                        <option value="200+">200+ Devices</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="e.g. Bengaluru"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">Message / Device List Details</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                      placeholder="Briefly describe models, condition or special requirements..."
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth className="font-extrabold shadow-yellowGlow">
                    REQUEST BULK QUOTE
                  </Button>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-black">Bulk Quote Inquiry Received!</h3>
                  <p className="text-xs text-brand-muted max-w-sm mx-auto">
                    Our corporate account team will review your inquiry and contact you at {formData.phone} within 2 business hours.
                  </p>
                </div>
              )}
            </div>

            {/* SIDEBAR BENEFITS */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <h3 className="text-sm font-black text-brand-black">Why CashALL Corporate Bulk Sell?</h3>
                <ul className="space-y-3 text-xs text-brand-muted">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                    <span><strong>Certified Data Erasure:</strong> NIST 800-88 compliant data wiping documentation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                    <span><strong>Pan-India Onsite Pickup:</strong> Dedicated logistics agents collect from your office.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                    <span><strong>Same-Day Bulk Payouts:</strong> Direct corporate wire transfer upon inventory audit.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
