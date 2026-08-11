import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 border border-brand-border shadow-premium space-y-6 text-xs text-brand-muted leading-relaxed">
          <h1 className="text-2xl font-black text-brand-black border-b border-gray-100 pb-3">
            Privacy Policy (Draft Document)
          </h1>
          <p>
            This Privacy Policy describes how Aarna Enterprise collects, uses, and protects user information when you visit or sell devices on CashALL.
          </p>
          <h2 className="text-sm font-bold text-brand-black">1. Information We Collect</h2>
          <p>
            We collect only the minimum personal information required to facilitate device valuation, doorstep pickup, and payout transfers: mobile phone numbers, contact names, doorstep collection addresses, pincodes, and device condition answers.
          </p>
          <h2 className="text-sm font-bold text-brand-black">2. Device Data Security & Erasure</h2>
          <p>
            We prioritize device privacy. Customer device data is reset during doorstep pickup in your presence. CashALL requires all recommerce inventory to undergo certified factory erasures before resale.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
