import crypto from "crypto";

/**
 * CashALL Centralized Meta Conversions API (CAPI) Client
 *
 * Sends server-side business events directly to Meta Graph API.
 * Uses SHA-256 for all PII hashing according to Meta's strict privacy rules.
 *
 * Environment variables:
 * - META_PIXEL_ID (default: 1037780558881291)
 * - META_CONVERSIONS_API_ACCESS_TOKEN (server-side secret)
 * - META_TEST_EVENT_CODE (optional for Meta Events Manager test console)
 */

const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";
const DEFAULT_PIXEL_ID = "1037780558881291";

export interface ServerUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

export interface ServerCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  order_number?: string;
  pincode?: string;
  city?: string;
  pickup_date?: string;
  pickup_time_slot?: string;
  status?: string;
  [key: string]: any;
}

export interface MetaServerEventOptions {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userData?: ServerUserData;
  customData?: ServerCustomData;
}

/**
 * Hash a string using SHA-256 according to Meta's formatting guidelines.
 */
function hashSha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Normalize and hash phone number (E.164 without leading plus).
 * For 10-digit Indian numbers, prepends 91.
 */
function hashPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

/**
 * Build Meta user_data object with normalized, hashed parameters.
 */
function buildUserData(user: ServerUserData = {}) {
  const data: Record<string, any> = {};

  if (user.clientIpAddress) {
    data.client_ip_address = user.clientIpAddress;
  }
  if (user.clientUserAgent) {
    data.client_user_agent = user.clientUserAgent;
  }
  if (user.email && user.email.includes("@")) {
    data.em = [hashSha256(user.email)];
  }
  if (user.phone) {
    const cleaned = user.phone.replace(/\D/g, "");
    if (cleaned.length >= 10) {
      data.ph = [hashPhone(user.phone)];
    }
  }
  if (user.firstName) {
    data.fn = [hashSha256(user.firstName)];
  }
  if (user.lastName) {
    data.ln = [hashSha256(user.lastName)];
  }
  if (user.city) {
    data.ct = [hashSha256(user.city)];
  }
  if (user.state) {
    data.st = [hashSha256(user.state)];
  }
  if (user.pincode) {
    data.zp = [hashSha256(user.pincode)];
  }
  if (user.fbp) {
    data.fbp = user.fbp;
  }
  if (user.fbc) {
    data.fbc = user.fbc;
  }

  return data;
}

/**
 * Dispatch an event to Meta Conversions API.
 * Never throws an error or interrupts the calling business logic.
 */
export async function sendMetaServerEvent(
  options: MetaServerEventOptions
): Promise<{ success: boolean; data?: any; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;

  if (!accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[MetaCAPI] META_CONVERSIONS_API_ACCESS_TOKEN is not configured. Server event dropped:",
        options.eventName
      );
    }
    return { success: false, error: "Missing META_CONVERSIONS_API_ACCESS_TOKEN" };
  }

  const endpoint = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}/events`;

  const payloadData: Record<string, any> = {
    event_name: options.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: options.eventId,
    event_source_url: options.eventSourceUrl || "https://www.cashall.in/checkout/pickup",
    action_source: "website",
    user_data: buildUserData(options.userData),
    custom_data: options.customData || {},
  };

  const requestBody: Record<string, any> = {
    data: [payloadData],
  };

  // Support Meta Events Manager Test Events Tab
  const testCode = process.env.META_TEST_EVENT_CODE;
  if (testCode) {
    requestBody.test_event_code = testCode;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[MetaCAPI] Meta Graph API error:", {
        status: response.status,
        result,
        eventName: options.eventName,
        eventId: options.eventId,
      });
      return { success: false, error: result?.error?.message || `HTTP ${response.status}` };
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `%c[MetaCAPI] Delivered: ${options.eventName}`,
        "color: #10b981; font-weight: bold;",
        { eventId: options.eventId, eventsReceived: result?.events_received }
      );
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[MetaCAPI] Network / Dispatch error:", error?.message || error);
    return { success: false, error: error?.message || "Unknown CAPI error" };
  }
}

/**
 * Helper to extract client IP and User Agent from NextRequest headers and cookies.
 */
export function extractClientMetadata(req: {
  headers: { get: (key: string) => string | null };
  cookies?: { get: (key: string) => { value: string } | undefined };
}): { clientIpAddress: string | null; clientUserAgent: string | null; fbp: string | null; fbc: string | null } {
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIpAddress = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip");
  const clientUserAgent = req.headers.get("user-agent");
  const fbp = req.cookies?.get("_fbp")?.value || null;
  const fbc = req.cookies?.get("_fbc")?.value || null;

  return { clientIpAddress, clientUserAgent, fbp, fbc };
}

/**
 * Dispatch Server Lead event.
 */
export async function sendServerLeadEvent(params: {
  orderNumber: string;
  value: number;
  contentName: string;
  userData: ServerUserData;
  eventSourceUrl?: string;
}) {
  return sendMetaServerEvent({
    eventName: "Lead",
    eventId: `lead_${params.orderNumber}`,
    eventSourceUrl: params.eventSourceUrl,
    userData: params.userData,
    customData: {
      currency: "INR",
      value: params.value,
      content_name: params.contentName,
      order_number: params.orderNumber,
    },
  });
}

/**
 * Dispatch Server Schedule event.
 */
export async function sendServerScheduleEvent(params: {
  orderNumber: string;
  value: number;
  contentName: string;
  pickupDate: string;
  pickupTimeSlot: string;
  userData: ServerUserData;
  eventSourceUrl?: string;
}) {
  return sendMetaServerEvent({
    eventName: "Schedule",
    eventId: `schedule_${params.orderNumber}`,
    eventSourceUrl: params.eventSourceUrl,
    userData: params.userData,
    customData: {
      currency: "INR",
      value: params.value,
      content_name: params.contentName,
      order_number: params.orderNumber,
      pickup_date: params.pickupDate,
      pickup_time_slot: params.pickupTimeSlot,
    },
  });
}

/**
 * Dispatch Server PickupBooked event (THE PRIMARY FINAL CONVERSION).
 */
export async function sendServerPickupBookedEvent(params: {
  orderNumber: string;
  value: number;
  contentName: string;
  contentCategory?: string;
  pincode: string;
  city: string;
  pickupDate: string;
  pickupTimeSlot: string;
  userData: ServerUserData;
  eventSourceUrl?: string;
}) {
  return sendMetaServerEvent({
    eventName: "PickupBooked",
    eventId: `pickup_${params.orderNumber}`,
    eventSourceUrl: params.eventSourceUrl,
    userData: params.userData,
    customData: {
      currency: "INR",
      value: params.value,
      content_name: params.contentName,
      content_category: params.contentCategory || "DEVICE",
      order_number: params.orderNumber,
      pincode: params.pincode,
      city: params.city,
      pickup_date: params.pickupDate,
      pickup_time_slot: params.pickupTimeSlot,
    },
  });
}

/**
 * Dispatch Server OfferAccepted event.
 */
export async function sendServerOfferAcceptedEvent(params: {
  orderId: string;
  orderNumber: string;
  value: number;
  userData: ServerUserData;
  eventSourceUrl?: string;
}) {
  return sendMetaServerEvent({
    eventName: "OfferAccepted",
    eventId: `offer_accept_${params.orderId}`,
    eventSourceUrl: params.eventSourceUrl,
    userData: params.userData,
    customData: {
      currency: "INR",
      value: params.value,
      order_id: params.orderId,
      order_number: params.orderNumber,
    },
  });
}
