/**
 * WhatsApp notification service using CallMeBot API
 * Registration: Send "I allow callmebot to send me messages" to +34 644 44 00 36 on WhatsApp
 * Then add CALLMEBOT_API_KEY to Vercel env vars.
 * Until then, uses a direct wa.me fallback log only.
 */

const ADMIN_PHONE = "917003216788"; // Country code + number
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || "";

export class WhatsAppService {
  static async sendToAdmin(message: string): Promise<void> {
    if (!CALLMEBOT_API_KEY) {
      // Log only — no API key yet
      console.log(`[WhatsApp PENDING KEY] Would send to ${ADMIN_PHONE}: ${message}`);
      return;
    }

    try {
      const encoded = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_PHONE}&text=${encoded}&apikey=${CALLMEBOT_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[WhatsApp] Failed: ${res.status}`);
      } else {
        console.log(`[WhatsApp] Sent OK to ${ADMIN_PHONE}`);
      }
    } catch (err) {
      console.error("[WhatsApp] Error:", err);
    }
  }

  static async notifyNewOrder(params: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deviceName: string;
    estimatedPrice: number;
    pickupDate: string;
    pickupTimeSlot: string;
    address: string;
  }): Promise<void> {
    const msg =
      `🆕 NEW CASHALL ORDER\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order: ${params.orderNumber}\n` +
      `👤 Customer: ${params.customerName}\n` +
      `📱 Phone: ${params.customerPhone}\n` +
      `📟 Device: ${params.deviceName}\n` +
      `💰 Valuation: ₹${params.estimatedPrice.toLocaleString("en-IN")}\n` +
      `📅 Pickup: ${params.pickupDate} (${params.pickupTimeSlot})\n` +
      `📍 Address: ${params.address}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👉 Admin: cashall.in/admin/orders`;
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
    const msg =
      `✅ PAYMENT CONFIRMED\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order: ${params.orderNumber}\n` +
      `👤 Customer: ${params.customerName}\n` +
      `📟 Device: ${params.deviceName}\n` +
      `💸 Paid: ₹${params.paidAmount.toLocaleString("en-IN")}\n` +
      (params.upiId ? `🏦 UPI: ${params.upiId}\n` : "") +
      (params.utrNumber ? `🔑 UTR: ${params.utrNumber}\n` : "") +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👉 Generate Bill: cashall.in/admin/orders`;
    await this.sendToAdmin(msg);
  }
}
