"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AD_SLIDES = [
  {
    id: 1,
    image: "/photos/advertise1.jpeg",
    alt: "CashALL Best Price Guarantee - Old Devices Real Value Instant Cash",
  },
  {
    id: 2,
    image: "/photos/advertise2.jpeg",
    alt: "CashALL Instant Doorstep Cash - Old Devices Sitting Idle Turn Them Into Cash",
  },
];

export function AdCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // AUTO SIDE-SCROLLING EFFECT (3s INTERVAL)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AD_SLIDES.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? AD_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % AD_SLIDES.length);
  };

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
    <div className="w-full max-w-5xl mx-auto my-6 px-2 sm:px-4">
      {/* FULLY VISIBLE ADVERTISEMENT CAROUSEL CONTAINER */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-brand-yellow/50 bg-black shadow-yellowGlow group"
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
            <div
              key={slide.id}
              className="w-full flex-shrink-0 relative aspect-[16/8] sm:aspect-[21/9] max-h-[380px] bg-black flex items-center justify-center"
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-contain object-center"
                priority={slide.id === 1}
              />
            </div>
          ))}
        </div>

        {/* PREV / NEXT BUTTONS */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 border border-brand-yellow/40 text-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors opacity-80 group-hover:opacity-100 shadow-md"
          aria-label="Previous advertisement"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 border border-brand-yellow/40 text-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors opacity-80 group-hover:opacity-100 shadow-md"
          aria-label="Next advertisement"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* NAVIGATION DOTS */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/60 px-3 py-1 rounded-full border border-neutral-800">
          {AD_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "w-7 bg-brand-yellow"
                  : "w-2 bg-gray-500 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
