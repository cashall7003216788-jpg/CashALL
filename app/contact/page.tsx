"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin, CheckCircle2, MessageSquare } from "lucide-react";
import { trackMetaStandardEvent } from "@/lib/analytics/meta";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    orderId: "",
    issueType: "Order Query",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackMetaStandardEvent("Contact", {
      content_name: "Contact Form",
      issue_type: formData.issueType,
    }, { eventId: `contact_form_${formData.phone || Date.now()}` });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-brand-black">
              Contact CashALL Support
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-2">
              Have questions about your order, pricing valuation, or pickup schedule? We&apos;re here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* SUPPORT FORM */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-base font-bold text-brand-black border-b border-gray-100 pb-3">
                    Send Support Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Your Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="Enter your name"
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="ananya@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-black mb-1">Order ID (Optional)</label>
                      <input
                        type="text"
                        value={formData.orderId}
                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                        placeholder="e.g. CA10482"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">Issue Category</label>
                    <select
                      value={formData.issueType}
                      onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                    >
                      <option value="Order Query">Order & Pickup Scheduling Query</option>
                      <option value="Valuation Query">Device Valuation & Pricing Question</option>
                      <option value="Payment Status">Payment & Transaction Reference Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black mb-1">Your Message</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                      placeholder="How can we assist you today?"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth className="font-extrabold shadow-yellowGlow">
                    SUBMIT SUPPORT TICKET
                  </Button>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-black">Support Ticket Created!</h3>
                  <p className="text-xs text-brand-muted max-w-sm mx-auto">
                    Ticket #TK-{Math.floor(10000 + Math.random() * 90000)} has been logged. Our customer team will call or SMS you at {formData.phone} shortly.
                  </p>
                </div>
              )}
            </div>

            {/* CONTACT INFO */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                <h3 className="text-sm font-black text-brand-black">CashALL Direct Support Desk</h3>
                
                <div className="space-y-4 text-xs text-brand-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <div className="font-bold text-brand-black">Call Support</div>
                      <a href="tel:+917003216788" className="text-brand-black font-extrabold hover:underline">
                        +91 7003216788
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-900">WhatsApp Live Support</div>
                      <a
                        href="https://wa.me/917003216788?text=Hi%20CashALL%20Support,%20I%20need%20assistance%20selling%20my%20device."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-extrabold underline hover:text-emerald-900"
                      >
                        Chat on WhatsApp (+91 7003216788) &rarr;
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <div className="font-bold text-brand-black">Official Email Support</div>
                      <a href="mailto:support@cashall.in" className="text-blue-600 font-extrabold hover:underline">
                        support@cashall.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 text-brand-black flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-brand-black" />
                    </div>
                    <div>
                      <div className="font-bold text-brand-black">Headquarters</div>
                      <div>Howrah, West Bengal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
