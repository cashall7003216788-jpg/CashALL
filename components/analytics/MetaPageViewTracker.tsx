"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaPageView } from "@/lib/analytics/meta";

/**
 * MetaPageViewTracker
 *
 * Listens for soft client-side route transitions in Next.js App Router.
 * Skips the initial page mount because the inline Meta Pixel script in
 * app/layout.tsx already fires the initial PageView event on hard load.
 *
 * This ensures exactly ONE PageView per page visit without duplication.
 */
export function MetaPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip the initial mount to prevent duplicate PageView with layout.tsx script
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const searchString = searchParams?.toString();
    const url = searchString ? `${pathname}?${searchString}` : pathname;

    trackMetaPageView({
      page_path: url,
      page_title: typeof document !== "undefined" ? document.title : "",
    });
  }, [pathname, searchParams]);

  return null;
}
