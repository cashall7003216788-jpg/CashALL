import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const saveInspectionSchema = z.object({
  imei: z.string().min(5, "IMEI / Serial Number is required"),
  screenFinding: z.string().optional(),
  bodyFinding: z.string().optional(),
  revisedPrice: z.number().min(0, "Revised price must be a valid amount"),
  reason: z.string().optional(),
  customerEmail: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN", "EMPLOYEE"], decodedUser.role);

  const orderIdentifier = params.id;
  const body = await req.json().catch(() => ({}));
  const validation = saveInspectionSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const { imei, screenFinding, bodyFinding, revisedPrice, reason, customerEmail } = validation.data;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
  const cleanOrderNum = orderIdentifier.replace(/^#/, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: isUuid
        ? [{ id: orderIdentifier }, { orderNumber: cleanOrderNum }]
        : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
      deletedAt: null,
    },
    include: { quote: true, user: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  // Perform inspection transaction in DB
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // 1. Update user email if provided
    if (customerEmail && customerEmail.includes("@")) {
      await tx.user.update({
        where: { id: order.userId },
        data: { email: customerEmail.trim() },
      });
    }

    // 2. Create or Update QC Report
    const existingQc = await tx.qcReport.findFirst({ where: { orderId: order.id } });
    if (existingQc) {
      await tx.qcReport.update({
        where: { id: existingQc.id },
        data: {
          inspectorName: decodedUser.email || "Inspector",
          imeiNumber: imei.trim(),
          physicalAnswersJson: JSON.stringify({ screenFinding, bodyFinding }),
          revisedPrice,
          priceDifferenceReason: reason || null,
          status: "APPROVED",
          inspectedAt: new Date(),
        },
      });
    } else {
      await tx.qcReport.create({
        data: {
          orderId: order.id,
          inspectorName: decodedUser.email || "Inspector",
          imeiNumber: imei.trim(),
          declaredAnswersJson: order.quote?.selectedAnswersJson || "{}",
          physicalAnswersJson: JSON.stringify({ screenFinding, bodyFinding }),
          revisedPrice,
          priceDifferenceReason: reason || null,
          status: "APPROVED",
          inspectedAt: new Date(),
        },
      });
    }

    // 3. Record IMEI Record
    const existingImei = await tx.imei.findFirst({ where: { code: imei.trim() } });
    if (!existingImei) {
      await tx.imei.create({
        data: {
          orderId: order.id,
          code: imei.trim(),
          status: "VERIFIED",
        },
      });
    } else if (!existingImei.orderId) {
      await tx.imei.update({
        where: { id: existingImei.id },
        data: { orderId: order.id },
      });
    }

    // 4. Update Order Status and Revised Final Price
    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "ACCEPTED",
        finalPrice: revisedPrice,
      },
      include: {
        user: true,
        address: true,
        quote: true,
        pickups: { include: { partner: true } },
        qcReports: true,
        imeiRecords: true,
      },
    });
  });

  logger.info(`[PHYSICAL INSPECTION] Saved for Order #${order.orderNumber} - IMEI: ${imei}, Revised Price: ₹${revisedPrice}`);

  return NextResponse.json({
    success: true,
    message: `Physical inspection saved and payout price locked at ₹${revisedPrice.toLocaleString("en-IN")}.`,
    data: updatedOrder,
  });
});
