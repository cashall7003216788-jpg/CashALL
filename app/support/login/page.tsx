"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Headset, Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function SupportLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your Support User Name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/support/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "cashall_support_session",
            JSON.stringify({
              token: data.token,
              supportUser: data.supportUser,
              loggedInAt: new Date().toISOString(),
            })
          );
        }
        router.replace("/support/dashboard");
      } else {
        setError(data.error || "Invalid Support user name or password.");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid Support user name or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* LOGO & HEADER */}
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Headset className="w-3.5 h-3.5" />
            <span>Customer & Agent Support Console</span>
          </div>
          <h1 className="text-xl font-black text-white font-price tracking-wide">
            Support Team Sign In
          </h1>
          <p className="text-xs text-neutral-400">
            Access quote leads, follow up with customers, and assist field agents.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">Support User Name or Phone</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3.5 text-neutral-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter User Name, Phone, or Email"
                autoComplete="off"
                required
                className="w-full pl-10 pr-3 py-3 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-10 py-3 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-neutral-500 hover:text-yellow-400 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            className="font-black text-sm py-3.5 shadow-yellowGlow mt-2"
          >
            {loading ? "Authenticating..." : "ACCESS SUPPORT PORTAL"}
          </Button>
        </form>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-800">
          Need Help? <a href="mailto:support@cashall.in" className="text-yellow-400 underline hover:text-yellow-300">support@cashall.in</a>
        </div>
      </div>
    </div>
  );
}
