"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Smartphone, CheckCircle2, ShieldCheck, Lock, ArrowRight } from "lucide-react";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CustomerAuthModal({ isOpen, onClose, onSuccess }: CustomerAuthModalProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOtpSent(true);
      } else {
        setError(data.error || "Failed to send verification OTP.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, code: otpCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const userObj = {
          id: `u-${Date.now()}`,
          name: customerName.trim() || "CashALL Seller",
          phone: phoneNumber.replace(/\D/g, ""),
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("cashall_user", JSON.stringify(userObj));
        }

        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/account");
        }
      } else {
        setError(data.error || "Invalid OTP code. Please check and try again.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOtpSent(false);
    setOtpCode("");
    setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={otpSent ? "Verify OTP Code" : "Customer Login / Sign In"}
    >
      <div className="space-y-5 py-2">
        <div className="flex items-center gap-3 p-3 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/30 text-brand-black">
          <ShieldCheck className="w-6 h-6 text-brand-yellow shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold block text-brand-black">Secure Phone Verification</span>
            <span className="text-brand-muted">Sign in to track orders, schedule pickups, and receive instant payouts.</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">Your Full Name (Optional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">Mobile Number *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-gray-500">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  placeholder="9876543210"
                  required
                  className="w-full pl-12 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow font-semibold"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading || phoneNumber.replace(/\D/g, "").length < 10}
              className="font-extrabold text-xs py-3 shadow-yellowGlow gap-1.5"
            >
              <span>{loading ? "Sending Verification OTP..." : "GET VERIFICATION OTP"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-xs text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Verification OTP sent to <strong>+91 {phoneNumber}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">Enter 6-Digit OTP</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-gray-400" />
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-center text-lg font-bold tracking-widest bg-white rounded-xl border border-brand-border focus:outline-none focus:border-brand-yellow"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading || otpCode.length < 6}
              className="font-extrabold text-xs py-3 shadow-yellowGlow"
            >
              {loading ? "Verifying OTP..." : "VERIFY & LOG IN"}
            </Button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full text-center text-xs text-brand-muted hover:text-brand-black underline font-semibold mt-2"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
