"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  Calculator,
  FileText,
  ShoppingBag,
  UserCheck,
  BarChart3,
  ClipboardCheck,
  Truck,
  MapPin,
  Users,
  LogOut,
  Headset,
  Receipt,
  Menu,
  X,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("support@cashall.in");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("cashall_admin_session");
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed?.email) {
            setAdminEmail(parsed.email);
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cashall_admin_session");
    }
    router.replace("/admin/login");
  };

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Device Catalog", href: "/admin/catalog", icon: Smartphone },
    { label: "Pricing Rules Matrix", href: "/admin/pricing", icon: Calculator },
    { label: "Quotes Repository", href: "/admin/quotes", icon: FileText },
    { label: "Order Management", href: "/admin/orders", icon: ShoppingBag },
    { label: "Agent Management", href: "/admin/agents", icon: UserCheck },
    { label: "Support Team Management", href: "/admin/support", icon: Headset },
    { label: "Transaction Audit Ledger", href: "/admin/ledger", icon: Receipt },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "Physical Inspections", href: "/admin/inspections", icon: ClipboardCheck },
    { label: "Service Areas (PINs)", href: "/admin/service-areas", icon: MapPin },
  ];

  const currentNav = navItems.find((item) => item.href === pathname) || navItems[0];

  return (
    <>
      {/* MOBILE STICKY TOP BAR (SHOWN ONLY ON SCREENS < LG) */}
      <div className="lg:hidden sticky top-0 z-40 bg-brand-black text-white border-b border-neutral-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-brand-yellow hover:bg-neutral-800 focus:outline-none transition-colors"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CashALL Logo" width={110} height={30} className="h-6 w-auto object-contain" priority />
            <span className="bg-brand-yellow/20 text-brand-yellow text-[9px] font-extrabold px-2 py-0.5 rounded">
              ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300 truncate max-w-[120px]">
            {currentNav.label}
          </span>
          <button
            onClick={handleLogout}
            title="Exit Admin"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-brand-black border-r border-neutral-800 flex flex-col justify-between p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* DRAWER HEADER */}
              <div className="pb-4 mb-4 border-b border-neutral-800 flex items-center justify-between">
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <Image src="/logo.png" alt="CashALL Logo" width={120} height={32} className="h-7 w-auto object-contain" priority />
                  <span className="bg-brand-yellow/20 text-brand-yellow text-[9px] font-extrabold px-2 py-0.5 rounded">
                    ADMIN
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWER NAV LINKS */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-brand-yellow text-brand-black shadow-yellowGlow"
                          : "text-gray-400 hover:text-white hover:bg-neutral-800/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-black" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* DRAWER FOOTER */}
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <div className="truncate text-xs">
                <div className="font-bold text-white">Operator Console</div>
                <div className="text-[10px] text-gray-400">{adminEmail}</div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-900 hover:bg-red-950/60 hover:text-red-400 text-gray-300 text-xs font-bold rounded-xl border border-neutral-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (SHOWN ON SCREENS >= LG) */}
      <aside className="hidden lg:flex w-64 bg-brand-black text-gray-300 border-r border-neutral-800 flex-col justify-between shrink-0 min-h-screen">
        <div>
          {/* LOGO */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-2">
            <Link href="/admin" className="flex items-center">
              <Image src="/logo.png" alt="CashALL Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
            </Link>
            <span className="bg-brand-yellow/20 text-brand-yellow text-[9px] font-extrabold px-2 py-0.5 rounded shrink-0">
              ADMIN
            </span>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-brand-yellow text-brand-black shadow-yellowGlow"
                      : "text-gray-400 hover:text-white hover:bg-neutral-800/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-black" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER USER INFO & LOGOUT */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">
              <div className="font-bold text-white">Operator Console</div>
              <div className="text-[10px] text-gray-400">{adminEmail}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-red-950/60 hover:text-red-400 text-gray-400 text-xs font-bold rounded-xl border border-neutral-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
