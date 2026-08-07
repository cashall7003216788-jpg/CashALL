"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Menu, X, User, ChevronDown, Headphones, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeviceChoiceModal } from "@/components/common/DeviceChoiceModal";
import { CustomerAuthModal } from "@/components/common/CustomerAuthModal";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("New Delhi");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [deviceChoiceOpen, setDeviceChoiceOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("cashall_user");
      if (u) {
        try {
          setUser(JSON.parse(u));
        } catch (e) {}
      }
    }
  }, [authModalOpen]);

  const cities = ["New Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Pune", "Ahmedabad"];

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-black text-white border-b border-brand-dark shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* LOGO (Official Supplied Logo Asset) */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative h-12 w-36 sm:w-44 flex items-center justify-start overflow-hidden py-1">
                  <Image
                    src="/logo.png"
                    alt="CashALL Logo"
                    width={180}
                    height={50}
                    className="object-contain object-left h-full w-auto"
                    priority
                  />
                </div>
              </Link>

              {/* LOCATION SELECTOR */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-dark/80 border border-neutral-800 text-xs font-medium text-gray-300 hover:text-white hover:border-brand-yellow/50 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {locationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-brand-dark border border-neutral-800 rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Select Your City
                    </div>
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-800 transition-colors ${
                          selectedCity === city ? "text-brand-yellow font-bold" : "text-gray-300"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-gray-300">
              <button onClick={() => setDeviceChoiceOpen(true)} className="hover:text-brand-yellow transition-colors font-bold text-white">
                Sell Device
              </button>
              <Link href="/sell/mobile" className="hover:text-brand-yellow transition-colors">
                Sell Phone
              </Link>
              <Link href="/sell/laptop" className="hover:text-brand-yellow transition-colors">
                Sell Laptop
              </Link>
              <Link href="/#how-it-works" className="hover:text-brand-yellow transition-colors">
                How It Works
              </Link>
              <Link href="/bulk-sell" className="hover:text-brand-yellow transition-colors">
                Bulk Sell
              </Link>
              <Link href="/faq" className="hover:text-brand-yellow transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="hover:text-brand-yellow transition-colors flex items-center gap-1.5 text-brand-yellow font-bold bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
                <Headphones className="w-4 h-4 text-brand-yellow" />
                <span>Support</span>
              </Link>
            </nav>

            {/* RIGHT ACTION BUTTONS */}
            <div className="hidden sm:flex items-center space-x-3">
              {user ? (
                <Link href="/account" className="flex items-center gap-1.5 text-xs font-semibold text-brand-yellow hover:text-white px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 transition-colors">
                  <User className="w-4 h-4 text-brand-yellow" />
                  <span>{user.name || "My Orders"}</span>
                </Link>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-200 hover:text-brand-yellow px-3 py-2 rounded-lg hover:bg-neutral-800/80 border border-neutral-800 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-brand-yellow" />
                  <span>Customer Login</span>
                </button>
              )}

              <Link href="/account" className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-neutral-800/60 transition-colors">
                <User className="w-4 h-4 text-brand-yellow" />
                <span>My Orders</span>
              </Link>

              <Button
                onClick={() => setDeviceChoiceOpen(true)}
                variant="primary"
                size="md"
                className="font-extrabold tracking-wide shadow-yellowGlow"
              >
                SELL NOW
              </Button>
            </div>

            {/* MOBILE MENU TRIGGER */}
            <div className="flex sm:hidden items-center space-x-3">
              <Button
                onClick={() => setDeviceChoiceOpen(true)}
                variant="primary"
                size="sm"
                className="font-bold text-xs shadow-yellowGlow"
              >
                SELL NOW
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white rounded-lg focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-brand-black border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
              <MapPin className="w-4 h-4 text-brand-yellow" />
              <span className="text-xs text-gray-400">Location:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-neutral-800 text-white text-xs rounded px-2 py-1 focus:outline-none"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

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

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setDeviceChoiceOpen(true);
              }}
              className="block w-full text-left py-2 text-base font-bold text-white hover:text-brand-yellow"
            >
              Sell Device (Phone or Laptop)
            </button>
            <Link
              href="/sell/mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-white hover:text-brand-yellow"
            >
              Sell Phone
            </Link>
            <Link
              href="/sell/laptop"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-white hover:text-brand-yellow"
            >
              Sell Laptop
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-bold text-brand-yellow flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Customer Support</span>
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-300 hover:text-brand-yellow"
            >
              How It Works
            </Link>
            <Link
              href="/bulk-sell"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-300 hover:text-brand-yellow"
            >
              Bulk Sell
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-300 hover:text-brand-yellow"
            >
              FAQ
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-300 hover:text-brand-yellow"
            >
              My Orders / Account
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-semibold text-gray-400 hover:text-brand-yellow"
            >
              Operator Admin Login
            </Link>
          </div>
        )}
      </header>

      {/* DEVICE CHOICE SELECTION MODAL */}
      <DeviceChoiceModal
        isOpen={deviceChoiceOpen}
        onClose={() => setDeviceChoiceOpen(false)}
      />

      {/* CUSTOMER AUTHENTICATION & LOGIN MODAL */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
