# CashALL

**CashALL** is a modern Indian recommerce platform enabling customers to sell used mobile phones with transparent price valuation, free doorstep pickup, physical verification, price revision approval, and instant direct payment.

---

## 🌟 Key Features

### Customer Journey
1. **Homepage & Instant Device Search**: Live search autocomplete for top smartphone brands and models.
2. **Brand & Model Selection**: Structured catalog navigation across 10 top brands (Apple, Samsung, OnePlus, Xiaomi, Vivo, Oppo, Realme, Motorola, Google, Nothing).
3. **Condition Assessment Engine**: 5-step questionnaire wizard (Power, Screen, Body, Functional status, Accessories).
4. **Deterministic Pricing Engine**: Base valuation + bonus accessories - itemized condition deductions.
5. **Transparent Quote Display**: Clear itemized breakdown card with 48-hour quote validity countdown.
6. **Phone Verification**: 6-digit OTP verification flow.
7. **Serviceability PIN Check**: Coverage verification across Indian cities (110001, 400001, 560001, etc.).
8. **Doorstep Pickup Scheduling**: Address collection and date/time window selector.
9. **Order Placement**: Human-readable Order ID generation (e.g. `CA10482`).
10. **Live Order Tracking & Inspection**: Milestone stepper, physical inspection comparison (Declared vs Inspected), revised offer approval/decline, instant payment tracking, and in-app digital handover certificate.

### Admin Operations Portal (`/admin`)
- **Protected Access**: Role-based authentication (`cashall7003216788@gmail.com`).
- **Dashboard Overview**: Operational KPIs (Quotes, Orders, Pickups, Revenue, Completed Sales).
- **Device Catalog**: Brands, Models, and Storage Variants CRUD.
- **Pricing Matrix Manager**: Real-time adjustment of base prices and deduction rules without altering code.
- **Physical Inspection Entry**: IMEI logging, physical screen/body findings, automated revised quote calculation, and customer notification.
- **Pickup Dispatcher**: Partner assignment and status workflow.
- **Service Area Manager**: Pincode activation manager.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom brand colors (`#FFD400`, `#050505`, `#F7F7F5`)
- **Icons**: Lucide React
- **Database & Data Layer**: Prisma ORM with SQLite file/in-memory engine & fallback store abstraction
- **State Management**: Reactive React state & persistent local storage snapshotting

---

## 💻 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database & Seed Data**:
   ```bash
   npx prisma db push
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Access Admin Portal**:
   Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - **Email**: `cashall7003216788@gmail.com`
   - **Password**: Configured admin password.

---

## 🧪 Testing Complete Customer & Admin Flow

1. Land on Homepage `http://localhost:3000`.
2. Search for "iPhone 15" or click **Apple**.
3. Select **128 GB** storage variant.
4. Complete the 5-step condition assessment wizard.
5. Review transparent quote calculation (`₹31,400`).
6. Click **SCHEDULE FREE PICKUP** -> enter name & mobile number -> enter demo OTP `123456`.
7. Enter PIN code `110001`, complete pickup address and time slot -> Click **CONFIRM FREE PICKUP**.
8. View order confirmation with Order ID `CA10482` -> Click **TRACK ORDER STATUS**.
9. Log in to Admin Portal `http://localhost:3000/admin/login`.
10. Open **Inspections** -> submit physical finding with revised offer (`₹29,800`).
11. Refresh Customer tracking page -> view transparent price revision breakdown -> Click **ACCEPT OFFER** -> view In-App Handover Certificate.
