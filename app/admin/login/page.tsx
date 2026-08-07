"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@cashall.in");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (email === "admin@cashall.in" && password === "admin123") {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "cashall_admin_session",
            JSON.stringify({ email, role: "ADMIN", token: "tok_admin_9842" })
          );
        }
        router.push("/admin");
      } else {
        setLoading(false);
        setError("Invalid admin credentials. Use demo: admin@cashall.in / admin123");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* LOGO */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center py-2">
            <Image
              src="/logo.png"
              alt="CashALL Logo"
              width={160}
              height={44}
              className="h-10 w-auto object-contain mx-auto"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operations & Pricing Admin</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Operator Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-brand-yellow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Operator Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-brand-yellow"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            className="font-extrabold text-sm py-3 shadow-yellowGlow"
          >
            {loading ? "Authenticating Operator..." : "LOG IN TO ADMIN PORTAL"}
          </Button>
        </form>

        <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700 text-[11px] text-gray-400 text-center">
          Demo Admin Credentials: <strong className="text-brand-yellow">admin@cashall.in</strong> / <strong className="text-brand-yellow">admin123</strong>
        </div>

      </div>
    </div>
  );
}
