import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { OrderStateMachine } from "@/lib/services/order-state";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().min(1, "Payment amount required"),
  upiId: z.string().min(3, "UPI ID / PhonePe / Paytm handle required"),
  utrNumber: z.string().min(6, "UTR / Transaction reference required"),
  paymentProofUrl: z.string().optional(),
  isCorporateAccount: z.boolean().default(true),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const validation = paymentSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const data = validation.data;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
  });
  if (!order) throw new AppError("Order not found.", 404);

  // Lock Payment Amount Validation: Recorded amount MUST match accepted final price
  const expectedPrice = order.finalPrice ?? 0;
  if (Math.abs(data.amount - expectedPrice) > 1) {
    // Check if user is admin overriding threshold
    if (decodedUser.role !== "ADMIN" && decodedUser.role !== "SUPER_ADMIN") {
      throw new AppError(
        `Payment amount (₹${data.amount}) does not match accepted final price (₹${expectedPrice}). Admin approval required.`,
        400
      );
    }
  }

  OrderStateMachine.assertTransition(order.status, "PAYMENT_CONFIRMED");

  // Create Payment record
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: data.amount,
      method: "UPI",
      status: "PAID",
      transactionRef: data.utrNumber,
      upiId: data.upiId,
      utrNumber: data.utrNumber,
      paymentProofUrl: data.paymentProofUrl || null,
      recordedBy: decodedUser.uid,
      isCorporateAccount: data.isCorporateAccount,
      paidAt: new Date(),
    },
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAYMENT_CONFIRMED" },
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "PAYMENT_CONFIRMED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "PAYMENT_CONFIRMED", amount: data.amount, utr: data.utrNumber },
  });

  return NextResponse.json({
    success: true,
    message: "Manual UPI payment recorded & confirmed.",
    data: { payment, order: updatedOrder },
  });
});
