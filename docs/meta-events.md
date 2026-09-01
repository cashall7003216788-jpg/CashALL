# CashALL Meta Pixel & Conversions API (CAPI) Registry

**Pixel ID**: `1037780558881291`  
**Production Domain**: `https://www.cashall.in`  
**API Version**: Meta Graph API `v20.0`  
**Architecture**: Dual Client-Side (Meta Pixel Browser SDK) + Server-Side (Meta Conversions API) with strict event deduplication.

---

## 1. CRITICAL BUSINESS MODEL NOTICE

### Why CashALL Does NOT Use the "Purchase" Event
CashALL is a **device buyback and trade-in platform**, NOT an e-commerce retail store.
- **Customers do not purchase anything on CashALL.**
- Customers **sell** their pre-owned smartphones, laptops, and tablets to CashALL.
- CashALL **pays out money to the customer** via UPI / IMPS / Cash after physical verification at their doorstep.
- The estimated valuation shown to the customer is the **buyout price paid to them**, NOT customer spending.

> [!CAUTION]
> **DO NOT USE META'S STANDARD "Purchase" EVENT** anywhere in the CashALL customer funnel. Using `Purchase` would falsely train Meta's ad delivery algorithm to target people who buy products rather than people who want to liquidate used electronics for cash.

### The Primary Final Conversion: `PickupBooked`
The actual and ultimate conversion occurs when a customer:
1. Completes their device condition assessment.
2. Accepts their instant cash quote.
3. Fills out their doorstep pickup address, selects a date and time slot.
4. Submits the form and the backend order creation API (`/api/v1/orders/create`) returns success with an order number (e.g. `CA36738`).

**Primary Event Name**: `PickupBooked`  
**Secondary Funnel Support**: `Lead`, `Schedule`

---

## 2. Event Registry & Funnel Flow

| # | Event Name | Type | Channel | Trigger Description | Parameters Sent | Deduplication ID (`eventID` / `event_id`) |
|---|------------|------|---------|---------------------|-----------------|-------------------------------------------|
| 1 | `PageView` | Standard | Browser | Loaded in `app/layout.tsx` + route transitions tracked via `MetaPageViewTracker` | `page_path` | Meta internal session deduplication |
| 2 | `Search` | Standard | Browser | User searches or selects a device in `DeviceSearch` or brand model filter | `search_string`, `content_name`, `content_category` | `search_<query>` |
| 3 | `ViewContent` | Standard | Browser | Customer views a specific model selection page (`/sell/[category]/[brand]/[model]`) | `content_name`, `content_category`, `brand`, `model`, `value`, `currency: 'INR'` | `view_<category>_<brand>_<model>` |
| 4 | `AssessmentStarted` | Custom | Browser | Customer enters step 1 of device condition questionnaire (`/assess`) | `content_name`, `content_category`, `brand`, `model`, `storage` | `assess_start_<variantId>` |
| 5 | `AssessmentCompleted` | Custom | Browser | Customer finishes all condition questions (reaches step 5 review) | `content_name`, `content_category`, `brand`, `model`, `estimated_value`, `currency: 'INR'` | `assess_done_<variantId>` |
| 6 | `QuoteGenerated` | Custom | Browser | Customer unlocks their valuation and a quote ID is generated | `quote_id`, `content_name`, `content_category`, `brand`, `model`, `value`, `currency: 'INR'` | `quote_<quoteNumber>` |
| 7 | `AddToCart` | Standard | Browser | Generated quote is saved into the customer's cart drawer for checkout | `content_type: 'product'`, `content_name`, `content_ids`, `value`, `currency: 'INR'` | `cart_<quoteNumber>` |
| 8 | `CompleteRegistration` | Standard | Browser | Customer inputs valid 10-digit mobile number and authenticates via OTP / instant login | `status: 'success'`, `method: 'phone'` | `reg_<phoneNumber>` |
| 9 | `InitiateCheckout` | Standard | Browser | Customer clicks "SCHEDULE FAST PICKUP" on `/quote/[id]` or loads `/checkout/pickup` | `content_name`, `value`, `currency: 'INR'`, `num_items: 1` | `init_checkout_<quoteId>` |
| 10 | `ServiceabilityChecked` | Custom | Browser | Customer enters 6-digit PIN code to check doorstep pickup serviceability | `pincode`, `serviceable: boolean`, `city`, `state` | `serviceability_<pincode>` |
| 11 | `Lead` | Standard | **Browser + Server (CAPI)** | Doorstep pickup order is successfully placed and verified by API | `value`, `currency: 'INR'`, `content_name`, `order_number` | `lead_<orderNumber>` |
| 12 | `Schedule` | Standard | **Browser + Server (CAPI)** | Doorstep pickup order is scheduled with a verified pickup date & time slot | `value`, `currency: 'INR'`, `content_name`, `order_number`, `pickup_date`, `pickup_time_slot` | `schedule_<orderNumber>` |
| 13 | **`PickupBooked`** | **Custom (PRIMARY)** | **Browser + Server (CAPI)** | **Final Doorstep Pickup Confirmed** (Order saved in PostgreSQL DB, order number assigned) | `order_number`, `content_name`, `content_category`, `value`, `currency: 'INR'`, `pincode`, `city`, `pickup_date`, `pickup_time_slot` | **`pickup_<orderNumber>`** |
| 14 | `OfferAccepted` | Custom | **Browser + Server (CAPI)** | Customer accepts a revised buyout valuation on order tracking page (`/track/[id]`) | `order_number`, `value`, `currency: 'INR'` | `offer_accept_<orderId>` |
| 15 | `Contact` | Standard | Browser | Customer clicks WhatsApp Live Chat, Phone Call Hotline, or submits contact form | `content_name: 'WhatsApp' \| 'Phone Call' \| 'Contact Form'` | `contact_<channel>_<source>` |

