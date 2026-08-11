"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Lock, Smartphone } from "lucide-react";

interface PriceUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; phone: string }) => void;
  deviceName: string;
  deviceImageUrl?: string | null;
  storage?: string;
}

export function PriceUnlockModal({
  isOpen,
  onClose,
  onSuccess,
  deviceName,
  deviceImageUrl,
  storage,
}: PriceUnlockModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, "");
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);
    const userObj = {
      id: `usr_${Date.now()}`,
      name: "Customer",
      phone: clean,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_user", JSON.stringify(userObj));
    }

    setTimeout(() => {
      setLoading(false);
      onSuccess(userObj);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* MODAL CARD */}
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border border-brand-border relative text-brand-black animate-scaleUp">
        
        {/* TEAL HEADER */}
        <div className="bg-[#14b8a6] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Login/Signup</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* PRODUCT CARD BOX */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 border border-gray-200 shrink-0 shadow-sm">
              {deviceImageUrl ? (
                <img src={deviceImageUrl} alt={deviceName} className="max-h-12 max-w-12 object-contain" />
              ) : (
                <Smartphone className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-brand-black leading-snug">
                {deviceName} {storage ? `(${storage})` : ""}
              </h3>
              <div className="text-[11px] text-gray-500 font-medium">Selling Price</div>
              {/* MASKED PRICE */}
              <div className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight font-price">
                ₹ XX,XXX
              </div>
            </div>
          </div>

          {/* LOCK BANNER */}
          <div className="bg-[#e6fffa] text-[#0d9488] border border-[#99f6e4] rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-center">
            <Lock className="w-4 h-4 shrink-0 text-[#0d9488]" />
            <span>Login to unlock the best price</span>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Enter your phone number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-black text-gray-700">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  maxLength={10}
                  placeholder="Enter your Mobile"
                  required
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 text-sm font-semibold bg-gray-50 rounded-xl border border-gray-300 focus:outline-none focus:border-[#14b8a6] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms-check"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#14b8a6] rounded border-gray-300 focus:ring-[#14b8a6]"
              />
              <label htmlFor="terms-check" className="text-[11px] text-gray-500 font-medium leading-tight">
                I agree to the <span className="underline text-gray-700 font-bold">Terms and Conditions</span> &amp; <span className="underline text-gray-700 font-bold">Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full py-3.5 bg-gray-200 hover:bg-[#14b8a6] hover:text-white text-gray-700 font-black text-sm rounded-xl transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Unlocking Price..." : "CONTINUE"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
