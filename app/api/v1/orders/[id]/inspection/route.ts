import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { OrderStateMachine } from "@/lib/services/order-state";
import { ImeiService } from "@/lib/services/imei.service";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const inspectionSchema = z.object({
  inspectorName: z.string().min(1, "Inspector name required"),
  imei1: z.string().min(14, "IMEI 1 must be 14-16 digits"),
  imei2: z.string().optional(),
  physicalAnswers: z.record(z.any()),
  revisedPrice: z.number().min(0, "Price must be >= 0"),
  priceDifferenceReason: z.string().optional(),
  photoUrls: z.array(z.string()).min(1, "At least one inspection photo is required"),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const validation = inspectionSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const data = validation.data;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { quote: true },
  });
  if (!order) throw new AppError("Order not found.", 404);

  OrderStateMachine.assertTransition(order.status, "INSPECTION_COMPLETED");

  // Create QC Report
  const qcReport = await prisma.qcReport.create({
    data: {
      orderId: order.id,
      inspectorName: data.inspectorName,
      imeiNumber: data.imei1,
      declaredAnswersJson: order.quote.selectedAnswersJson,
      physicalAnswersJson: JSON.stringify(data.physicalAnswers),
      revisedPrice: data.revisedPrice,
      priceDifferenceReason: data.priceDifferenceReason || null,
      status: "APPROVED",
      photoUrlsJson: JSON.stringify(data.photoUrls),
      inspectedAt: new Date(),
    },
  });

  // Automatically trigger IMEI Verification check
  const imeiVerification = await ImeiService.verifyIMEI({
    orderId: order.id,
    imei1: data.imei1,
    imei2: data.imei2,
  });

  // If IMEI is clear, update order status to INSPECTION_COMPLETED or FINAL_OFFER
  let targetStatus = imeiVerification.status === "FLAGGED" ? "IMEI_FLAGGED" : "INSPECTION_COMPLETED";

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: targetStatus as any,
      finalPrice: data.revisedPrice,
    },
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "INSPECTION_COMPLETED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: targetStatus, revisedPrice: data.revisedPrice, imeiStatus: imeiVerification.status },
  });

  return NextResponse.json({
    success: true,
    data: { qcReport, imeiVerification, order: updatedOrder },
  });
});
