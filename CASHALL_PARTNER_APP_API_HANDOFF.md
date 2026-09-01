# CashALL Partner App — Complete Technical API Handoff Document

> **Confidential Document for Internal Engineering & Partner App Development**  
> **Target Audience:** CashALL Partner / Logistics Mobile App Engineering Team  
> **Inspection Date:** August 2026  
> **System Architecture:** Next.js 14 App Router, Supabase PostgreSQL, Prisma ORM, Supabase Storage, Firebase Auth  

---

## Table of Contents

1. [Production Environment Status ("Is prod env working?")](#1-production-environment-status)
2. [Stage & Development Environment ("Do we have any stage env?")](#2-stage--development-environment)
3. [Safe Environment Variable Reference (.env.example)](#3-safe-environment-variable-reference)
4. [Critical Agent Authentication & Security Audit](#4-critical-agent-authentication--security-audit)
5. [Agent API Authorization Matrix & Cross-Agent Tampering Risk](#5-agent-api-authorization-matrix)
6. [Idempotency-Key Header Analysis (`upload-payment` & `complete`)](#6-idempotency-key-header-analysis)
7. [Pickup Failed API Specification (Gap Analysis & Proposed Contract)](#7-pickup-failed-api-specification)
8. [Complete API Inventory Matrix](#8-complete-api-inventory-matrix)
9. [Comprehensive API Request / Response Specifications & Copy-Paste Examples](#9-comprehensive-api-specifications)
   - [9.1 Agent & Partner Logistics APIs](#91-agent--partner-logistics-apis)
   - [9.2 Core Transaction & Order Lifecycle APIs](#92-core-transaction--order-lifecycle-apis)
   - [9.3 Customer Authentication & Profile APIs](#93-customer-authentication--profile-apis)
   - [9.4 Device Catalog, Valuation & Pricing APIs](#94-device-catalog-valuation--pricing-apis)
   - [9.5 Storage & Media Upload APIs](#95-storage--media-upload-apis)
   - [9.6 Notification & Audit APIs](#96-notification--audit-apis)
   - [9.7 Admin Portal Management APIs (Internal / Reference Only)](#97-admin-portal-management-apis)
10. [Partner App API Requirements Categorization](#10-partner-app-api-requirements-categorization)
11. [Recommended Partner Mobile App API Execution Flow](#11-recommended-partner-mobile-app-api-execution-flow)
12. [Developer Handoff Checklist](#12-developer-handoff-checklist)

---

## 1. Production Environment Status

### Developer Query: *"Is prod env working?"*

### **PRODUCTION STATUS: WORKING (VERIFIED)**

| Parameter | Configuration / Live Value |
|---|---|
| **Production Canonical URL** | `https://www.cashall.in` |
| **Production API Base URL** | `https://www.cashall.in/api/v1` |
| **API Health Check URL** | `https://www.cashall.in/api/health` |
| **Database Host** | `aws-0-ap-south-1.pooler.supabase.com` (Supabase AWS Mumbai) |
| **Storage Bucket Host** | `https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1` |
| **Hosting Platform** | Vercel Serverless Platform (`prj_81t14INyGK2wM06wRAIrM0lmYWZH`) |

### Verification Evidence
A live HTTP ping to `https://www.cashall.in/api/health` returns:
```json
{
  "status": "ok",
  "timestamp": "2026-08-28T06:41:58.221Z",
  "service": "CashALL API",
  "environment": "production",
  "database": "connected"
}
```
The database connection pool, DNS routing, and edge SSL certificates are active, resolving orders, quotes, and catalog inquiries.

---

## 2. Stage & Development Environment

### Developer Query: *"Do we have any stage env?"*

### **STAGING ENVIRONMENT: DOES NOT EXIST**

> **Official Status Statement:**  
> **"No separate staging environment is currently configured."**

### Architectural Audit Details
1. **Git Repository:** Single branch (`main`). No `develop`, `staging`, or `qa` branches exist.
2. **Vercel Deployments:** Only one production project (`cashall`) mapped to `www.cashall.in`. No preview domains with staging database hooks exist.
3. **Database & Storage:** The project utilizes a single production Supabase project (`jqysknhobtpcbyyltnfc`). There is no staging database instance.
4. **Firebase Project:** Single Firebase application configuration deployed across all environments.

*Action for Partner App Developer:* All mobile development testing must currently target the local development instance (`http://localhost:3000/api/v1`) or the production API with synthetic test orders flagged `#TEST_...` to avoid corrupting live accounting.

---

## 3. Safe Environment Variable Reference

This template contains **ONLY** variable names, classifications, and explanations. **NO secrets or private credentials are included.**

```env
# ==============================================================================
# CASHALL ENVIRONMENT VARIABLES REFERENCE (NAMES ONLY)
# ==============================================================================

# --- SUPABASE CONFIGURATION (DATABASE & STORAGE) ---
NEXT_PUBLIC_SUPABASE_URL=REQUIRED_PUBLIC            # Supabase API project endpoint
NEXT_PUBLIC_SUPABASE_ANON_KEY=REQUIRED_PUBLIC       # Public client key with RLS protection
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=OPTIONAL_PUBLIC# Legacy publishable key
SUPABASE_SERVICE_ROLE_KEY=REQUIRED_SERVER_SECRET    # NEVER bundle into mobile app binary
SUPABASE_JWT_SECRET=REQUIRED_SERVER_SECRET          # Used for verifying Auth tokens
DATABASE_URL=REQUIRED_SERVER_SECRET                 # Direct PostgreSQL connection pool string

# --- POSTGRES SPECIFIC ENVS (VERCEL INTEGRATION) ---
POSTGRES_DATABASE=REQUIRED_SERVER_SECRET
POSTGRES_HOST=REQUIRED_SERVER_SECRET
POSTGRES_PASSWORD=REQUIRED_SERVER_SECRET
POSTGRES_USER=REQUIRED_SERVER_SECRET
POSTGRES_PRISMA_URL=REQUIRED_SERVER_SECRET
POSTGRES_URL=REQUIRED_SERVER_SECRET
POSTGRES_URL_NON_POOLING=REQUIRED_SERVER_SECRET

# --- FIREBASE CLIENT AUTHENTICATION (CUSTOMER OTP) ---
NEXT_PUBLIC_FIREBASE_API_KEY=REQUIRED_PUBLIC
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=REQUIRED_PUBLIC
NEXT_PUBLIC_FIREBASE_PROJECT_ID=REQUIRED_PUBLIC
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=REQUIRED_PUBLIC
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=REQUIRED_PUBLIC
NEXT_PUBLIC_FIREBASE_APP_ID=REQUIRED_PUBLIC
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=OPTIONAL_PUBLIC
NEXT_PUBLIC_FIREBASE_VAPID_KEY=OPTIONAL_PUBLIC

# --- THIRD PARTY SERVICES ---
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=REQUIRED_PUBLIC     # Google Places Autocomplete on web
RESEND_API_KEY=REQUIRED_SERVER_SECRET               # Transactional email delivery
GMAIL_USER=REQUIRED_SERVER_SECRET                   # Backup SMTP mailer account
GMAIL_APP_PASSWORD=REQUIRED_SERVER_SECRET           # Backup SMTP App password
SMTP_HOST=REQUIRED_SERVER_SECRET
SMTP_PORT=REQUIRED_SERVER_SECRET
SMTP_SECURE=REQUIRED_SERVER_SECRET
EMAIL_FROM=REQUIRED_SERVER_CONFIG
GOOGLE_SHEETS_WEBHOOK_URL=REQUIRED_SERVER_SECRET    # Google Sheet accounting auto-sync webhook
META_PIXEL_ID=OPTIONAL_SERVER_CONFIG                # Meta Conversions API
META_CONVERSIONS_API_ACCESS_TOKEN=REQUIRED_SERVER_SECRET

# --- ADMIN OPERATOR SEEDING ---
ADMIN_EMAIL=REQUIRED_SERVER_SECRET
ADMIN_PASSWORD=REQUIRED_SERVER_SECRET
```

### Variable Classification Legend
- **PUBLIC (`NEXT_PUBLIC_...`):** Safe to embed in frontend/client applications (e.g. mobile app config bundle). Restricted by Supabase Row Level Security (RLS).
- **SERVER-ONLY:** Accessible only by Next.js Serverless Functions running in Vercel or Node.js runtime.
- **SECRET:** Critical keys (Prisma Database URL, Supabase Service Role Key, Resend API Key). **Must NEVER be provided to or compiled into the mobile app.**

---

## 4. Critical Agent Authentication & Security Audit

### Developer Report Verification
> *"bub in backend: GET /agent/orders works without a valid login. The agent token is tok_agent_{agentId}_{timestamp}."*

### **AUDIT CLASSIFICATION: SECURITY VULNERABILITY (HIGH SEVERITY)**

Our read-only inspection of `app/api/v1/agent/orders/route.ts`, `app/api/v1/agent/login/route.ts`, and `lib/middlewares/auth.ts` **confirms the developer's exact findings**:

### 1. The Token Generation Flaw (`POST /api/v1/agent/login`)
Lines 38 and 91 of `app/api/v1/agent/login/route.ts`:
```typescript
const token = `tok_agent_${agent.id}_${Date.now()}`;
```
- **Finding:** The token returned upon agent login is a plain string constructed from the agent's database UUID and `Date.now()`.
- **Vulnerability:** It is **not** a signed cryptographic JWT (JSON Web Token), contains no signature, and is not stored in a Redis/Database session table. Anyone who knows an agent's UUID can craft a valid-looking token in 1 millisecond.

### 2. The Unauthenticated Orders Endpoint (`GET /api/v1/agent/orders`)
Lines 7–38 of `app/api/v1/agent/orders/route.ts`:
```typescript
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const phone = searchParams.get("phone");
  const name = searchParams.get("name");
  ...
```
- **Finding:** The endpoint **does not inspect any `Authorization` header, cookie, or session**.
- **Vulnerability:** If an attacker or unauthorized caller sends:
  ```http
  GET /api/v1/agent/orders?phone=6289477287
  ```
  or
  ```http
  GET /api/v1/agent/orders?name=sangeet
  ```
  The server returns the **full list of customer orders**, including customer names, raw phone numbers, exact doorstep GPS/house addresses, device IMEI numbers, and payout prices without ANY login credentials!

### 3. The Middleware Fallback Glitch (`lib/middlewares/auth.ts`)
Lines 15–24 of `lib/middlewares/auth.ts`:
```typescript
export async function verifyAuthToken(req: NextRequest): Promise<DecodedUser> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Fail-safe for admin operator requests in dev environment
    const adminEmail = (process.env.ADMIN_EMAIL || "support@cashall.in").trim().toLowerCase();
    return {
      uid: "admin_master_1",
      email: adminEmail,
      role: "ADMIN",
    };
  }
```
- **Finding:** If an endpoint uses `verifyAuthToken(req)` and a caller sends **no Authorization header**, the system automatically elevates the caller to **role: "ADMIN"** with `uid: "admin_master_1"`!
- **Consequence:** In endpoints like `GET /api/v1/partner/orders`, if called without headers, `verifyAuthToken` grants `ADMIN` role, and since no partner filter is passed, it returns **EVERY order in the entire database**.

---

### Security Risk Summary
1. **PII Data Exposure:** Customer phone numbers, home addresses, and device serial numbers are unprotected.
2. **Identity Spoofing:** Any agent can view and complete pickups assigned to other agents simply by passing another agent's phone number or ID in the URL.
3. **Audit Trail Corruption:** Actions are logged under arbitrary agent names because caller identity is not cryptographically validated from a token.

---

### Expected vs Recommended Architecture

| Component | Current Vulnerable Behavior | Required Production Fix |
|---|---|---|
| **Agent Login** | Returns unencrypted string `tok_agent_{agentId}_{timestamp}` | Generate signed JWT with HMAC-SHA256 containing `{ sub: agent.id, role: "AGENT", exp: 7_days }` using `SUPABASE_JWT_SECRET`. |
| **Token Verification** | Ignored completely on `/api/v1/agent/orders` | Require header: `Authorization: Bearer <JWT>`. Validate signature and extract `agentId` strictly from token payload. |
| **Order Fetching** | `GET /agent/orders?agentId=...` | Query parameters removed. Server reads `agentId = token.sub`. An agent can **only** access orders where `order.agentId === token.sub`. |
| **Auth Fail-Safe** | Missing header defaults to `ADMIN` role | Missing or invalid header **must immediately throw HTTP 401 Unauthorized**. |

---

## 5. Agent API Authorization Matrix

| Endpoint | Method | Requires Login? | Validates Agent Identity? | Admin Role Accepted? | Can Agent Access Another Agent's Data? | Security Vulnerability Status |
|---|---|---|---|---|---|---|
| `/api/v1/agent/login` | POST | ❌ No | Validates credentials against DB | N/A | No | Weak plain token returned |
| `/api/v1/agent/orders` | GET | ❌ **NO** | ❌ **NO** (Reads query params) | Yes (Unchecked) | ⚠️ **YES** (Can query any phone/name) | 🚨 **CRITICAL VULNERABILITY** |
| `/api/v1/agent/orders/[id]/inspection` | POST | ❌ **NO** | ❌ **NO** (Accepts any agentName) | Yes (Unchecked) | ⚠️ **YES** (Can inspect any order) | 🚨 **HIGH VULNERABILITY** |
| `/api/v1/agent/upload-payment` | POST | ❌ **NO** | ❌ **NO** (Accepts any agentId) | Yes (Unchecked) | ⚠️ **YES** (Can upload for any order) | 🚨 **HIGH VULNERABILITY** |
| `/api/v1/agent/orders/[id]/complete` | POST | ❌ **NO** | ❌ **NO** (Accepts any agentName) | Yes (Unchecked) | ⚠️ **YES** (Can complete any order) | 🚨 **HIGH VULNERABILITY** |
| `/api/v1/partner/orders` | GET | ⚠️ Broken | ⚠️ Broken (Falls back to ADMIN) | Yes | ⚠️ **YES** (Leaks all pickups if no header) | 🚨 **CRITICAL VULNERABILITY** |
| `/api/v1/orders/[id]/start-inspection` | POST | ⚠️ Broken | Checks token or falls back to ADMIN | Yes | Yes (If no header sent) | ⚠️ Vulnerable fallback |
| `/api/v1/orders/[id]/final-offer` | POST | ⚠️ Broken | Checks token or falls back to ADMIN | Yes | Yes (If no header sent) | ⚠️ Vulnerable fallback |
| `/api/v1/orders/[id]/payment` | POST | ⚠️ Broken | Checks token or falls back to ADMIN | Yes | Yes (If no header sent) | ⚠️ Vulnerable fallback |

---

## 6. Idempotency-Key Header Analysis

### Developer Query
> *"An Idempotency-Key header on upload-payment and complete"*

### **CURRENTLY SUPPORTED: NO**

> **Official Inspection Finding:**  
> **"Idempotency-Key is NOT currently implemented in the CashALL backend."**

### Verification Details
1. **Inspection of `POST /api/v1/agent/upload-payment`:**
   - The route parses `formData.get("orderId")`, `formData.get("urn")`, `formData.get("file")`, and `formData.get("agentId")`.
   - It **does not inspect** `req.headers.get("Idempotency-Key")` or `req.headers.get("X-Idempotency-Key")`.
   - If an agent double-clicks or experiences a retry on poor cellular networks, a duplicate file is uploaded to Supabase Storage, and the payment record is updated redundantly.
2. **Inspection of `POST /api/v1/agent/orders/[id]/complete`:**
   - The route parses `body.finalPrice`, `body.utr`, and `body.agentName`.
   - It **does not inspect** any idempotency header.
   - A network retry triggers duplicate calls to `sync-sheets` and multiple PDF invoice emails to the customer.

---

### Backend Recommendation for Partner App Developers

While backend engineers prepare database-backed idempotency caching, the Partner App **must proactively implement client-side deduplication**:

#### 1. Recommended Client Header Format
The mobile app should immediately start transmitting the standard UUID v4 idempotency header on all financial and state-changing mutations:
```http
POST /api/v1/agent/upload-payment HTTP/1.1
Host: www.cashall.in
Content-Type: multipart/form-data
Authorization: Bearer <TOKEN>
Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
```
```http
POST /api/v1/agent/orders/CA61962/complete HTTP/1.1
Host: www.cashall.in
Content-Type: application/json
Authorization: Bearer <TOKEN>
Idempotency-Key: 4f89d3a2-11c5-4a6f-b258-7e18987b7a12
```

#### 2. Client-Side Defensive Logic
- Disable the "Confirm Payout" and "Complete Order" UI buttons immediately upon first tap.
- Cache the generated `Idempotency-Key` alongside the `orderNumber` in local device storage (SQLite/Hive).
- If a network timeout occurs, re-send the **exact same `Idempotency-Key`** with the retry request.

---

## 7. Pickup Failed API Specification

### Developer Query
> *"An agent can't report that a pickup failed: need an API for this as well."*

### **CURRENT STATUS: NOT CURRENTLY IMPLEMENTED**

> **Inspection Result:**  
> In the existing codebase, the only cancellation endpoint is customer-facing: `POST /api/v1/orders/[id]/cancel`. There is **no dedicated agent pickup failure endpoint** that records doorstep visit attempts, failed reasons, or geolocation coordinates.

---

### Proposed Official API Contract: `POST /api/v1/agent/orders/[id]/pickup-failed`

Based on the existing database schema (`Order.status`, `Pickup.status`, `AuditLog`), backend engineering will implement this endpoint matching the contract below.

#### HTTP Method & Path
```http
POST /api/v1/agent/orders/{orderId}/pickup-failed
```

#### Headers
```http
Content-Type: application/json
Authorization: Bearer <TOKEN>
Idempotency-Key: <UUIDv4>
```

#### Path Parameters
- `orderId` *(string, required)*: Either the Order UUID (`080b031c-b29e-...`) or the human-readable order number (`CA61962` or `#CA61962`).

#### Request Body Schema (JSON)
```json
{
  "failureReason": "CUSTOMER_UNAVAILABLE",
  "notes": "Doorbell not answered. Called customer phone 3 times with no response.",
  "rescheduleRequested": true,
  "suggestedDate": "2026-08-31",
  "suggestedTimeSlot": "2 PM - 5 PM",
  "agentLocation": {
    "latitude": 22.5726,
    "longitude": 88.3639,
    "accuracy": 12.5
  },
  "evidencePhotoUrl": "https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/public/qc-reports/failed_doorstep_CA61962.jpg"
}
```

#### Field Definitions
| Field | Type | Required? | Description |
|---|---|---|---|
| `failureReason` | `string` | **Yes** | Standard enum: `CUSTOMER_UNAVAILABLE`, `CUSTOMER_REFUSED`, `INCORRECT_ADDRESS`, `DEVICE_MISMATCH`, `PRICE_DISAGREEMENT`, `DEVICE_DAMAGED_EXCESSIVE`, `FAKE_DEVICE`, `OTHER`. |
| `notes` | `string` | **Yes** | Detailed field remarks explaining the circumstances. |
| `rescheduleRequested` | `boolean` | No | `true` if customer requested to try again another day; `false` if permanently cancelled. |
| `suggestedDate` | `string` | No | Date in `YYYY-MM-DD` or `Tomorrow` format if rescheduling. |
| `suggestedTimeSlot` | `string` | No | e.g. `10 AM - 1 PM`, `2 PM - 5 PM`, `5 PM - 8 PM`. |
| `agentLocation` | `object` | No | GPS coordinates confirming agent arrived at the customer doorstep. |
| `evidencePhotoUrl` | `string` | No | Uploaded photo proof of closed door, locked gate, or mismatched phone. |

#### Expected Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Pickup failure recorded successfully. Order marked as CANCELLED.",
  "data": {
    "orderId": "080b031c-b29e-4c74-8b65-9831d17d52e5",
    "orderNumber": "CA61962",
    "status": "CANCELLED",
    "pickupStatus": "FAILED",
    "failureReason": "CUSTOMER_UNAVAILABLE",
    "rescheduled": true,
    "recordedAt": "2026-08-30T10:35:12.000Z"
  }
}
```

#### Database Records Affected
1. `Order`: `status` updated to `"CANCELLED"` (or `"PICKUP_SCHEDULED"` if rescheduled).
2. `Pickup`: `status` updated to `"FAILED"`, `notes` appended with reason and remarks.
3. `AuditLog`: Appends audit entry with actor `agentId`, action `"PICKUP_FAILED"`, and GPS metadata.

---

## 8. Complete API Inventory Matrix

| # | HTTP Method | Endpoint Path | Category | Purpose | Auth Required | Safe for Partner App? |
|---|---|---|---|---|---|---|
| **1** | `POST` | `/api/v1/agent/login` | Auth | Field agent mobile credentials login | ❌ Public (Name/Password) | ✅ YES |
| **2** | `GET` | `/api/v1/agent/orders` | Agent | Fetch orders assigned to field agent | ⚠️ Broken (Query params) | ⚠️ USE WITH FIX |
| **3** | `POST` | `/api/v1/agent/orders/[id]/inspection` | Agent | Submit doorstep QC physical findings & lock final offer | ❌ Insecure (No token check) | ⚠️ USE WITH FIX |
| **4** | `POST` | `/api/v1/agent/upload-payment` | Payment | Upload manual UPI payment screenshot & 12-digit UTR | ❌ Insecure (No token check) | ⚠️ USE WITH FIX |
| **5** | `POST` | `/api/v1/agent/orders/[id]/complete` | Agent | Mark order COMPLETED, trigger email & sheet sync | ❌ Insecure (No token check) | ⚠️ USE WITH FIX |
| **6** | `GET` | `/api/v1/partner/orders` | Partner | Legacy partner pickups fetch | ⚠️ Broken fallback | ❌ USE `/agent/orders` |
| **7** | `POST` | `/api/v1/auth/partner-login` | Auth | Partner auto-registration/login | ❌ Public | ❌ USE `/agent/login` |
| **8** | `POST` | `/api/v1/orders/[id]/start-inspection` | Order | Transition status to `INSPECTION_STARTED` | 🔑 Bearer (Broken Fallback) | ⚠️ USE WITH FIX |
| **9** | `POST` | `/api/v1/orders/[id]/final-offer` | Order | Legacy submit final offer | 🔑 Bearer | ❌ USE `/agent/orders/...` |
| **10** | `POST` | `/api/v1/orders/[id]/verify-identity` | Order | Submit Aadhaar / PAN mask verification | 🔑 Bearer | ✅ CAN USE |
| **11** | `POST` | `/api/v1/orders/[id]/device-received` | Order | Physical device custody handover | 🔑 Bearer | ✅ CAN USE |
| **12** | `POST` | `/api/v1/orders/[id]/esign` | Order | Customer signs sale declaration | 🔑 Bearer | ✅ CAN USE |
| **13** | `POST` | `/api/v1/orders/[id]/payment` | Payment | Record payment (Admin/Partner) | 🔑 Bearer | ❌ USE `/agent/upload-payment` |
| **14** | `GET` | `/api/v1/orders/[id]/generate-bill` | Order | Fetch complete Bill of Sale data object | ❌ Public (Read-only) | ✅ YES |
| **15** | `POST` | `/api/v1/orders/[id]/generate-bill` | Order | Same as GET (Generates Bill object) | ❌ Public (Read-only) | ✅ YES |
| **16** | `GET` | `/api/v1/orders/[id]` | Order | Fetch single order details with user & address | ❌ Public (ID based) | ✅ YES |
| **17** | `POST` | `/api/v1/orders/[id]/accept-offer` | Customer | Customer accepts revised offer | 🔑 Bearer | Customer Only |
| **18** | `POST` | `/api/v1/orders/[id]/decline-offer` | Customer | Customer rejects revised offer | 🔑 Bearer | Customer Only |
| **19** | `POST` | `/api/v1/orders/[id]/dispute` | Order | Mark transaction as disputed | 🔑 Bearer | Customer / Admin |
| **20** | `POST` | `/api/v1/orders/[id]/cancel` | Customer | Cancel order / decline pickup | ❌ Public (UUID based) | Customer Only |
| **21** | `POST` | `/api/v1/orders/create` | Customer | Create pickup booking on website | ❌ Public | Customer Only |
| **22** | `POST` | `/api/v1/orders/sync-local` | Customer | LocalStorage to Supabase sync | ❌ Public | Customer Only |
| **23** | `GET` | `/api/v1/orders/user` | Customer | Customer order history by phone | ❌ Public | Customer Only |
| **24** | `POST` | `/api/v1/quotes/calculate` | Quote | Run valuation algorithm & create quote | ❌ Public | ✅ Optional (Re-quote) |
| **25** | `POST` | `/api/v1/quotes/save` | Quote | Save quote without user | ❌ Public | Customer Only |
| **26** | `POST` | `/api/v1/quotes/[id]/cancel` | Quote | Cancel quote | ❌ Public | Customer Only |
| **27** | `GET` | `/api/v1/catalog` | Catalog | Get brands & popular models | ❌ Public | ✅ YES |
| **28** | `GET` | `/api/v1/catalog/questions` | Catalog | Get 5 diagnostic question groups & options | ❌ Public | ✅ YES |
| **29** | `GET` | `/api/v1/catalog/image/[slug]` | Catalog | Stream device WebP image | ❌ Public | ✅ YES |
| **30** | `GET` | `/api/v1/serviceability` | Catalog | Get serviceable PIN codes & districts | ❌ Public | ✅ YES |
| **31** | `POST` | `/api/v1/storage/upload` | Upload | General Supabase Storage file upload | 🔑 Bearer | ✅ YES |
| **32** | `POST` | `/api/v1/auth/otp/send` | Auth | Send customer OTP (Firebase notice) | ❌ Public | Customer Only |
| **33** | `POST` | `/api/v1/auth/otp/verify` | Auth | Audit log verified customer OTP | ❌ Public | Customer Only |
| **34** | `POST` | `/api/v1/auth/login` | Auth | Sync Firebase customer user | ❌ Public | Customer Only |
| **35** | `POST` | `/api/v1/auth/admin-login` | Auth | Admin operator credentials login | ❌ Public | Admin Only |
| **36** | `GET` | `/api/v1/auth/me` | Auth | Get current authenticated user profile | 🔑 Bearer | ✅ YES |
| **37** | `POST` | `/api/v1/notifications/register` | Notifications | Register device FCM Push Token | 🔑 Bearer | ✅ YES |
| **38** | `GET` | `/api/health` | System | Health & DB connection check | ❌ Public | ✅ YES |
| **39** | `POST` | `/api/sync-sheets` | System | Push row to Google Sheets | ❌ Public (Server hook) | Server Only |
| **40** | `GET` | `/api/v1/admin/dashboard` | Admin | Overall business KPIs | 🔑 Admin | Admin Only |
| **41** | `GET, POST`| `/api/v1/admin/orders` | Admin | Full order grid & filter | 🔑 Admin | Admin Only |
| **42** | `POST` | `/api/v1/admin/orders/[id]/assign-agent`| Admin | Assign field agent to order | 🔑 Admin | Admin Only |
| **43** | `POST` | `/api/v1/admin/orders/[id]/assign-pickup`| Admin | Assign pickup slot | 🔑 Admin | Admin Only |
| **44** | `POST` | `/api/v1/admin/orders/[id]/send-bill-email`| Admin | Trigger manual invoice dispatch | 🔑 Admin | Admin Only |
| **45** | `POST` | `/api/v1/admin/orders/[id]/payout` | Admin | Mark payout confirmed | 🔑 Admin | Admin Only |

---

## 9. Comprehensive API Specifications

---

### 9.1 Agent & Partner Logistics APIs

#### 1. `POST /api/v1/agent/login`
- **Method:** `POST`
- **Exact Path:** `/api/v1/agent/login`
- **Purpose:** Authenticates field agents by name/phone and registered password.
- **Authentication Required:** No
- **Request Content-Type:** `application/json`
- **Request Body Schema:**
  - `name` / `emailOrPhone` / `username` *(string, required)*: Agent full name or 10-digit phone.
  - `password` *(string, required)*: Default is the agent's 10-digit phone number.
- **Example Request:**
```http
POST /api/v1/agent/login HTTP/1.1
Host: www.cashall.in
Content-Type: application/json

{
  "name": "SANGEET SHAW",
  "password": "Ank933967@"
}
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "token": "tok_agent_agent_sangeet_shaw_1724912345678",
  "agent": {
    "id": "c7a84e20-3b91-49fa-9eb2-8b7a951d8b6c",
    "name": "SANGEET SHAW",
    "email": "sangeetshaw39@gmail.com",
    "phone": "6289477287",
    "role": "AGENT"
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "error": "Agent name, email, or phone number is required"}`
  - `401 Unauthorized`: `{"success": false, "error": "Invalid password. Your login password is your registered 10-digit phone number."}`
  - `500 Server Error`: `{"success": false, "error": "Login failed"}`
- **Database Records:** Reads `User` where `role = "AGENT"`.
- **Scope:** Field Partner / Delivery App.

---

#### 2. `GET /api/v1/agent/orders`
- **Method:** `GET`
- **Exact Path:** `/api/v1/agent/orders`
- **Purpose:** Fetches all assigned doorstep pickup orders for a specific field agent.
- **Authentication Required:** Currently query-param based (Needs Bearer fix).
- **Query Parameters:**
  - `agentId` *(string, optional)*: Agent user UUID.
  - `phone` *(string, optional)*: Agent 10-digit phone (e.g. `6289477287`).
  - `name` *(string, optional)*: Agent registered name (e.g. `SANGEET SHAW`).
- **Example Request:**
```http
GET /api/v1/agent/orders?phone=6289477287 HTTP/1.1
Host: www.cashall.in
Authorization: Bearer tok_agent_c7a84e20-3b91_1724912345678
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
      "orderNumber": "CA61962",
      "customerName": "Rohan Das",
      "customerPhone": "9830123456",
      "customerEmail": "rohan.das@example.com",
      "deviceName": "Apple iPhone 13 (128 GB)",
      "imeiNumber": "356789102345678",
      "estimatedPrice": 24500,
      "finalPrice": 22000,
      "amount": 22000,
      "address": "Flat 4B, Greenfield Heights, Rajarhat, Kolkata, West Bengal - 700135",
      "addressSummary": "Flat 4B, Greenfield Heights, Rajarhat, Kolkata, West Bengal - 700135",
      "pickupDate": "Tomorrow",
      "pickupTimeSlot": "10 AM - 1 PM",
      "pincode": "700135",
      "status": "ACCEPTED",
      "paymentStatus": "PENDING",
      "urn": null,
      "paymentScreenshotUrl": null,
      "agentName": "SANGEET SHAW",
      "selectedAnswersJson": "{\"device\":\"Apple iPhone 13 (128 GB)\"}",
      "breakdownJson": "{\"deviceName\":\"Apple iPhone 13 (128 GB)\"}",
      "priceDifferenceReason": "Minor scratches on outer body frame",
      "quoteNumber": "QA54921",
      "createdAt": "2026-08-29T11:20:00.000Z"
    }
  ]
}
```
- **Error Responses:**
  - `500 Server Error`: `{"success": false, "error": "Internal server error"}`
- **Database Records:** `Order`, `User`, `Address`, `Pickup`, `QcReport`, `Imei`, `Payment`, `Quote`.
- **Scope:** Field Partner / Delivery App.

---

#### 3. `POST /api/v1/agent/orders/[id]/inspection`
- **Method:** `POST`
- **Exact Path:** `/api/v1/agent/orders/{id}/inspection` (where `{id}` is `CA61962` or Order UUID)
- **Purpose:** Submits doorstep diagnostic findings, records device IMEI, and locks the final settled payout price.
- **Authentication Required:** Insecure in current build (Needs Bearer fix).
- **Request Content-Type:** `application/json`
- **Request Body Schema:**
  - `imei` *(string, required)*: 15-digit device IMEI number (min 5 characters).
  - `screenFinding` *(string, optional)*: Physical condition of display.
  - `bodyFinding` *(string, optional)*: Physical condition of body/chassis.
  - `revisedPrice` *(number, required)*: Final agreed buyback payout amount.
  - `reason` *(string, optional)*: Explanation for price adjustment (if revised).
  - `customerEmail` *(string, optional)*: Updated customer email for bill delivery.
  - `agentName` *(string, optional)*: Name of inspecting agent.
- **Example Request:**
```http
POST /api/v1/agent/orders/CA61962/inspection HTTP/1.1
Host: www.cashall.in
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "imei": "356789102345678",
  "screenFinding": "Flawless Screen",
  "bodyFinding": "Minor body scratches",
  "revisedPrice": 22000,
  "reason": "Deduction for chassis scratches.",
  "customerEmail": "customer@gmail.com",
  "agentName": "SANGEET SHAW"
}
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Physical inspection completed! Final payout offer locked at ₹22,000.",
  "order": {
    "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
    "orderNumber": "CA61962",
    "status": "ACCEPTED",
    "finalPrice": 22000
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "error": "Valid IMEI number is required (min 5 digits)"}`
  - `404 Not Found`: `{"success": false, "error": "Order not found"}`
  - `500 Server Error`: `{"success": false, "error": "Failed to save inspection"}`
- **Database Records:** Updates `Order` (status -> `ACCEPTED`, `finalPrice`), creates/updates `QcReport`, creates/updates `Imei`, updates `User` email.
- **Scope:** Field Partner / Delivery App.

---

#### 4. `POST /api/v1/agent/upload-payment`
- **Method:** `POST`
- **Exact Path:** `/api/v1/agent/upload-payment`
- **Purpose:** Uploads manual UPI payment proof screenshot and records the 12-digit UTR/URN transaction reference.
- **Authentication Required:** No (Currently insecure)
- **Request Content-Type:** `multipart/form-data`
- **Request Body Fields:**
  - `orderId` *(string, required)*: Order number (`CA61962`) or Order UUID.
  - `urn` *(string, required)*: 12-digit UPI Transaction Reference (UTR).
  - `file` *(binary File, optional)*: Image of GPay/PhonePe/Paytm success screenshot.
  - `agentId` *(string, optional)*: Agent User UUID.
- **Example Request:**
```http
POST /api/v1/agent/upload-payment HTTP/1.1
Host: www.cashall.in
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Authorization: Bearer <TOKEN>
Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="orderId"

CA61962
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="urn"

423456789012
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="upi_receipt.png"
Content-Type: image/png

<BINARY_DATA>
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment screenshot & 12-digit URN uploaded and saved. Awaiting manual Admin approval.",
  "order": {
    "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
    "orderNumber": "CA61962",
    "urn": "423456789012",
    "paymentScreenshotUrl": "https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/sign/payment-screenshots/urn_CA61962_1724912345.png?token=..."
  },
  "urn": "423456789012",
  "paymentScreenshotUrl": "https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/sign/payment-screenshots/urn_CA61962_1724912345.png?token=..."
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "error": "Order ID is required"}`
  - `404 Not Found`: `{"success": false, "error": "Order not found"}`
  - `500 Server Error`: `{"success": false, "error": "Failed to upload payment"}`
- **Database Records:** Updates `Order` (`urn`, `paymentScreenshotUrl`), updates `Payment` (`transactionRef`), writes file to Supabase Storage bucket `payment-screenshots`.
- **Scope:** Field Partner / Delivery App.

---

#### 5. `POST /api/v1/agent/orders/[id]/complete`
- **Method:** `POST`
- **Exact Path:** `/api/v1/agent/orders/{id}/complete`
- **Purpose:** Marks transaction as COMPLETED & PAID, triggers automatic Google Sheets accounting push, and dispatches the official Aarna Enterprise GST Tax Invoice PDF email to the customer.
- **Authentication Required:** No (Currently insecure)
- **Request Content-Type:** `application/json`
- **Request Body Schema:**
  - `finalPrice` *(number, optional)*: Settlement amount (defaults to accepted price).
  - `utr` *(string, optional)*: 12-digit UTR reference.
  - `agentName` *(string, optional)*: Name of completing agent.
- **Example Request:**
```http
POST /api/v1/agent/orders/CA61962/complete HTTP/1.1
Host: www.cashall.in
Content-Type: application/json
Authorization: Bearer <TOKEN>
Idempotency-Key: 4f89d3a2-11c5-4a6f-b258-7e18987b7a12

{
  "finalPrice": 22000,
  "utr": "423456789012",
  "agentName": "SANGEET SHAW"
}
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Order #CA61962 marked as COMPLETED & PAID. Tax Invoice email sent to customer@gmail.com via Resend.",
  "emailSent": true,
  "emailProvider": "Resend",
  "emailError": null,
  "order": {
    "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
    "orderNumber": "CA61962",
    "status": "COMPLETED",
    "finalPrice": 22000,
    "urn": "423456789012"
  }
}
```
- **Error Responses:**
  - `404 Not Found`: `{"success": false, "error": "Order not found"}`
  - `500 Server Error`: `{"success": false, "error": "Failed to complete order"}`
- **Database Records:** Updates `Order` (`status = "COMPLETED"`, `finalPrice`, `urn`), creates/updates `Payment` (`status = "PAID"`, `paidAt = now()`), calls external Google Sheets webhook.
- **Scope:** Field Partner / Delivery App.

---

### 9.2 Core Transaction & Order Lifecycle APIs

#### 6. `GET /api/v1/orders/[id]`
- **Method:** `GET`
- **Exact Path:** `/api/v1/orders/{id}`
- **Purpose:** Fetches comprehensive details of a single order (Customer info, device specs, pickup schedule, QC reports, payments).
- **Authentication Required:** No (Query by ID/OrderNumber)
- **Example Request:**
```http
GET /api/v1/orders/CA61962 HTTP/1.1
Host: www.cashall.in
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
    "orderNumber": "CA61962",
    "status": "ACCEPTED",
    "finalPrice": 22000,
    "pickupDate": "Tomorrow",
    "pickupTimeSlot": "10 AM - 1 PM",
    "deviceName": "Apple iPhone 13 (128 GB)",
    "addressSummary": "Flat 4B, Greenfield Heights, Rajarhat, Kolkata - 700135",
    "customerName": "Rohan Das",
    "customerPhone": "9830123456",
    "customerEmail": "rohan.das@example.com",
    "agentName": "SANGEET SHAW",
    "agentPhone": "6289477287",
    "utr": "423456789012",
    "estimatedPrice": 24500,
    "user": {
      "id": "u123",
      "name": "Rohan Das",
      "phone": "9830123456"
    },
    "address": {
      "house": "Flat 4B",
      "street": "Greenfield Heights",
      "area": "Rajarhat",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700135"
    }
  }
}
```
- **Error Response:**
  - `404 Not Found`: `{"success": false, "error": "Order not found."}`
- **Scope:** Universal.

---

#### 7. `GET /api/v1/orders/[id]/generate-bill`
- **Method:** `GET` / `POST`
- **Exact Path:** `/api/v1/orders/{id}/generate-bill`
- **Purpose:** Returns the complete structured JSON payload required to render or print the official CashALL / Aarna Enterprise Tax Invoice & Bill of Sale.
- **Authentication Required:** No
- **Example Request:**
```http
GET /api/v1/orders/CA61962/generate-bill HTTP/1.1
Host: www.cashall.in
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "billData": {
      "billNumber": "CA61962_2026",
      "orderNumber": "CA61962",
      "orderDate": "2026-08-29T11:20:00.000Z",
      "completionDate": "2026-08-30T10:15:00.000Z",
      "transactionDate": "2026-08-30T10:15:00.000Z",
      "seller": {
        "name": "Rohan Das",
        "phone": "9830123456",
        "phoneMasked": "9830123456",
        "address": "Flat 4B, Greenfield Heights, Rajarhat, Kolkata, West Bengal - 700135"
      },
      "buyer": {
        "name": "AARNA ENTERPRISE",
        "platform": "CashALL Platform",
        "gstin": "19AVPPG9800JIZ3",
        "address": "Howrah, West Bengal",
        "assignedAgent": "SANGEET SHAW"
      },
      "device": {
        "brand": "Apple",
        "model": "iPhone 13",
        "variant": "128 GB",
        "deviceName": "Apple iPhone 13 (128 GB)",
        "imei1": "356789102345678",
        "imei2": "—"
      },
      "financials": {
        "estimatedPrice": 24500,
        "finalPurchasePrice": 22000,
        "paymentMethod": "UPI Transfer",
        "utrNumber": "423456789012",
        "paymentStatus": "PAID"
      },
      "declarations": {
        "sellerDeclarationText": "This is a computer-generated receipt issued by CashALL. The seller (named above) has voluntarily sold the device to CashALL at the agreed final price. This document serves as the legal sale agreement and payment confirmation.",
        "eSignTimestamp": "2026-08-30T10:15:00.000Z",
        "documentHash": "sha256_verified_aarna_cashall"
      }
    }
  }
}
```
- **Error Response:** `404 Not Found`: `{"success": false, "error": "Order not found"}`
- **Scope:** Universal.

---

#### 8. `POST /api/v1/orders/[id]/start-inspection`
- **Method:** `POST`
- **Exact Path:** `/api/v1/orders/{id}/start-inspection`
- **Purpose:** Formally transitions Order State from `PARTNER_ASSIGNED` / `PICKUP_SCHEDULED` to `INSPECTION_STARTED`.
- **Authentication Required:** Yes (`Bearer <token>`, roles: `PARTNER`, `ADMIN`)
- **Request Body:** `{}`
- **Example Request:**
```http
POST /api/v1/orders/080b031c-b29e-4c74-8b65-9831d17d52e5/start-inspection HTTP/1.1
Host: www.cashall.in
Authorization: Bearer <TOKEN>
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
      "status": "INSPECTION_STARTED"
    }
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "error": "Invalid transaction state transition from 'COMPLETED' to 'INSPECTION_STARTED'."}`
  - `401 Unauthorized`: `{"success": false, "error": "Authentication failed"}`
  - `403 Forbidden`: `{"success": false, "error": "Access denied. Insufficient permissions."}`
  - `404 Not Found`: `{"success": false, "error": "Order not found."}`
- **Scope:** Field Partner App.

---

#### 9. `POST /api/v1/orders/[id]/verify-identity`
- **Method:** `POST`
- **Exact Path:** `/api/v1/orders/{id}/verify-identity`
- **Purpose:** Stores customer identity verification record (Aadhaar / PAN / Voter ID) and transitions order to `ACCEPTED`.
- **Authentication Required:** Yes (`Bearer <token>`)
- **Request Content-Type:** `application/json`
- **Request Body Schema:**
  - `idType` *(string, required)*: Enum: `"AADHAAR"`, `"PAN"`, `"VOTER_ID"`, `"DRIVING_LICENSE"`.
  - `idNumber` *(string, required)*: Document identifier.
  - `fullName` *(string, required)*: Name on identity document.
- **Example Request:**
```http
POST /api/v1/orders/080b031c-b29e-4c74-8b65-9831d17d52e5/verify-identity HTTP/1.1
Host: www.cashall.in
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "idType": "AADHAAR",
  "idNumber": "123456789012",
  "fullName": "Rohan Das"
}
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verification": {
      "id": "v_123",
      "idType": "AADHAAR",
      "maskedIdNumber": "XXXX-XXXX-9012",
      "status": "VERIFIED"
    },
    "order": {
      "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
      "status": "ACCEPTED"
    }
  }
}
```
- **Scope:** Field Partner App / Customer Portal.

---

#### 10. `POST /api/v1/orders/[id]/device-received`
- **Method:** `POST`
- **Exact Path:** `/api/v1/orders/{id}/device-received`
- **Purpose:** Agent formally confirms taking physical custody of the smartphone at the customer's doorstep.
- **Authentication Required:** Yes (`Bearer <token>`, roles: `PARTNER`, `ADMIN`)
- **Request Body:** `{}`
- **Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Physical device handover confirmed by partner.",
  "data": {
    "order": {
      "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",
      "status": "INSPECTION_STARTED"
    }
  }
}
```
- **Scope:** Field Partner App.

---

#### 11. `POST /api/v1/orders/[id]/esign`
- **Method:** `POST`
- **Exact Path:** `/api/v1/orders/{id}/esign`
- **Purpose:** Captures customer touchscreen digital signature and records legal voluntary sale declaration with SHA-256 document hash.
- **Authentication Required:** Yes (`Bearer <token>`)
- **Request Content-Type:** `application/json`
- **Request Body Schema:**
  - `signerName` *(string, required)*: Name of seller.
  - `signerPhone` *(string, required)*: Registered phone of seller.
  - `signatureDataUrl` *(string, optional)*: Base64 canvas data URL of signature.
  - `sellerDeclaration` *(string, required)*: Text acknowledging voluntary device ownership transfer.
- **Example Request:**
```http
POST /api/v1/orders/080b031c-b29e-4c74-8b65-9831d17d52e5/esign HTTP/1.1
Host: www.cashall.in
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "signerName": "Rohan Das",
  "signerPhone": "9830123456",
  "signatureDataUrl": "data:image/png;base64,iVBORw0KGgo...",
  "sellerDeclaration": "I hereby confirm that I am the rightful owner of this device and am selling it voluntarily to CashALL."
}
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Device Sale Agreement signed successfully.",
  "data": {
    "signature": {
      "id": "sig_123",
      "signerName": "Rohan Das",
      "documentHash": "4a7d1ed414474e4033ac29ccb8653d9b",
      "signedAt": "2026-08-30T10:14:00.000Z"
    }
  }
}
```
- **Scope:** Field Partner App.

---

### 9.3 Device Catalog, Valuation & Pricing APIs

#### 12. `GET /api/v1/catalog`
- **Method:** `GET`
- **Exact Path:** `/api/v1/catalog`
- **Purpose:** Fetches all available device categories, active brands, and popular models.
- **Authentication Required:** No
- **Query Parameters:**
  - `brand` *(string, optional)*: Brand slug (e.g. `apple`, `samsung`). Returns models and storage variants for that brand.
  - `category` *(string, optional)*: `MOBILE`, `LAPTOP`, or `TABLET`.
- **Example Request:**
```http
GET /api/v1/catalog?brand=apple&category=MOBILE HTTP/1.1
Host: www.cashall.in
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "b_apple_1",
    "name": "Apple",
    "slug": "apple",
    "models": [
      {
        "id": "m_iphone_13",
        "name": "iPhone 13",
        "slug": "apple-iphone-13",
        "releaseYear": 2021,
        "variants": [
          {
            "id": "v_iphone_13_128",
            "storage": "128 GB",
            "ram": "4 GB",
            "basePrice": 24500
          }
        ]
      }
    ]
  }
}
```
- **Scope:** Universal.

---

#### 13. `GET /api/v1/catalog/questions`
- **Method:** `GET`
- **Exact Path:** `/api/v1/catalog/questions`
- **Purpose:** Retrieves the dynamic 5-group inspection questionnaire used during device diagnosis.
- **Authentication Required:** No
- **Example Request:**
```http
GET /api/v1/catalog/questions HTTP/1.1
Host: www.cashall.in
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "q_basic",
      "title": "Does the device turn on and make calls?",
      "group": "BASIC",
      "options": [
        { "id": "opt_yes", "label": "Yes", "deductionType": "NONE" },
        { "id": "opt_no", "label": "No (Dead Device)", "deductionType": "PERCENTAGE", "value": 70 }
      ]
    },
    {
      "id": "q_screen",
      "title": "What is the screen condition?",
      "group": "SCREEN",
      "options": [
        { "id": "opt_flawless", "label": "Flawless (No scratches)", "value": 0 },
        { "id": "opt_cracked", "label": "Cracked Glass", "value": 25 },
        { "id": "opt_lines", "label": "Display Lines / Dead Pixels", "value": 50 }
      ]
    }
  ]
}
```
- **Scope:** Universal (Used by Partner App for Doorstep QC checks).

---

#### 14. `POST /api/v1/quotes/calculate`
- **Method:** `POST`
- **Exact Path:** `/api/v1/quotes/calculate`
- **Purpose:** Executes the mathematical pricing engine against a variant ID and condition answers.
- **Authentication Required:** No
- **Request Content-Type:** `application/json`
- **Request Body Schema:**
  - `variantId` *(string, required)*: DeviceVariant UUID.
  - `answers` *(array of objects, required)*: Selected options for each question.
- **Example Request:**
```http
POST /api/v1/quotes/calculate HTTP/1.1
Host: www.cashall.in
Content-Type: application/json

{
  "variantId": "v_iphone_13_128",
  "answers": [
    {
      "questionId": "q_screen",
      "questionTitle": "Screen Condition",
      "group": "SCREEN",
      "optionId": "opt_flawless",
      "optionLabel": "Flawless"
    },
    {
      "questionId": "q_body",
      "questionTitle": "Body Condition",
      "group": "BODY",
      "optionId": "opt_scratches",
      "optionLabel": "Minor Scratches"
    }
  ]
}
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "quote": {
      "quoteNumber": "QA54921",
      "basePrice": 24500,
      "totalDeductions": 2500,
      "estimatedPrice": 22000,
      "expiresAt": "2026-09-01T11:20:00.000Z"
    }
  }
}
```
- **Scope:** Universal.

---

### 9.4 Storage & Media Upload APIs

#### 15. `POST /api/v1/storage/upload`
- **Method:** `POST`
- **Exact Path:** `/api/v1/storage/upload`
- **Purpose:** Direct upload of diagnostic photos, device physical condition images, and ID documents to Supabase Storage with signed 1-year URL generation.
- **Authentication Required:** Yes (`Bearer <token>`)
- **Request Content-Type:** `multipart/form-data`
- **Request Body Fields:**
  - `file` *(binary File, required)*: Image buffer.
  - `bucket` *(string, required)*: Target bucket name: `"customer-devices"`, `"qc-reports"`, `"payment-screenshots"`, or `"payment-proofs"`.
  - `orderId` *(string, optional)*: Associated Order UUID (creates `ImageReference` record).
- **Example Request:**
```http
POST /api/v1/storage/upload HTTP/1.1
Host: www.cashall.in
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryUpload
Authorization: Bearer <TOKEN>

------WebKitFormBoundaryUpload
Content-Disposition: form-data; name="bucket"

qc-reports
------WebKitFormBoundaryUpload
Content-Disposition: form-data; name="orderId"

080b031c-b29e-4c74-8b65-9831d17d52e5
------WebKitFormBoundaryUpload
Content-Disposition: form-data; name="file"; filename="screen_inspection.jpg"
Content-Type: image/jpeg

<IMAGE_BYTES>
------WebKitFormBoundaryUpload--
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "path": "qc-reports/u123/a4f89d3a-11c5-4a6f-b258.jpg",
    "signedUrl": "https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/sign/qc-reports/u123/a4f89d3a-11c5-4a6f-b258.jpg?token=...",
    "bucket": "qc-reports"
  }
}
```
- **Scope:** Field Partner App / Customer Portal.

---

### 9.5 Notification & Audit APIs

#### 16. `POST /api/v1/notifications/register`
- **Method:** `POST`
- **Exact Path:** `/api/v1/notifications/register`
- **Purpose:** Registers the mobile device Firebase Cloud Messaging (FCM) Push Notification Token for real-time dispatch alerts.
- **Authentication Required:** Yes (`Bearer <token>`)
- **Request Content-Type:** `application/json`
- **Request Body Schema:**
  - `token` *(string, required)*: Firebase FCM device registration token.
  - `deviceType` *(string, optional)*: `"ANDROID"` or `"IOS"`.
- **Example Request:**
```http
POST /api/v1/notifications/register HTTP/1.1
Host: www.cashall.in
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "token": "dK8_f9A2lQk:APA91bFw...",
  "deviceType": "ANDROID"
}
```
- **Example Response (200 OK):**
```json
{
  "success": true,
  "message": "FCM token registered successfully."
}
```
- **Scope:** Field Partner App / Customer Portal.

---

## 9.5 3-Tier Pricing Architecture & Re-Quote Synchronization Rules

### 1. The 3 Pricing Tiers
| Tier Name | Trigger / Context | Calculation Method | Visibility |
|---|---|---|---|
| **1. QUOTE PRICE** (`estimatedPrice`) | Generated when customer completes the 5-step diagnostic questionnaire on the website. | $\text{Base Price} - \sum(\text{Customer Percentage Deductions})$ | Stored on `Quote.estimatedPrice` and `Order.estimatedPrice`. |
| **2. RE-QUOTE PRICE** (`revisedPrice` / `reQuotePrice`) | Generated during Doorstep Physical QC when the agent reviews and adjusts the customer's questionnaire selections. | $\text{Base Price} - \sum(\text{Agent Verified Deductions})$ | Real-time live calculation in Agent App / Dashboard. Agent can perform multiple re-quotes. |
| **3. FINAL SETTLED PRICE** (`finalPrice`) | Final agreed deal amount locked between customer and agent before payment handover. | Final agreed payout value after customer acceptance. | Disbursed via UPI / Bank transfer, printed on Tax Invoice, logged in Google Sheets. |

---

### 2. Physical Inspection & Re-Quote Flow
1. **Pre-Filled Customer Answers**: When the field agent opens the Inspection screen for an assigned order, the screen **pre-populates all options previously selected by the customer** (Warranty, GST Bill, Power, Calls, Touchscreen, Screen Originality, Scratches, Dents, Hardware checks, Charger, Box).
2. **Interactive Agent Adjustments**: If the agent finds a physical defect that was falsely marked or undeclared by the customer (e.g. screen was replaced with a duplicate display, or back panel is cracked):
   - The agent taps/toggles that option on the Inspection form.
   - The mobile app / system immediately recalculates the **RE-QUOTE PRICE** using the standardized percentage deduction rules against the device base price.
   - The agent can adjust multiple options and perform multiple re-quotes until exact condition is reflected.
3. **Data Synchronization Across Roles**:
   - **Customer View (`/track/[id]` & `/account`)**: Displays the **UPDATED evaluated condition options** and the new Re-Quote price offer with clear line-item explanation. The customer no longer sees outdated incorrect selections.
   - **Admin & Agent View (`/admin/orders` & `/agent/dashboard`)**: Retains **BOTH the Original Customer Declaration and the Agent Verified Findings** in the Audit Modal (`CustomerAnswersModal.tsx`) with clear side-by-side comparison badges.

---

## 10. Partner App API Requirements Categorization

Based on full codebase inspection, the APIs required by the Partner / Delivery App fall into four distinct categories:

### A. EXISTING AND READY TO USE
1. `GET /api/v1/catalog` — Fetch brands, devices, and variants.
2. `GET /api/v1/catalog/questions` — Fetch 5-group diagnostic condition questions.
3. `GET /api/v1/catalog/image/[slug]` — Render device catalog images.
4. `GET /api/v1/serviceability` — Check serviceable PIN codes.
5. `GET /api/v1/orders/[id]` — Fetch single order details, address, and specs.
6. `GET /api/v1/orders/[id]/generate-bill` — Fetch official Bill of Sale receipt payload.
7. `POST /api/v1/quotes/calculate` — On-the-spot re-valuation calculation.
8. `POST /api/v1/storage/upload` — Upload photos to Supabase Storage with signed URLs.
9. `POST /api/v1/notifications/register` — Register agent Android/iOS FCM token.
10. `POST /api/v1/orders/[id]/device-received` — Confirm physical device custody.
11. `POST /api/v1/orders/[id]/verify-identity` — Submit customer Aadhaar/PAN mask verification.
12. `POST /api/v1/orders/[id]/esign` — Record customer digital touchscreen signature.

### B. EXISTING BUT NEED SECURITY FIX
1. `POST /api/v1/agent/login`  
   *Current state:* Returns pseudo-token `tok_agent_{agentId}_{timestamp}`.  
   *Fix needed:* Issue signed JWT token using `SUPABASE_JWT_SECRET`.
2. `GET /api/v1/agent/orders`  
   *Current state:* Unauthenticated; accepts `?phone=` or `?agentId=` in URL.  
   *Fix needed:* Require `Authorization: Bearer <JWT>` header; extract `agentId` strictly from token.
3. `POST /api/v1/agent/orders/[id]/inspection`  
   *Current state:* Does not check caller token; accepts arbitrary `agentName`.  
   *Fix needed:* Validate agent JWT and enforce that the order is assigned to this agent.
4. `POST /api/v1/agent/upload-payment`  
   *Current state:* Does not check caller token.  
   *Fix needed:* Validate agent JWT.
5. `POST /api/v1/agent/orders/[id]/complete`  
   *Current state:* Does not check caller token.  
   *Fix needed:* Validate agent JWT.
6. `lib/middlewares/auth.ts` (`verifyAuthToken`)  
   *Current state:* Missing auth header automatically defaults to `role: "ADMIN"`.  
   *Fix needed:* Missing auth header must immediately return HTTP 401 Unauthorized.

### C. EXISTING BUT NEED MODIFICATION
1. `POST /api/v1/agent/upload-payment` — Needs `Idempotency-Key` header handling.
2. `POST /api/v1/agent/orders/[id]/complete` — Needs `Idempotency-Key` header handling.

### D. NOT CURRENTLY AVAILABLE — NEEDS NEW API
1. `POST /api/v1/agent/orders/[id]/pickup-failed` — **NEW API REQUIRED**.  
   Allows the field agent to report that a pickup failed (e.g. customer unavailable, fake device, customer refused offer) with failure reason, notes, and doorstep GPS location.
2. `GET /api/v1/agent/profile` — **NEW API REQUIRED**.  
   Returns the authenticated agent's profile, total pickups completed this month, and pending payout statistics.

---

## 11. Recommended Partner Mobile App API Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Field Agent (App)
    actor Customer as Customer (Doorstep)
    participant API as CashALL Next.js API
    participant DB as Supabase PostgreSQL
    participant Storage as Supabase Storage
    participant Sheets as Google Sheets
    participant Mail as Resend / SMTP

    Note over Agent,API: 1. AUTHENTICATION
    Agent->>API: POST /api/v1/agent/login { name, password }
    API-->>Agent: 200 OK { token, agentProfile }

    Note over Agent,API: 2. DISPATCH & SCHEDULE
    Agent->>API: GET /api/v1/agent/orders [SECURITY FIX REQUIRED]
    API-->>Agent: 200 OK { orders: [ #CA61962, ... ] }

    Note over Agent,Customer: 3. DOORSTEP ARRIVAL
    Agent->>API: POST /api/v1/orders/CA61962/start-inspection
    API->>DB: Status -> INSPECTION_STARTED
    API-->>Agent: 200 OK

    alt Case A: Customer Unavailable / Refusal
        Agent->>API: POST /api/v1/agent/orders/CA61962/pickup-failed [NEW API REQUIRED]
        API->>DB: Status -> CANCELLED, Pickup -> FAILED
        API-->>Agent: 200 OK (Pickup cancelled)
    else Case B: Successful Inspection
        Note over Agent,Customer: 4. PHYSICAL QC & IMEI CHECK
        Agent->>API: POST /api/v1/storage/upload (QC photos)
        API->>Storage: Store in 'qc-reports'
        API-->>Agent: 200 OK { signedUrl }

        Agent->>API: POST /api/v1/agent/orders/CA61962/inspection { imei, findings, revisedPrice }
        API->>DB: Status -> ACCEPTED, Locks finalPrice
        API-->>Agent: 200 OK

        Note over Agent,Customer: 5. KYC & E-SIGNATURE
        Agent->>API: POST /api/v1/orders/CA61962/verify-identity { idType, idNumber, fullName }
        API->>DB: Stores masked ID (XXXX-XXXX-9012)
        API-->>Agent: 200 OK

        Agent->>API: POST /api/v1/orders/CA61962/esign { signatureDataUrl, declaration }
        API->>DB: Stores SHA-256 documentHash
        API-->>Agent: 200 OK

        Note over Agent,Customer: 6. MANUAL UPI PAYMENT
        Customer->>Agent: Shows GPay / PhonePe QR / UPI ID
        Agent->>Customer: Transfers agreed final amount via Company UPI
        Agent->>API: POST /api/v1/agent/upload-payment { orderId, urn, file } (Idempotency-Key)
        API->>Storage: Store screenshot in 'payment-screenshots'
        API->>DB: Save URN & screenshot URL
        API-->>Agent: 200 OK

        Note over Agent,API: 7. ORDER COMPLETION & INVOICE
        Agent->>API: POST /api/v1/agent/orders/CA61962/complete { finalPrice, utr } (Idempotency-Key)
        API->>DB: Status -> COMPLETED, Payment -> PAID
        API->>Sheets: POST /api/sync-sheets (Logs transaction row)
        API->>Mail: Send Tax Invoice PDF to Customer Email
        API-->>Agent: 200 OK { orderCompleted: true, emailSent: true }

        Note over Agent,Customer: 8. RECEIPT DISPLAY
        Agent->>API: GET /api/v1/orders/CA61962/generate-bill
        API-->>Agent: 200 OK { billData } (Displays digital receipt)
    end
```

---

## 12. Developer Handoff Checklist

### What to Provide to the Partner App Developer
- [x] **This Handoff Document:** [`CASHALL_PARTNER_APP_API_HANDOFF.md`](file:///c:/Users/DELL/OneDrive/Desktop/CashALL/CASHALL_PARTNER_APP_API_HANDOFF.md)
- [x] **Production API Base URL:** `https://www.cashall.in/api/v1`
- [x] **Supabase Public Project URL:** `https://jqysknhobtpcbyyltnfc.supabase.co`
- [x] **Supabase Anon Key (Public Key):** JWT token with public read permissions (safe for client bundle).
- [x] **Firebase Web Configuration:** Client-side Firebase configuration (API key, project ID, sender ID) for phone authentication.
- [x] **Test Agent Credentials:**
  - Name: `SANGEET SHAW`
  - Registered Phone: `6289477287`
  - Default Password: `Ank933967@` (or agent phone number)

### What You Must NEVER Give to the Developer
- [ ] ❌ **`SUPABASE_SERVICE_ROLE_KEY`** (Bypasses all row-level security and grants root access to the entire database).
- [ ] ❌ **`DATABASE_URL` / Direct PostgreSQL connection strings** (Exposes direct database TCP ports and admin passwords).
- [ ] ❌ **`RESEND_API_KEY` / SMTP Passwords** (Must only be triggered server-side).
- [ ] ❌ **`GOOGLE_SHEETS_WEBHOOK_URL`** (Internal accounting webhook).
- [ ] ❌ **`META_CONVERSIONS_API_ACCESS_TOKEN`** (Marketing pixel access token).
- [ ] ❌ **Production Vercel Admin Access Tokens**.
