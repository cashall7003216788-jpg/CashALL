import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { OrderStateMachine } from "@/lib/services/order-state";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const schema = z.object({
  partnerId: z.string().min(1, "Partner ID is required"),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const body = await req.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) throw new AppError("Order not found.", 404);

  const partner = await prisma.partner.findUnique({ where: { id: validation.data.partnerId } });
  if (!partner) throw new AppError("Partner not found.", 404);

  // Validate state transition
  OrderStateMachine.assertTransition(order.status, "PARTNER_ASSIGNED");

  // Update Pickup record
  await prisma.pickup.updateMany({
    where: { orderId: order.id },
    data: {
      partnerId: partner.id,
      status: "ASSIGNED",
      assignedAt: new Date(),
    },
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PARTNER_ASSIGNED" },
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "PARTNER_ASSIGNED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "PARTNER_ASSIGNED", partnerId: partner.id, partnerName: partner.name },
  });

  return NextResponse.json({
    success: true,
    data: { order: updatedOrder, partner },
  });
});
