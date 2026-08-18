import { Resend } from "resend";
import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey && !resendApiKey.startsWith("re_mock") ? new Resend(resendApiKey) : null;

const gmailUser = process.env.GMAIL_USER || "cashall7003216788@gmail.com";
const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;

// Nodemailer SMTP Transporter for Gmail (cashall7003216788@gmail.com)
const smtpTransporter = gmailPass
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })
  : null;

export class EmailService {
  /**
   * Sends an email using Nodemailer (Gmail), Resend, or logs clean trace.
   */
  static async sendEmail(to: string, subject: string, html: string) {
    const fromAddress = process.env.EMAIL_FROM || `CashALL <${gmailUser}>`;

    // 1. Try sending via Gmail SMTP if App Password is provided
    if (smtpTransporter) {
      try {
        const info = await smtpTransporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });
        logger.info(`Email sent via Gmail SMTP (${gmailUser}) to ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId, provider: "GMAIL_SMTP" };
      } catch (error) {
        logger.error(`Error sending email via Gmail SMTP to ${to}:`, error);
      }
    }

    // 2. Try sending via Resend API if Resend Key is configured
    if (resend) {
      try {
        const data = await resend.emails.send({
          from: fromAddress,
          to,
          subject,
          html,
        });
        logger.info(`Email sent via Resend API to ${to}. Resend ID: ${data.data?.id}`);
        return { success: true, id: data.data?.id, provider: "RESEND" };
      } catch (error) {
        logger.error(`Error sending email via Resend API to ${to}:`, error);
      }
    }

    // 3. Simulated trace in development or before SMTP App Password entry
    logger.info(`[EMAIL SERVICE] Sending from ${gmailUser} to ${to}: "${subject}"`);
    console.log(`\n============================ CASHALL GMAIL DISPATCH TRACE ============================`);
    console.log(`FROM: ${fromAddress}`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TIMESTAMP: ${new Date().toISOString()}`);
    console.log(`======================================================================================\n`);
    return { success: true, simulated: true, senderEmail: gmailUser };
  }

  /**
   * Compiles HTML template for User Welcome.
   */
  static compileWelcomeTemplate(userName: string) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #000000; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #FACC15; margin: 0; font-size: 24px; font-weight: 800;">CashALL</h1>
          <p style="color: #ffffff; margin: 4px 0 0 0; font-size: 12px;">Best Value For Your Old Devices</p>
        </div>
        <h2 style="color: #111; margin-top: 0;">Welcome to CashALL, ${userName}! 👋</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #444;">Thank you for choosing CashALL. We make selling your old mobile phones and laptops simple, fast, and secure.</p>
        <p style="font-size: 14px; line-height: 1.5; color: #444;">Get instant doorstep inspections, transparent price calculations, and immediate bank transfers.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 24px 0;" />
        <p style="font-size: 11px; color: #888888; text-align: center;">CashALL | AARNA ENTERPRISE | cashall7003216788@gmail.com | Helpline: 7003216788</p>
      </div>
    `;
  }

  /**
   * Compiles HTML template for Quote Saved.
   */
  static compileQuoteTemplate(quoteNumber: string, deviceName: string, estimatedPrice: number) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
        <div style="background-color: #000; padding: 14px; text-align: center; border-radius: 8px; margin-bottom: 16px;">
          <h1 style="color: #FACC15; margin: 0; font-size: 20px;">CashALL</h1>
        </div>
        <h2 style="color: #111;">Device Price Estimate 📱</h2>
        <p>We have calculated your device estimate:</p>
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
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #16a34a; font-weight: bold; font-size: 16px;">₹${estimatedPrice}</td>
          </tr>
        </table>
        <p>Go to CashALL to schedule your doorstep pickup now!</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 24px 0;" />
        <p style="font-size: 11px; color: #888888; text-align: center;">CashALL | cashall7003216788@gmail.com</p>
      </div>
    `;
  }

  /**
   * Compiles HTML template for Final Settled Payout & Tax Receipt.
   */
  static compilePayoutTemplate(orderNumber: string, amount: number, referenceId: string, customerName?: string, deviceName?: string) {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- HEADER -->
        <div style="background-color: #000000; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #FACC15; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">CashALL</h1>
          <p style="color: #ffffff; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">OFFICIAL PURCHASE RECEIPT & TAX INVOICE</p>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <span style="color: #166534; font-size: 13px; font-weight: 700;">STATUS: TRANSACTION COMPLETED — Instant UPI Transferred</span>
        </div>

        <p style="font-size: 15px; color: #111; font-weight: 600; margin-bottom: 8px;">Hello ${customerName || "Valued Customer"},</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin-top: 0;">Your physical inspection and final rate evaluation for order <strong>#${orderNumber}</strong> have been completed. Full payment has been successfully transferred to your bank account via instant UPI.</p>

        <!-- RECEIPT TABLE -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr style="background-color: #f9fafb;">
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 700; color: #374151;">Order ID</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; color: #111827; font-weight: 600;">${orderNumber}</td>
          </tr>
          ${deviceName ? `
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 700; color: #374151;">Device Purchased</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; color: #111827; font-weight: 600;">${deviceName}</td>
          </tr>` : ""}
          <tr style="background-color: #f9fafb;">
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 700; color: #374151;">Final Price Paid</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; color: #16a34a; font-weight: 800; font-size: 16px;">₹${amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 700; color: #374151;">Payment Mode</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; color: #111827;">Instant UPI / Bank Transfer</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; font-weight: 700; color: #374151;">UTR / Transaction Ref</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; color: #111827; font-family: monospace; font-weight: 600;">${referenceId}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://cashall.in/order/${orderNumber}/bill" style="background-color: #FACC15; color: #000000; padding: 12px 24px; font-weight: 800; text-decoration: none; border-radius: 10px; display: inline-block; font-size: 14px;">View Official PDF Bill</a>
        </div>

        <p style="font-size: 12px; color: #6b7280; line-height: 1.4;">This automated email serves as your official purchase acknowledgment and transaction record from AARNA ENTERPRISE (Parent Company of CashALL).</p>

        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 24px 0;" />
        <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">CashALL | GSTIN: 19AVPPG9800J1Z3 | cashall7003216788@gmail.com | Helpline: +91 7003216788 | www.cashall.in</p>
      </div>
    `;
  }
}
