"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    if (typeof window !== "undefined") {
      const session = localStorage.getItem("cashall_admin_session");
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed && (parsed.role === "ADMIN" || parsed.email)) {
            setIsAuthenticated(true);
            setCheckingAuth(false);
            return;
          }
        } catch (e) {
          console.error("Invalid admin session token", e);
        }
      }

      // Not authenticated -> Redirect to admin login page
      setIsAuthenticated(false);
      setCheckingAuth(false);
      router.replace("/admin/login");
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-brand-yellow animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <ShieldCheck className="w-12 h-12 text-brand-yellow" />
        <h1 className="text-xl font-extrabold">Access Restricted</h1>
        <p className="text-xs text-gray-400 max-w-sm">
          You must log in with authorized admin credentials to access the CashALL Operations Portal.
        </p>
        <button
          onClick={() => router.replace("/admin/login")}
          className="mt-2 bg-brand-yellow text-black font-extrabold text-xs px-6 py-2.5 rounded-xl border border-black hover:bg-yellow-400 transition-all"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
