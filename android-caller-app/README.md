# CashALL Caller — Dedicated Android Telecalling & Recording App

A custom, native Android application built specifically for CashALL customer support and telecalling staff. It wraps the CashALL Support Console, monitors phone calls via native Android telephony APIs, records call audio (using Android Accessibility Service), and automatically uploads the call duration, timestamp, and audio MP3/M4A directly to your CashALL Admin Portal.

---

## Key Features

1. **Mandatory Permission Onboarding Gate**:
   - The app verifies:
     - 📞 **Phone State & Call Log Permissions** (tracks exact start/end time and phone numbers).
     - 🎙️ **Microphone & Audio Permissions** (records customer conversations).
     - ⚙️ **Accessibility Service** (bypasses Android 10–14 two-way call recording restrictions without third-party services).
   - Staff cannot proceed to the calling desk unless all permissions are active.

2. **Native 1-Tap Calling**:
   - Tapping any customer phone number inside the app immediately dials the number via the phone's native SIM card.

3. **Automatic Recording & Duration Calculation**:
   - Detects when the call connects (`OFFHOOK`) and begins recording.
   - Detects when the call finishes (`IDLE`), calculates talk duration in seconds, and stops the recording.

4. **Reliable Background Upload**:
   - Automatically uploads the audio file, duration, customer phone, and agent name to `https://cashall.in/api/v1/support/recordings`.
   - Cleans up local temporary audio files after successful upload to save phone storage.

5. **In-Browser Audio Player for Admin**:
   - Admin can listen to any recorded call directly on `https://cashall.in/admin/support`.

---

## How to Build the APK

### Option 1: Using Android Studio (Easiest)
1. Open **Android Studio** on your computer.
2. Select **Open** and choose this folder:
   `c:\Users\DELL\OneDrive\Desktop\CashALL\android-caller-app`
3. Wait for Gradle sync to complete.
4. Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
5. Once built, click **locate** to get `app-debug.apk`.

### Option 2: Using Command Line
Open PowerShell or Terminal inside `android-caller-app/` and run:
```bash
# Windows
gradlew.bat assembleDebug

# Linux / Mac
./gradlew assembleDebug
```
The output APK will be generated at:
`android-caller-app/app/build/outputs/apk/debug/app-debug.apk`

---

## How to Install & Configure on Her Phone (Takes 3 Minutes)

1. **Send the APK to Her Phone:**
   - Send `app-debug.apk` via WhatsApp, Google Drive, or USB cable.
   - Tap the APK on her phone to install (allow "Install from Unknown Sources" if prompted).

2. **Open CashALL Caller:**
   - Launch the app from her home screen.
   - You will see the **Mandatory Setup Required** screen.

3. **Grant Calling & Audio Permissions:**
   - Tap **"Grant Calling & Audio Permissions"** -> Tap **"While using the app"** / **"Allow"** for Phone and Microphone.

4. **Enable Accessibility Service (Crucial for Audio Recording):**
   - Tap **"Enable Call Recording in Settings"**.
   - Her phone's Accessibility Settings will open.
   - Look for **"CashALL Caller"** in the list (or under "Downloaded Apps").
   - Switch it **ON** and tap **Allow**.

5. **Start Calling:**
   - Return to the app. The CashALL Support Desk will open immediately!
   - Log in with her **Username & Password** (configured in `/admin/support`).
   - Every call she makes will now be automatically recorded, timed, and sent directly to your CashALL Admin Portal.

---

## Testing & Admin Verification

1. Log into your Admin Portal:
   `https://cashall.in/admin/support`
2. Scroll down to **"Customer Call Audio Recordings"**.
3. Every call she completes will show:
   - Agent Name & Phone
   - Customer Dialed & Quote ID
   - Exact Duration Badge (e.g. `2m 45s`)
   - Outcome Badge
   - **Interactive Audio Player** (`[▶ Play / Pause]`)
   - **Download MP3** button