---

## 3. Deduplication Architecture (Browser Pixel + Server CAPI)

To guarantee 100% data fidelity without double-counting, every dual-emitted event uses a deterministic `eventID` shared between browser and server:

```
+-------------------+                    +--------------------+
|  Browser Pixel    |                    |  Server CAPI       |
|  fbq('trackCustom'|                    |  POST graph.fb.com |
|  'PickupBooked',  |                    |  'PickupBooked',   |
|  eventID:         |                    |  event_id:         |
|  'pickup_CA36738')|                    |  'pickup_CA36738') |
+---------+---------+                    +---------+----------+
          |                                        |
          +----------------> META <----------------+
                       (Deduplicates
                    within 48-hour window)
```

### Deduplication ID Format
- **PickupBooked**: `pickup_${orderNumber}` (e.g. `pickup_CA36738`)
- **Lead**: `lead_${orderNumber}` (e.g. `lead_CA36738`)
- **Schedule**: `schedule_${orderNumber}` (e.g. `schedule_CA36738`)
- **OfferAccepted**: `offer_accept_${orderId}`

### Client-Side Anti-Duplication Shield
Implemented in `lib/analytics/meta.ts`:
1. **In-Memory Set**: Prevents rapid double-triggers during React re-renders or Strict Mode double-invocations.
2. **Session Storage**: Prevents duplicate emissions when customers refresh confirmation pages, use the browser back/forward buttons, or switch tabs.

---

## 4. Server-Side Conversions API (CAPI) & Privacy (PII Hashing)

Implemented in `lib/analytics/meta-server.ts`:
- **Protocol**: Direct HTTPS `POST https://graph.facebook.com/v20.0/${META_PIXEL_ID}/events`
- **Authentication**: `META_CONVERSIONS_API_ACCESS_TOKEN` (Read exclusively from server-side environment variables, never sent to browser).
- **Client Metadata Extraction**:
  - `client_ip_address`: Extracted from `x-forwarded-for`, `x-real-ip`, or socket.
  - `client_user_agent`: Extracted from HTTP `user-agent` header.
  - `fbp` & `fbc`: Extracted from request cookies `_fbp` and `_fbc` if available.
- **Customer Data Normalization & SHA-256 Hashing**:
  - **Phone Number**: Normalized to E.164 without `+` (e.g., `7604092333` becomes `917604092333`), then SHA-256 hashed.
  - **Email**: Trimmed, lowercased, then SHA-256 hashed.
  - **First Name / Last Name**: Lowercase, trimmed, then SHA-256 hashed.
  - **City / State / Postal Code**: Normalized, then SHA-256 hashed.
- **Fail-Safe Execution**: Server CAPI calls run asynchronously with a 5-second abort controller. They never block order creation or user responses.

---

## 5. Meta Ads Manager Setup Guide

When creating ad campaigns in Meta Ads Manager for CashALL:

### Step 1: Create a Custom Conversion for `PickupBooked`
1. Go to **Meta Events Manager** -> **Custom Conversions** -> **Create Custom Conversion**.
2. Name: `CashALL Doorstep Pickup Booked`.
3. Data Source: Select Pixel `1037780558881291`.
4. Event: Select `PickupBooked`.
5. Rules: (Leave rule empty to match all `PickupBooked` events, or filter by `currency: INR`).

### Step 2: Campaign Objective Selection
- Select **Leads** or **Sales** campaign objective.
- At the Ad Set level under **Conversion Location**, choose **Website**.
- Under **Conversion Event**, select your Custom Conversion **`CashALL Doorstep Pickup Booked`** (or standard **`Lead`** / **`Schedule`**).
- **DO NOT select `Purchase`** as the optimization event.

### Step 3: Event Quality & Aggregated Event Measurement
- In Events Manager, verify that Event Quality score for `PickupBooked`, `Lead`, and `Schedule` shows "Great" with high customer information match quality.
- Verify that Browser and Server events show **"Deduplicated"** status in Event History.
