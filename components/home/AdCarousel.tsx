"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const AD_SLIDES = [
  {
    id: 1,
    image: "/photos/advertise1.jpeg",
    title: "Best Price Guarantee",
    subtitle: "Get maximum cash value for your used mobile phone & laptop",
  },
  {
    id: 2,
    image: "/photos/advertise2.jpeg",
    title: "Fast & Free Doorstep Pickup",
    subtitle: "Express logistics agent arrives right at your home or office",
  },
  {
    id: 3,
    image: "/photos/adverise3.png",
    title: "100% Instant Payment",
    subtitle: "Direct UPI or IMPS bank transfer immediately upon physical inspection",
  },
  {
    id: 4,
    image: "/photos/advertise4.png",
    title: "Transparent & Zero Deductions",
    subtitle: "No hidden charges, zero doorstep convenience fee, transparent inspection",
  },
];

export function AdCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // AUTO SIDE SCROLL EFFECT (3.5s INTERVAL)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AD_SLIDES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? AD_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % AD_SLIDES.length);
  };

  // TOUCH SWIPE HANDLERS FOR MOBILE
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-yellow" />
          <h3 className="text-xl font-extrabold text-brand-black">Official Offers & Highlights</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-white border border-brand-border text-brand-black hover:bg-brand-yellow hover:border-brand-yellow transition-colors shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white border border-brand-border text-brand-black hover:bg-brand-yellow hover:border-brand-yellow transition-colors shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AUTO SIDE-SCROLLING CONTAINER */}
      <div
        className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-brand-black shadow-2xl group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {AD_SLIDES.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 relative aspect-[16/7] sm:aspect-[21/8] max-h-[420px] bg-neutral-900">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-center"
                priority={slide.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/30 to-transparent flex items-end p-6 sm:p-10">
                <div className="max-w-xl space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-yellow text-brand-black text-[10px] font-extrabold tracking-wider uppercase mb-1">
                    CashALL Exclusive
                  </span>
                  <h4 className="text-xl sm:text-3xl font-black text-white leading-tight">
                    {slide.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium line-clamp-2">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NAVIGATION DOTS */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
          {AD_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "w-8 bg-brand-yellow"
                  : "w-2 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
