/**
 * WhatsApp notification service
 * Uses CallMeBot API — owner must register at https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * by sending "I allow callmebot to send me messages" to +34 644 44 00 36 on WhatsApp.
 * Set CALLMEBOT_API_KEY in environment variables after registration.
 *
 * FALLBACK: If no API key, messages are queued as console logs with a wa.me direct link.
 */

const ADMIN_PHONE = "917003216788"; // +91 7003216788
const ADMIN_PHONE_DISPLAY = "7003216788";
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cashall.in";

export class WhatsAppService {
  static async sendToAdmin(message: string): Promise<void> {
    if (!CALLMEBOT_API_KEY) {
      // Fallback: log with a wa.me deep link for manual sending
      const encoded = encodeURIComponent(message);
      const waLink = `https://wa.me/${ADMIN_PHONE}?text=${encoded}`;
      console.log(`[WhatsApp] NO API KEY — Direct link: ${waLink}`);
      console.log(`[WhatsApp] Message content:\n${message}`);
      return;
    }

    try {
      const encoded = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_PHONE}&text=${encoded}&apikey=${CALLMEBOT_API_KEY}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.error(`[WhatsApp] CallMeBot failed: HTTP ${res.status}`);
      } else {
        console.log(`[WhatsApp] ✅ Sent to +91 ${ADMIN_PHONE_DISPLAY}`);
      }
    } catch (err) {
      console.error("[WhatsApp] Send error:", err);
    }
  }

  static async notifyNewOrder(params: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deviceName: string;
    estimatedPrice: number;
    pickupDate: string | null;
    pickupTimeSlot: string | null;
    address: string;
  }): Promise<void> {
    const adminLink = `${SITE_URL}/admin/orders`;
    const msg =
      `🆕 *NEW CASHALL ORDER*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order: *${params.orderNumber}*\n` +
      `👤 Customer: ${params.customerName}\n` +
      `📱 Phone: ${params.customerPhone}\n` +
      `📟 Device: *${params.deviceName}*\n` +
      `💰 Valuation: *₹${(params.estimatedPrice || 0).toLocaleString("en-IN")}*\n` +
      `📅 Pickup: ${params.pickupDate || "Scheduled"} (${params.pickupTimeSlot || "TBD"})\n` +
      `📍 Address: ${params.address}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👉 View Order: ${adminLink}`;
    await this.sendToAdmin(msg);
  }

  static async notifyBillGenerated(params: {
    orderNumber: string;
    customerName: string;
    deviceName: string;
    paidAmount: number;
    billUrl: string;
  }): Promise<void> {
    const adminLink = `${SITE_URL}/admin/orders`;
    const msg =
      `🧾 *BILL GENERATED — CASHALL*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order: *${params.orderNumber}*\n` +
      `👤 Customer: ${params.customerName}\n` +
      `📟 Device: ${params.deviceName}\n` +
      `💸 Amount Paid: *₹${params.paidAmount.toLocaleString("en-IN")}*\n` +
      `🧾 Bill: ${params.billUrl}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👉 Admin: ${adminLink}`;
    await this.sendToAdmin(msg);
  }

  static async notifyPaymentDone(params: {
    orderNumber: string;
    customerName: string;
    deviceName: string;
    paidAmount: number;
    upiId?: string;
    utrNumber?: string;
  }): Promise<void> {
    const adminLink = `${SITE_URL}/admin/orders`;
    const msg =
      `✅ *PAYMENT CONFIRMED — CASHALL*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order: *${params.orderNumber}*\n` +
      `👤 Customer: ${params.customerName}\n` +
      `📟 Device: ${params.deviceName}\n` +
      `💸 Paid: *₹${params.paidAmount.toLocaleString("en-IN")}*\n` +
      (params.upiId ? `🏦 UPI: ${params.upiId}\n` : "") +
      (params.utrNumber ? `🔑 UTR: ${params.utrNumber}\n` : "") +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👉 Generate Bill: ${adminLink}`;
    await this.sendToAdmin(msg);
  }
}
