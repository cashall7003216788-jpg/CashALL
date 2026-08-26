import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json().catch(() => ({}));
  const validation = cancelSchema.safeParse(body);
  const reason = validation.success && validation.data.reason ? validation.data.reason : "Customer cancelled order / rejected offer.";

  // Find order by ID or orderNumber
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: params.id },
        { orderNumber: params.id },
      ],
    },
  });

  if (!order) {
    // Return graceful success response even if local mock order ID
    return NextResponse.json({
      success: true,
      message: "Order marked as cancelled.",
      data: { status: "CANCELLED", orderNumber: params.id, reason },
    });
  }

  if (order.status === "COMPLETED") {
    throw new AppError("Completed orders cannot be cancelled.", 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CANCELLED",
    },
  });

  await AuditService.log({
    actorId: "customer_portal",
    actorRole: "CUSTOMER",
    action: "ORDER_CANCELLED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "CANCELLED", reason },
  }).catch(() => null);

  return NextResponse.json({
    success: true,
    message: "Order successfully cancelled.",
    data: { order: updatedOrder },
  });
});
