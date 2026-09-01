import nodemailer from "nodemailer";

async function testGmailInbox() {
  const gmailUser = "cashall7003216788@gmail.com";
  const gmailPass = "lkba sysu psuq cclk";
  const recipient = "sangeetshaw39@gmail.com";

  console.log(`Configuring Gmail SMTP transporter for ${gmailUser}...`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const subject = `CashALL Tax Invoice & Purchase Receipt #CA78994 — ₹3,500`;
  const textContent = `CashALL Official Purchase Receipt & Tax Invoice
Order ID: CA78994
Status: TRANSACTION COMPLETED
Final Price Paid: ₹3,500
Payment Method: Instant UPI / Bank Transfer
UTR Ref: UTR987654321098
View Bill online: https://www.cashall.in/order/CA78994/bill

Thank you for choosing CashALL!`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #000000; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #FACC15; margin: 0; font-size: 26px; font-weight: 900;">CashALL</h1>
        <p style="color: #ffffff; margin: 4px 0 0 0; font-size: 12px;">OFFICIAL PURCHASE RECEIPT & TAX INVOICE</p>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; margin-bottom: 20px; text-align: center; color: #166534; font-size: 13px; font-weight: 700;">
        STATUS: TRANSACTION COMPLETED — Instant UPI Transferred
      </div>

      <p style="font-size: 14px; font-weight: 600;">Hello Sangeet Shaw,</p>
      <p style="font-size: 13px; color: #4b5563;">Your payment of <strong>₹3,500</strong> for Order <strong>#CA78994</strong> (Apple iPhone 6S Plus) has been transferred successfully.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
        <tr style="background-color: #f9fafb;">
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 700;">Order ID</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">CA78994</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 700;">Final Amount Paid</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: #16a34a; font-weight: 800; font-size: 15px;">₹3,500</td>
        </tr>
        <tr style="background-color: #f9fafb;">
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 700;">Bank UTR Reference</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-family: monospace; font-weight: 700;">UTR987654321098</td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 24px;">
        CashALL | AARNA ENTERPRISE | support@cashall.in | Helpline: 7604092333
      </p>
    </div>
  `;

  console.log(`Sending email to ${recipient}...`);

  const info = await transporter.sendMail({
    from: `"CashALL Official" <${gmailUser}>`,
    to: recipient,
    replyTo: gmailUser,
    subject: subject,
    text: textContent,
    html: htmlContent,
  });

  console.log(`✅ Mail sent successfully! MessageId: ${info.messageId}`);
  console.log(`Accepted recipients:`, info.accepted);
  console.log(`Rejected recipients:`, info.rejected);
  console.log(`Response output:`, info.response);
}

testGmailInbox().catch(console.error);
