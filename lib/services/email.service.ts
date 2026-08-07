import { Resend } from "resend";
import { logger } from "../utils/logger";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export class EmailService {
  /**
   * Sends an email using the Resend service.
   */
  static async sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
      logger.warn(`Resend API Key missing. Simulating sending email to ${to}: ${subject}`);
      return;
    }

    try {
      const data = await resend.emails.send({
        from: "CashALL <no-reply@cashall.in>",
        to,
        subject,
        html,
      });

      logger.info(`Email sent successfully to ${to}. Resend ID: ${data.data?.id}`);
      return data;
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);
    }
  }

  /**
   * Compiles HTML template for User Welcome.
   */
  static compileWelcomeTemplate(userName: string) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to CashALL, ${userName}! 👋</h2>
        <p>Thank you for choosing CashALL. We make selling your old mobile phones and laptops simple, fast, and secure.</p>
        <p>Get instant doorstep inspections, transparent price calculations, and immediate bank transfers.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message from CashALL. Please do not reply directly.</p>
      </div>
    `;
  }

  /**
   * Compiles HTML template for Quote Saved.
   */
  static compileQuoteTemplate(quoteNumber: string, deviceName: string, estimatedPrice: number) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>CashALL Device Estimate 📱</h2>
        <p>We have saved your valuation estimate for the following device:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Quote Number</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${quoteNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Device</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${deviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Estimated Payout</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #22c55e; font-weight: bold;">₹${estimatedPrice}</td>
          </tr>
        </table>
        <p>This quote is valid for 48 hours. Go to the app to schedule your doorstep pickup now!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message from CashALL. Please do not reply directly.</p>
      </div>
    `;
  }

  /**
   * Compiles HTML template for Order Checkout.
   */
  static compileOrderTemplate(orderNumber: string, deviceName: string, pickupDate: string, timeSlot: string) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Order Confirmed! 🎉</h2>
        <p>Your order <strong>#${orderNumber}</strong> has been successfully created. An inspection agent will visit you soon.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Device</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${deviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Pickup Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${pickupDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Time Slot</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${timeSlot}</td>
          </tr>
        </table>
        <p>Keep your device charged and backup your data before our agent arrives.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message from CashALL. Please do not reply directly.</p>
      </div>
    `;
  }

  /**
   * Compiles HTML template for Payout Done.
   */
  static compilePayoutTemplate(orderNumber: string, amount: number, referenceId: string) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Payment Transferred! 💸</h2>
        <p>Great news! Instant payout for your order <strong>#${orderNumber}</strong> has been successfully credited to your bank account.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Credited Amount</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #22c55e; font-weight: bold;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Transaction Ref</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${referenceId}</td>
          </tr>
        </table>
        <p>Thank you for selling with CashALL!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message from CashALL. Please do not reply directly.</p>
      </div>
    `;
  }
}
