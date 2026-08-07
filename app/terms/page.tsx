import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-black">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 border border-brand-border shadow-premium space-y-6 text-xs text-brand-muted leading-relaxed">
          <h1 className="text-2xl font-black text-brand-black border-b border-gray-100 pb-3">
            Terms & Conditions (Draft Document)
          </h1>
          <p>
            By booking a device pickup or selling a used mobile phone on CashALL, you agree to the following operational terms and conditions:
          </p>
          <h2 className="text-sm font-bold text-brand-black">1. Estimated Valuation vs Physical Inspection</h2>
          <p>
            Online values generated on CashALL are non-binding estimates based on customer-selected parameters. Final pricing is confirmed after physical inspection by our certified doorstep agent. If condition discrepancies exist, a revised valuation with explicit reasoning is presented for customer approval or decline.
          </p>
          <h2 className="text-sm font-bold text-brand-black">2. Ownership & Device Declaration</h2>
          <p>
            The seller confirms that they are the legal owner of the device being sold and that the IMEI is not blacklisted or reported lost/stolen.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
