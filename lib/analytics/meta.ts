/**
 * CashALL Centralized Meta Pixel Analytics Client
 *
 * Provides SSR-safe, browser-safe, and deduplicated event tracking
 * using the official Meta Pixel JavaScript interface (`window.fbq`).
 *
 * Pixel ID: 1037780558881291 (Initialized globally in app/layout.tsx)
 */

declare global {
  interface Window {
    fbq?: ((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: any;
  }
}

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "InitiateCheckout"
  | "Lead"
  | "Schedule"
  | "CompleteRegistration"
  | "Contact";

export type MetaCustomEvent =
  | "PickupBooked"
  | "QuoteGenerated"
  | "AssessmentStarted"
  | "AssessmentCompleted"
  | "ServiceabilityChecked"
  | "OfferAccepted";

export interface MetaEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  search_string?: string;
  status?: string;
  method?: string;
  num_items?: number;
  order_number?: string;
  quote_id?: string;
  brand?: string;
  model?: string;
  storage?: string;
  pincode?: string;
  city?: string;
  state?: string;
  serviceable?: boolean;
  pickup_date?: string;
  pickup_time_slot?: string;
  [key: string]: any;
}

export interface MetaEventOptions {
  eventId?: string;
  deduplicate?: boolean;
}

// In-memory set for deduplicating events in the current page lifecycle
const emittedEvents = new Set<string>();

/**
 * Check whether an event has already been tracked to prevent duplicate emissions
 * from React Strict Mode, component re-renders, or rapid double clicks.
 */
function isDuplicate(eventName: string, eventId?: string): boolean {
  if (!eventId) return false;

  const key = `${eventName}::${eventId}`;
  if (emittedEvents.has(key)) {
    return true;
  }

  // Also check sessionStorage to prevent duplicate emissions on page reloads
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const storageKey = `cashall_tracked_${key}`;
      if (sessionStorage.getItem(storageKey)) {
        emittedEvents.add(key);
        return true;
      }
    } catch {
      // Ignore storage access restrictions
    }
  }

  return false;
}

/**
 * Mark an event as emitted in the deduplication caches.
 */
function markEmitted(eventName: string, eventId?: string): void {
  if (!eventId) return;

  const key = `${eventName}::${eventId}`;
  emittedEvents.add(key);

  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const storageKey = `cashall_tracked_${key}`;
      sessionStorage.setItem(storageKey, Date.now().toString());
    } catch {
      // Ignore storage access restrictions
    }
  }
}

/**
 * Low-level safe dispatcher for Meta Pixel calls.
 */
export function trackMetaEvent(
  trackType: "track" | "trackCustom",
  eventName: string,
  params: MetaEventParams = {},
  options: MetaEventOptions = {}
): void {
  if (typeof window === "undefined") {
    return;
  }

  const { eventId, deduplicate = true } = options;

  if (deduplicate && isDuplicate(eventName, eventId)) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `%c[MetaPixel] Deduplicated (skipped): ${eventName}`,
        "color: #9ca3af; font-weight: bold;",
        { eventId, params }
      );
    }
    return;
  }

  try {
    if (typeof window.fbq === "function") {
      if (eventId) {
        window.fbq(trackType, eventName, params, { eventID: eventId });
      } else {
        window.fbq(trackType, eventName, params);
      }

      if (eventId) {
        markEmitted(eventName, eventId);
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `%c[MetaPixel] ${trackType === "trackCustom" ? "Custom" : "Standard"}: ${eventName}`,
          "color: #3b82f6; font-weight: bold;",
          { eventId, params }
        );
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[MetaPixel] window.fbq is unavailable. Event queued/dropped: ${eventName}`,
          params
        );
      }
    }
  } catch (error) {
    // Analytics must never throw or break customer checkout
    console.error(`[MetaPixel] Error tracking ${eventName}:`, error);
  }
}

/**
 * Track a standard Meta event (e.g., ViewContent, Lead, Schedule, InitiateCheckout).
 */
export function trackMetaStandardEvent(
  eventName: MetaStandardEvent,
  params: MetaEventParams = {},
  options: MetaEventOptions = {}
): void {
  trackMetaEvent("track", eventName, params, options);
}

/**
 * Track a custom Meta event (e.g., PickupBooked, QuoteGenerated, AssessmentStarted).
 */
export function trackMetaCustomEvent(
  eventName: MetaCustomEvent,
  params: MetaEventParams = {},
  options: MetaEventOptions = {}
): void {
  trackMetaEvent("trackCustom", eventName, params, options);
}

/**
 * Track PageView.
 */
export function trackMetaPageView(
  params: MetaEventParams = {},
  options: MetaEventOptions = {}
): void {
  trackMetaEvent("track", "PageView", params, options);
}
