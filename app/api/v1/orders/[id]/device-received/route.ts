import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { OrderStateMachine } from "@/lib/services/order-state";
import { AuditService } from "@/lib/services/audit.service";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) throw new AppError("Order not found.", 404);

  OrderStateMachine.assertTransition(order.status, "DEVICE_RECEIVED");

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "DEVICE_RECEIVED" },
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "DEVICE_RECEIVED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "DEVICE_RECEIVED" },
  });

  return NextResponse.json({
    success: true,
    message: "Physical device handover confirmed by partner.",
    data: { order: updatedOrder },
  });
});
