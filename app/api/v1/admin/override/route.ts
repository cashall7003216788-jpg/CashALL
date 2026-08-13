import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { AuditService } from "@/lib/services/audit.service";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const overrideSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  targetStatus: z.nativeEnum(OrderStatus),
  reason: z.string().min(10, "Mandatory admin override reason is required"),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const validation = overrideSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const { orderId, targetStatus, reason } = validation.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found.", 404);

  const previousStatus = order.status;

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: targetStatus },
  });

  // MANDATORY LOGGING OF ADMIN OVERRIDE IN IMMUTABLE AUDIT LOG
  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "ADMIN_WORKFLOW_OVERRIDE",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: previousStatus },
    newValues: { status: targetStatus },
    reason,
  });

  return NextResponse.json({
    success: true,
    message: `Admin workflow override applied: ${previousStatus} -> ${targetStatus}`,
    data: { order: updatedOrder, reason },
  });
});
