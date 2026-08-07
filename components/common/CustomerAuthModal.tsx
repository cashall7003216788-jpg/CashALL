"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { firebaseClientAuth } from "@/lib/firebase-client";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (phone: string) => void;
}

export function CustomerAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomerAuthModalProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber("");
      setOtpCode("");
      setOtpSent(false);
      setError("");
      setLoading(false);
      setCountdown(0);
      // Cleanup recaptcha
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  const setupRecaptcha = () => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    const verifier = new RecaptchaVerifier(
      firebaseClientAuth,
      "recaptcha-container",
      { size: "invisible" }
    );
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

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
      const verifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        firebaseClientAuth,
        `+91${cleanPhone}`,
        verifier
      );
      confirmationRef.current = confirmation;
      setOtpSent(true);
      setCountdown(30);
    } catch (err: any) {
      console.error("Firebase OTP send error:", err);
      // Clean up failed recaptcha so it can be retried
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (err.code === "auth/quota-exceeded") {
        setError("SMS quota exceeded. Please try again later.");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationRef.current) {
      setError("Please request an OTP first.");
      return;
    }
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await confirmationRef.current.confirm(otpCode);
      const idToken = await result.user.getIdToken();

      // Verify with our backend for audit trail
      await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const userObj = {
        id: result.user.uid,
        name: customerName.trim() || "CashALL Seller",
        phone: cleanPhone,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("cashall_user", JSON.stringify(userObj));
      }

      onClose();
      if (onSuccess) {
        onSuccess(cleanPhone);
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      console.error("Firebase OTP verify error:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP code. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please request a new one.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtpSent(false);
    setOtpCode("");
    setError("");
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (e) {}
      recaptchaVerifierRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-brand-black">
            {otpSent ? "Enter OTP Code" : "Customer Login"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {otpSent
              ? `OTP sent to +91 ${phoneNumber}. Enter 6-digit code below.`
              : "Sign in to track orders & schedule pickups."}
          </p>
        </div>

        {/* Firebase reCAPTCHA invisible container */}
        <div id="recaptcha-container" ref={recaptchaContainerRef} />

        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200 text-brand-black mb-4">
          <ShieldCheck className="w-5 h-5 text-yellow-500 shrink-0" />
          <span className="text-xs font-semibold">Secured by Firebase Phone Verification</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">
                Mobile Number *
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-yellow-400">
                <span className="px-3 py-2.5 bg-gray-50 text-sm font-bold text-gray-500 border-r border-gray-200">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={10}
                  placeholder="9876543210"
                  required
                  className="flex-1 px-3 py-2.5 text-sm font-semibold focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.replace(/\D/g, "").length < 10}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? "Sending OTP..." : "Get Verification OTP"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-xs text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                OTP sent to <strong>+91 {phoneNumber}</strong> via Firebase
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-1">
                6-Digit OTP Code
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-gray-400" />
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={6}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3.5 py-3 text-center text-xl font-bold tracking-widest bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-sm py-3 rounded-xl transition-colors"
            >
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend OTP in{" "}
                  <span className="font-bold text-gray-600">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs text-yellow-600 font-bold hover:underline flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
