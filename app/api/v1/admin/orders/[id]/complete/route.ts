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
  const { finalPrice, utr, upiId } = body;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      quote: { include: { variant: { include: { model: { include: { brand: true } } } } } },
    },
  });
  if (!order) throw new AppError("Order not found.", 404);

  const price = finalPrice || order.finalPrice || order.quote?.estimatedPrice || 0;
  const transactionRef = utr || `ADMIN-${Date.now()}`;

  // Create payment record if not exists
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
  }

  // Force update order status to COMPLETED
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "COMPLETED",
      finalPrice: price,
    },
  });

  // Automatically send Tax Invoice & Receipt email to customer if email is available
  if (order.user?.email) {
    const customerEmail = order.user.email;
    const deviceName = order.quote?.breakdownJson
      ? (JSON.parse(order.quote.breakdownJson || "{}").deviceName || "Mobile Device")
      : "Mobile Device";

    const emailHtml = EmailService.compilePayoutTemplate(
      order.orderNumber,
      price,
      transactionRef
    );

    EmailService.sendEmail(
      customerEmail,
      `Tax Invoice & Payment Receipt for Order #${order.orderNumber} - CashALL`,
      emailHtml
    ).catch((err) => logger.error(`Failed to send bill email to ${customerEmail}:`, err));
  }

  return NextResponse.json({
    success: true,
    message: `Order ${order.orderNumber} completed & payment receipt dispatched.`,
    data: updatedOrder,
  });
});
