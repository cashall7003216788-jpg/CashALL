import nodemailer from "nodemailer";

async function testDomainSMTP() {
  const emailUser = "admin@cashall.in";
  const emailPass = "Ank933967@";
  const recipient = "sangeetshaw39@gmail.com";

  // List of potential SMTP hosts for cashall.in domain
  const hosts = [
    { host: "smtp.gmail.com", port: 465, secure: true, name: "Google Workspace" },
    { host: "smtp.gmail.com", port: 587, secure: false, name: "Google Workspace TLS" },
    { host: "smtp.titan.email", port: 465, secure: true, name: "Titan Mail (Hostinger/cPanel)" },
    { host: "smtp.hostinger.com", port: 465, secure: true, name: "Hostinger SMTP" },
    { host: "smtp.zoho.in", port: 465, secure: true, name: "Zoho India" },
    { host: "smtp.zoho.com", port: 465, secure: true, name: "Zoho Global" },
    { host: "mail.cashall.in", port: 465, secure: true, name: "Direct Domain Mail" },
  ];

  console.log(`=== TESTING SMTP CONNECTIONS FOR ${emailUser} ===`);

  for (const config of hosts) {
    try {
      console.log(`Trying ${config.name} (${config.host}:${config.port})...`);
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        connectionTimeout: 8000,
      });

      // Verify connection
      await transporter.verify();
      console.log(`SUCCESS! Verified SMTP server: ${config.name} (${config.host}:${config.port})`);

      // Try sending test email
      const info = await transporter.sendMail({
        from: `"CashALL Support" <support@cashall.in>`,
        to: recipient,
        replyTo: "support@cashall.in",
        subject: "CashALL Domain Verification Test — Official Tax Invoice #CA78994",
        text: "Official CashALL Purchase Receipt & Tax Invoice sent from support@cashall.in",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #111;">CashALL Official Purchase Receipt</h2>
            <p>This email is sent directly from official domain <strong>support@cashall.in</strong>.</p>
            <p>Order ID: <strong>CA78994</strong></p>
            <p>Amount Paid: <strong>₹3,500</strong></p>
          </div>
        `,
      });

      console.log(`🎉 LIVE MAIL SENT SUCCESSFULLY via ${config.name}! MessageId: ${info.messageId}`);
      console.log(`Server Response:`, info.response);
      return config;
    } catch (err: any) {
      console.log(`❌ Failed on ${config.name} (${config.host}:${config.port}): ${err.message}`);
    }
  }

  console.log("=== COMPLETED TESTING ALL SMTP SERVERS ===");
}

testDomainSMTP().catch(console.error);
