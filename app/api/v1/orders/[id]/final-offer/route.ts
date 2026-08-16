import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { OrderStateMachine } from "@/lib/services/order-state";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const schema = z.object({
  finalPrice: z.number().min(0, "Final price must be >= 0"),
  reason: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { quote: true },
  });
  if (!order) throw new AppError("Order not found.", 404);

  OrderStateMachine.assertTransition(order.status, "FINAL_OFFER_PENDING");

  // Create Offer record
  const offer = await prisma.offer.create({
    data: {
      orderId: order.id,
      originalPrice: order.quote.estimatedPrice,
      revisedPrice: validation.data.finalPrice,
      priceDifferenceReason: validation.data.reason || "Physical inspection adjustment.",
      status: "PENDING",
    },
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "FINAL_OFFER_PENDING",
      finalPrice: validation.data.finalPrice,
    },
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "FINAL_OFFER_SUBMITTED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "FINAL_OFFER_PENDING", finalPrice: validation.data.finalPrice },
  });

  return NextResponse.json({
    success: true,
    data: { offer, order: updatedOrder },
  });
});
