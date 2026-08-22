import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { EmailService } from "@/lib/services/email.service";
import { logger } from "@/lib/utils/logger";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json().catch(() => ({}));
  const { finalPrice, utr } = body;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
  const cleanOrderNum = params.id.replace(/^#/, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: isUuid
        ? [{ id: params.id }, { orderNumber: cleanOrderNum }]
        : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
      deletedAt: null,
    },
    include: {
      user: true,
      address: true,
      agent: true,
      pickups: { include: { partner: true } },
      quote: { include: { variant: { include: { model: { include: { brand: true } } } } } },
    },
  });
  if (!order) throw new AppError("Order not found.", 404);

  const price = finalPrice || order.finalPrice || order.quote?.estimatedPrice || 0;
  const transactionRef = utr || order.urn || `PAID-${Date.now()}`;

  // 1. Create or update payment record
  const existingPayment = await prisma.payment.findFirst({ where: { orderId: order.id } });
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: price,
        method: "UPI",
        status: "PAID",
        transactionRef,
        paidAt: new Date(),
      },
    });
  } else {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        amount: price,
        status: "PAID",
        transactionRef,
        paidAt: new Date(),
      },
    });
  }

  // 2. Update order status to COMPLETED in Prisma
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "COMPLETED",
      finalPrice: price,
      urn: transactionRef,
    },
  });

  const agentName = order.agent?.name || order.pickups?.[0]?.notes || "CashALL Agent";
  const customerAddressStr = order.address
    ? `${order.address.house || ""}, ${order.address.street || ""}, ${order.address.city || ""}`
    : "Doorstep Address";
  const pincodeStr = order.address?.pincode || "—";
  const phoneStr = order.user?.phone || "—";

  // 3. Trigger Google Sheets Auto-Sync ONLY on COMPLETED Status
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const syncSheetsUrl = `${protocol}://${host}/api/sync-sheets`;

  fetch(syncSheetsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: new Date().toISOString().split("T")[0],
      urn: transactionRef,
      amountPaid: price,
      agentName,
      orderId: order.orderNumber,
      customerAddress: customerAddressStr,
      pincode: pincodeStr,
      customerPhone: phoneStr,
    }),
  }).catch((syncErr) =>
    logger.warn(`Google Sheets auto-sync notice on completion for order #${order.orderNumber}: ${syncErr.message}`)
  );

  // 4. Send PDF Invoice (with NO UTR) to customer via Resend API
  const customerEmail = order.user?.email || (order as any).customerEmail;
  if (customerEmail && customerEmail.includes("@")) {
    let deviceName = "Mobile Device";
    if (order.quote?.variant?.model) {
      const m = order.quote.variant.model;
      deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
    }

    EmailService.sendInvoicePdfEmail({
      to: customerEmail,
      orderNumber: order.orderNumber,
      customerName: order.user?.name || "Customer",
      customerPhone: phoneStr,
      customerAddress: customerAddressStr,
      deviceName,
      finalPrice: price,
      urn: transactionRef,
      agentName,
    }).catch((emailErr) => logger.error(`Failed to send PDF invoice email to ${customerEmail}:`, emailErr));
  }

  logger.info(`[ORDER COMPLETED] #${order.orderNumber} completed by Admin. Sheets synced & PDF invoice dispatched.`);

  return NextResponse.json({
    success: true,
    message: `Order ${order.orderNumber} marked as COMPLETED & PAID. Google Sheets synced & PDF invoice emailed.`,
    data: updatedOrder,
  });
});
