# CashALL Agent - Doorstep Pickup & Verification Android App

A dedicated mobile app for CashALL field pickup agents, delivering instant real-time loud siren alerts, haptic vibrations, date-based scheduling filters, 1-tap Google Maps doorstep navigation, and full doorstep inspection capabilities.

---

## 🌟 Key Features

1. **Urgent Loud Lead Siren & Phone Vibration (100% In-House, Zero Third-Party):**
   - Uses Android `AudioManager.STREAM_ALARM` with `AudioAttributes.USAGE_ALARM` to ring at full volume even if the phone is on Silent or Do-Not-Disturb.
   - Triggers aggressive hardware vibration patterns (`Vibrator` / `VibratorManager`) to alert the agent instantly when a new lead is assigned.
   - Seamless dual-layer fallback: Android Native Hardware Bridge + Web Audio API 920Hz-460Hz sawtooth oscillator.
   - Screen wake lock (`ACQUIRE_CAUSES_WAKEUP`) wakes the display so the agent immediately sees the assigned customer order.

2. **Scheduling Filters with Live Count Badges:**
   - **ALL TIME**
   - **TODAY**
   - **TOMORROW**
   - **DAY AFTER TOMORROW**
   - Instant search across Order #, Customer Name, Phone, IMEI, Device Model, Address, and Pincode.

3. **1-Tap Google Maps Doorstep Navigation:**
   - Every pickup card has an integrated **"Navigate on Google Maps"** action that launches Google Maps turn-by-turn navigation directly to the customer's doorstep.

4. **All Agent Web Capabilities Included:**
   - Barcode / IMEI scanning and validation.
   - Physical doorstep inspection QC test and dynamic re-quoting.
   - "View Customer Answers" negotiation helper modal.
   - Tesseract.js OCR payment screenshot extraction for 12-digit UTR/URN.
   - 1-click instant payout completion with automated tax invoice PDF delivery.
   - Customer offer rejection and cancellation with logged reasons.

---

## 📲 APK Installation

The compiled debug APK is located at:
- `CashALL-Agent.apk` (Project Root)
- `android-agent-app/app/build/outputs/apk/debug/app-debug.apk`

Transfer to any Android device running Android 8.0+ (API 26+) and install directly.
