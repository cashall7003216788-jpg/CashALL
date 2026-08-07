"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  Calculator,
  FileText,
  ShoppingBag,
  ClipboardCheck,
  Truck,
  MapPin,
  Users,
  LogOut,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cashall_admin_session");
    }
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Device Catalog", href: "/admin/catalog", icon: Smartphone },
    { label: "Pricing Rules Matrix", href: "/admin/pricing", icon: Calculator },
    { label: "Quotes Repository", href: "/admin/quotes", icon: FileText },
    { label: "Order Management", href: "/admin/orders", icon: ShoppingBag },
    { label: "Physical Inspections", href: "/admin/inspections", icon: ClipboardCheck },
    { label: "Pickup Dispatcher", href: "/admin/pickups", icon: Truck },
    { label: "Service Areas (PINs)", href: "/admin/service-areas", icon: MapPin },
  ];

  return (
    <aside className="w-64 bg-brand-black text-gray-300 border-r border-neutral-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* LOGO */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <Link href="/admin" className="relative h-9 w-36 block">
            <Image src="/logo.png" alt="CashALL Logo" width={140} height={40} className="object-contain" priority />
          </Link>
          <span className="bg-brand-yellow/20 text-brand-yellow text-[9px] font-extrabold px-1.5 py-0.5 rounded">
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
            <div className="text-[10px] text-gray-400">admin@cashall.in</div>
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
  );
}
