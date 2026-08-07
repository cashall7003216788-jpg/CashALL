import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { payoutServiceInstance } from "@/lib/services/payment.service";
import { z } from "zod";

const processPayoutSchema = z.object({
  paymentMethod: z.enum(["BANK_TRANSFER", "UPI"], {
    required_error: "paymentMethod is required",
  }),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
  accountHolderName: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN", "EMPLOYEE"], decodedUser.role);

  const orderIdentifier = params.id;
  const body = await req.json();
  const validation = processPayoutSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const data = validation.data;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { orderNumber: orderIdentifier },
      ],
      deletedAt: null,
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (order.status !== "ACCEPTED" && order.status !== "INSPECTION_COMPLETED") {
    throw new AppError("Order is not ready for payment. Inspection must be completed first.", 400);
  }

  const payoutResult = await payoutServiceInstance.processPayout({
    orderId: order.id,
    amount: order.finalPrice,
    paymentMethod: data.paymentMethod,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
    upiId: data.upiId,
    accountHolderName: data.accountHolderName,
  });

  if (!payoutResult.success) {
    throw new AppError(`Payout transaction failed: ${payoutResult.message}`, 500);
  }

  await prisma.adminLog.create({
    data: {
      adminUserId: decodedUser.uid,
      action: "PROCESS_PAYOUT",
      details: JSON.stringify({
        orderNumber: order.orderNumber,
        amount: order.finalPrice,
        paymentMethod: data.paymentMethod,
        transactionId: payoutResult.transactionId,
        referenceId: payoutResult.referenceId,
      }),
    },
  });

  return NextResponse.json({
    success: true,
    data: payoutResult,
  });
});
