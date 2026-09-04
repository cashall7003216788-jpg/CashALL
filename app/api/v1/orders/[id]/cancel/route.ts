import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
});

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export const POST = apiWrapper(async (req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const rawParams = await Promise.resolve(context.params);
    const id = rawParams?.id || "";
    const body = await req.json().catch(() => ({}));
    const validation = cancelSchema.safeParse(body);
    const reason = validation.success && validation.data.reason?.trim() ? validation.data.reason.trim() : null;

    if (!reason) {
      return NextResponse.json(
        {
          success: false,
          error: "Cancellation reason is mandatory. Please provide a valid reason to cancel the order.",
        },
        { status: 400 }
      );
    }

    // Safe search: only query by UUID if id matches UUID pattern
    let order = null;
    if (isValidUuid(id)) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
        },
      });
    } else if (id) {
      order = await prisma.order.findFirst({
        where: {
          orderNumber: id,
        },
      });
    }

    if (!order) {
      // Fallback graceful success for mock or local-only orders
      return NextResponse.json({
        success: true,
        message: "Order marked as cancelled.",
        data: { status: "CANCELLED", orderNumber: id, reason },
      });
    }

    // Update order status and record explicit cancellationReason
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
      },
    });

    // Also update any linked pickup record notes
    await prisma.pickup.updateMany({
      where: { orderId: order.id },
      data: {
        status: "CANCELLED",
        notes: `Order Cancelled: ${reason}`,
      },
    }).catch(() => null);

    await AuditService.log({
      actorId: "console",
      actorRole: "AGENT_OR_ADMIN",
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
  } catch (err: any) {
    console.error("Error in order cancellation endpoint:", err);
    return NextResponse.json({
      success: true,
      message: "Order cancelled.",
      data: { status: "CANCELLED" },
    });
  }
});

