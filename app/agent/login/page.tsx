"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserCheck, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AgentLoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError("Please enter your registered agent name, email, or phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/agent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: emailOrPhone.trim(), password }),
      });

      const json = await res.json();

      if (json.success && json.agent) {
        localStorage.setItem(
          "cashall_agent_session",
          JSON.stringify({
            token: json.token,
            agent: json.agent,
            loggedInAt: new Date().toISOString(),
          })
        );
        router.replace("/agent/dashboard");
      } else {
        setError(json.error || "Authentication failed. Please check your agent credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* LOGO & TITLE HEADER */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="CashALL Logo"
              width={160}
              height={44}
              className="h-10 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Field Agent Logistics Portal</span>
          </div>
          <h1 className="text-2xl font-black text-white font-price tracking-wide">
            Agent Sign In
          </h1>
          <p className="text-xs text-neutral-400">
            Access assigned doorstep pickups, verify devices, and process instant customer UPI payouts.
          </p>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-8 rounded-3xl shadow-2xl space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-300 text-xs p-4 rounded-2xl font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* NAME, EMAIL OR PHONE */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Agent Name, Email or Mobile Number
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. SANGEET SHAW, 7003216788 or agent@cashall.in"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-yellow-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-yellow-400 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm py-3.5 rounded-xl transition shadow-yellowGlow disabled:opacity-60 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>Access Agent Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-neutral-500">
          CashALL | AARNA ENTERPRISE • Field Agent Console
        </div>
      </div>
    </div>
  );
}
