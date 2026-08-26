"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Menu, X, User, ChevronDown, HelpCircle, LogIn, LogOut, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeviceChoiceModal } from "@/components/common/DeviceChoiceModal";
import { CustomerAuthModal } from "@/components/common/CustomerAuthModal";
import { LocationModal } from "@/components/common/LocationModal";
import { NeedHelpModal } from "@/components/common/NeedHelpModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getCartQuotes, CART_UPDATED_EVENT } from "@/lib/cart";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [needHelpModalOpen, setNeedHelpModalOpen] = useState(false);
  const [deviceChoiceOpen, setDeviceChoiceOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; state: string } | null>(null);
  
  const [user, setUser] = useState<{ name?: string; phone?: string; email?: string } | null>(null);

  useEffect(() => {
    const updateCartCount = () => {
      const quotes = getCartQuotes();
      setCartCount(quotes.length);
    };
    updateCartCount();

    if (typeof window !== "undefined") {
      window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
      window.addEventListener("storage", updateCartCount);
      return () => {
        window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
        window.removeEventListener("storage", updateCartCount);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Restore user session
      const storedUser = localStorage.getItem("cashall_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      } else {
        setUser(null);
      }

      // Restore location session
      const storedLoc = localStorage.getItem("cashall_location");
      if (storedLoc) {
        try {
          setSelectedLocation(JSON.parse(storedLoc));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Auto-open Location Modal for new visitors so they fix their location first
        setLocationModalOpen(true);
      }

      // Auto-sync any local storage orders to PostgreSQL database automatically
      try {
        const localAll = JSON.parse(localStorage.getItem("cashall_all_orders") || "[]");
        const latestOrder = localStorage.getItem("cashall_latest_order");
        let ordersToSync = Array.isArray(localAll) ? [...localAll] : [];
        if (latestOrder) {
          try {
            const lo = JSON.parse(latestOrder);
            if (lo?.orderNumber && !ordersToSync.some((o: any) => o.orderNumber === lo.orderNumber)) {
              ordersToSync.push(lo);
            }
          } catch (e) {}
        }
        if (ordersToSync.length > 0) {
          fetch("/api/v1/orders/sync-local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orders: ordersToSync }),
          }).catch((err) => console.warn("Global background auto-sync error:", err));
        }
      } catch (e) {}
    }
  }, [authModalOpen]);

  const handleSelectLocation = (loc: { city: string; state: string }) => {
    setSelectedLocation(loc);
    if (typeof window !== "undefined") {
      localStorage.setItem("cashall_location", JSON.stringify(loc));
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cashall_user");
    }
    setUser(null);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-black text-white border-b border-brand-dark shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* LEFT LOGO & LOCATION */}
            <div className="flex items-center space-x-5 sm:space-x-8">
              
              {/* CASHALL LOGO (MAXIMUM VISIBILITY ENLARGED DISPLAY) */}
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="relative h-16 sm:h-20 w-52 sm:w-64 flex items-center justify-start py-0.5">
                  <Image
                    src="/logo.png"
                    alt="CashALL Logo"
                    width={320}
                    height={90}
                    className="object-contain object-left h-full max-h-16 sm:max-h-20 w-auto transition-transform group-hover:scale-105"
                    priority
                  />
                </div>
              </Link>

              {/* LOCATION SELECTOR BUTTON (HIERARCHICAL FLOW TRIGGER) */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLocationModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-dark/90 border border-neutral-800 text-xs font-semibold text-gray-200 hover:text-white hover:border-brand-yellow/50 transition-all shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                  <span className="truncate max-w-[200px] font-bold text-white">
                    {selectedLocation ? `${selectedLocation.city}, ${selectedLocation.state}` : "Select Location"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                </button>
              </div>

            </div>

            {/* DESKTOP MAIN NAVIGATION */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-gray-300">
              <button
                onClick={() => setDeviceChoiceOpen(true)}
                className="hover:text-brand-yellow transition-colors font-bold text-white"
              >
                Sell Device
              </button>
              <Link href="/sell/mobile" className="hover:text-brand-yellow transition-colors">
                Sell Phone
              </Link>
              <Link href="/sell/laptop" className="hover:text-brand-yellow transition-colors">
                Sell Laptop
              </Link>
              <Link href="/sell/tablet" className="hover:text-brand-yellow transition-colors">
                Sell Tablet
              </Link>
            </nav>

            {/* RIGHT ACTION BUTTONS */}
            <div className="hidden sm:flex items-center space-x-3">
              
              {/* SAVED QUOTES CART BUTTON */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative flex items-center gap-2 text-xs font-bold text-gray-200 hover:text-brand-yellow px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-brand-yellow/40 transition-all shadow-sm"
                title="View Saved Quotes Cart"
              >
                <ShoppingCart className="w-4 h-4 text-brand-yellow" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-brand-yellow text-brand-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* MY ORDERS — ONLY SHOWN IF AUTHENTICATED */}
              {user && (
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-200 hover:text-brand-yellow px-3 py-2 rounded-lg hover:bg-neutral-800/80 border border-neutral-800/80 transition-colors"
                >
                  <User className="w-4 h-4 text-brand-yellow" />
                  <span>My Orders</span>
                </Link>
              )}

              {/* AUTHENTICATION CONTROL */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-yellow px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors"
                  >
                    <span>{user.name || user.phone || "Account"}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-200 hover:text-brand-yellow px-3 py-2 rounded-lg hover:bg-neutral-800/80 border border-neutral-800 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-brand-yellow" />
                  <span>Customer Login</span>
                </button>
              )}

              {/* SELL NOW CTA */}
              <Button
                onClick={() => setDeviceChoiceOpen(true)}
                variant="primary"
                size="md"
                className="font-extrabold tracking-wide shadow-yellowGlow"
              >
                SELL NOW
              </Button>
            </div>

            {/* MOBILE TRIGGER & CTAs */}
            <div className="flex sm:hidden items-center space-x-2">
              {/* MOBILE CART BUTTON */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-brand-yellow text-xs font-bold flex items-center justify-center"
                title="Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-yellow text-brand-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setLocationModalOpen(true)}
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-brand-yellow text-xs font-bold flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="max-w-[85px] truncate">{selectedLocation ? selectedLocation.city : "Location"}</span>
              </button>

              <Button
                onClick={() => setDeviceChoiceOpen(true)}
                variant="primary"
                size="sm"
                className="font-bold text-xs shadow-yellowGlow px-2.5 py-1"
              >
                SELL NOW
              </Button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-gray-300 hover:text-white rounded-lg focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* MOBILE DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-brand-black border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            
            {/* LOCATION SELECTOR MOBILE TRIGGER */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setLocationModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-gray-200"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-yellow" />
                <span>State: {selectedLocation ? selectedLocation.state : "Select State"}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* AUTHENTICATION STATE MOBILE BUTTON */}
            {user ? (
              <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-yellow">
                  <User className="w-4 h-4" />
                  <span>{user.name || user.phone || "Logged In"}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="block w-full text-left py-2 text-base font-bold text-brand-yellow flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Customer Login / Sign In</span>
              </button>
            )}

            {/* MY ORDERS — SHOWN ONLY IF AUTHENTICATED IN MOBILE DRAWER */}
            {user && (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-bold text-brand-yellow flex items-center gap-2 border-b border-neutral-800/60"
              >
                <User className="w-4 h-4" />
                <span>My Orders / Account</span>
              </Link>
            )}

            {/* MAIN NAVIGATION MOBILE LINKS */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setDeviceChoiceOpen(true);
              }}
              className="block w-full text-left py-2 text-base font-bold text-white hover:text-brand-yellow"
            >
              Sell Device (Phone, Laptop or Tablet)
            </button>
            <Link
              href="/sell/mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-gray-200 hover:text-brand-yellow"
            >
              Sell Phone
            </Link>
            <Link
              href="/sell/laptop"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-gray-200 hover:text-brand-yellow"
            >
              Sell Laptop
            </Link>
            <Link
              href="/sell/tablet"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-gray-200 hover:text-brand-yellow"
            >
              Sell Tablet
            </Link>
          </div>
        )}
      </header>

      {/* MODALS */}
      <DeviceChoiceModal
        isOpen={deviceChoiceOpen}
        onClose={() => setDeviceChoiceOpen(false)}
      />

      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
      />

      <NeedHelpModal
        isOpen={needHelpModalOpen}
        onClose={() => setNeedHelpModalOpen(false)}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}
