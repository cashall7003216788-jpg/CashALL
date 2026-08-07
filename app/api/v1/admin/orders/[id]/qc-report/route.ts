import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { PricingService, SelectedAnswer } from "@/lib/services/pricing.service";
import { NotificationHelper } from "@/lib/services/notification.helper";
import { z } from "zod";

const logQcReportSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      questionTitle: z.string(),
      group: z.string(),
      optionId: z.string(),
      optionLabel: z.string(),
    })
  ),
  imei: z.string().min(15, "IMEI must be at least 15 digits"),
  inspectorNotes: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN", "EMPLOYEE"], decodedUser.role);

  const orderIdentifier = params.id;
  const body = await req.json();
  const validation = logQcReportSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const { answers, imei, inspectorNotes } = validation.data;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { orderNumber: orderIdentifier },
      ],
      deletedAt: null,
    },
    include: { quote: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  const originalQuote = order.quote;
  const qcResult = await PricingService.calculateQuote(originalQuote.variantId, answers as SelectedAnswer[]);

  const originalPrice = originalQuote.estimatedPrice;
  const revisedPrice = qcResult.estimatedPrice;

  const isPriceDifferent = originalPrice !== revisedPrice;

  const updatedOrder = await prisma.$transaction(async (tx) => {
    // 1. Create QC Report
    await tx.qcReport.create({
      data: {
        orderId: order.id,
        inspectorName: decodedUser.email || "Inspector",
        imeiNumber: imei,
        declaredAnswersJson: order.quote.selectedAnswersJson,
        physicalAnswersJson: JSON.stringify(answers),
        revisedPrice,
        priceDifferenceReason: inspectorNotes || (isPriceDifferent ? "Doorstep physical inspection mismatch." : null),
        status: isPriceDifferent ? "PENDING_APPROVAL" : "APPROVED",
        inspectedAt: new Date(),
      },
    });

    // 2. Create IMEI Record
    await tx.imei.create({
      data: {
        orderId: order.id,
        code: imei,
        status: "VERIFIED",
      },
    });

    // 3. Handle revised pricing offer
    if (isPriceDifferent) {
      await tx.offer.create({
        data: {
          orderId: order.id,
          originalPrice,
          revisedPrice,
          priceDifferenceReason: inspectorNotes || "Doorstep physical inspection mismatch.",
          status: "PENDING",
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "FINAL_OFFER_PENDING",
        },
      });
    } else {
      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "ACCEPTED",
          finalPrice: originalPrice,
        },
      });
    }
  });

  // Log action
  await prisma.adminLog.create({
    data: {
      adminUserId: decodedUser.uid,
      action: "LOG_QC_INSPECTION",
      details: JSON.stringify({
        orderNumber: order.orderNumber,
        originalPrice,
        revisedPrice,
        isPriceDifferent,
        imei,
      }),
    },
  });

  // Trigger push notification based on price difference
  await NotificationHelper.triggerMilestoneNotification(
    order.id,
    order.userId,
    isPriceDifferent ? "REVISED_OFFER" : "INSPECTION_COMPLETED"
  );

  return NextResponse.json({
    success: true,
    data: {
      order: updatedOrder,
      isPriceDifferent,
      originalPrice,
      revisedPrice,
    },
  });
});
