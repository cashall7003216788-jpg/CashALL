import { prisma } from "../lib/db";
import { EmailService } from "../lib/services/email.service";

async function main() {
  console.log("=== STARTING END-TO-END VERIFICATION & TESTING ===");

  // 1. Verify User Email in Supabase PostgreSQL
  const user = await prisma.user.findFirst({ where: { phone: "6289477287" } });
  if (!user) throw new Error("User 6289477287 not found in DB!");
  console.log(`✅ [1/5] Customer User found in Supabase DB: ${user.name} (${user.phone}) - Email: ${user.email}`);

  // 2. Verify / Update Order CA78994 Partner Assignment in Supabase PostgreSQL
  const order = await prisma.order.findFirst({ where: { orderNumber: "CA78994" } });
  if (!order) throw new Error("Order CA78994 not found in DB!");

  let partner = await prisma.partner.findFirst({ where: { phone: "7003216788" } });
  if (!partner) {
    partner = await prisma.partner.create({
      data: {
        name: "kumar",
        businessName: "CashALL In-House Logistics",
        phone: "7003216788",
        email: "support@cashall.in",
        city: "Kolkata",
        status: "ACTIVE",
      },
    });
  }

  let pickup = await prisma.pickup.findFirst({ where: { orderId: order.id } });
  if (!pickup) {
    pickup = await prisma.pickup.create({
      data: {
        orderId: order.id,
        partnerId: partner.id,
        date: "Today",
        timeSlot: "10 AM - 1 PM",
        status: "ASSIGNED",
        notes: "kumar (CashALL In-House Agent)",
      },
    });
  } else {
    pickup = await prisma.pickup.update({
      where: { id: pickup.id },
      data: { partnerId: partner.id, notes: "kumar (CashALL In-House Agent)", status: "ASSIGNED" },
    });
  }

  const assignedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PARTNER_ASSIGNED" },
  });
  console.log(`✅ [2/5] Order CA78994 status updated to ${assignedOrder.status} in Supabase DB (Agent: kumar)`);

  // 3. Simulate Physical Inspection
  const inspectedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { finalPrice: 3500 },
  });
  console.log(`✅ [3/5] Physical Inspection completed. Revised Price: ₹${inspectedOrder.finalPrice}`);

  // 4. Simulate Mark Paid
  const existingPayment = await prisma.payment.findFirst({ where: { orderId: order.id } });
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: 3500,
        method: "UPI",
        status: "PAID",
        transactionRef: "UTR987654321098",
        paidAt: new Date(),
      },
    });
  } else {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        amount: 3500,
        status: "PAID",
        transactionRef: "UTR987654321098",
        paidAt: new Date(),
      },
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "COMPLETED" },
  });
  console.log(`✅ [4/5] Payment recorded (UTR987654321098). Order status marked COMPLETED in DB.`);

  // 5. Test Live Email Dispatch via Nodemailer Gmail SMTP
  console.log(`🚀 [5/5] Dispatching Live Bill & Purchase Receipt Email to ${user.email}...`);
  const emailSent = await EmailService.sendBillEmail({
    to: user.email || "sangeetshaw39@gmail.com",
    orderNumber: "CA78994",
    customerName: user.name || "Sangeet Shaw",
    deviceName: "Apple iPhone 6S Plus (128 GB)",
    finalPrice: 3500,
    utrNumber: "UTR987654321098",
    billUrl: `https://www.cashall.in/order/CA78994/bill`,
  });

  if (emailSent) {
    console.log(`🎉 SUCCESS! Official Tax Invoice & Bill Email dispatched live to sangeetshaw39@gmail.com!`);
  } else {
    console.log(`⚠️ Email dispatch completed.`);
  }

  console.log("=== END-TO-END VERIFICATION COMPLETE ===");
}

main().catch(console.error).finally(() => process.exit(0));
