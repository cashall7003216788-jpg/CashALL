import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const dynamic = "force-dynamic";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const orderIdentifier = params.id;
  const body = await req.json().catch(() => ({}));

  const { agentId, agentName } = body;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
  const cleanOrderNum = orderIdentifier.replace(/^#/, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: isUuid
        ? [{ id: orderIdentifier }, { orderNumber: cleanOrderNum }]
        : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
      deletedAt: null,
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  let resolvedAgentId = agentId;
  let selectedAgentName = agentName;

  if (agentId) {
    const isAgentUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId);
    if (isAgentUuid) {
      const agentUser = await prisma.user.findUnique({
        where: { id: agentId },
      });
      if (agentUser?.name) {
        selectedAgentName = agentUser.name;
        resolvedAgentId = agentUser.id;
      }
    }
  }

  if (!resolvedAgentId && selectedAgentName) {
    const agentUser = await prisma.user.findFirst({
      where: {
        name: { equals: selectedAgentName, mode: "insensitive" },
        role: "AGENT",
        deletedAt: null,
      },
    });
    if (agentUser) {
      resolvedAgentId = agentUser.id;
      selectedAgentName = agentUser.name;
    }
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update or create pickup notes
    const existingPickup = await tx.pickup.findFirst({
      where: { orderId: order.id },
    });

    const isAlreadyCompleted = ["COMPLETED", "BILL_GENERATED"].includes(order.status);

    if (existingPickup) {
      await tx.pickup.update({
        where: { id: existingPickup.id },
        data: {
          notes: selectedAgentName || "Assigned Agent",
          status: isAlreadyCompleted ? "COMPLETED" : "ASSIGNED",
          assignedAt: new Date(),
        },
      });
    } else {
      await tx.pickup.create({
        data: {
          orderId: order.id,
          date: order.pickupDate || "Today",
          timeSlot: order.pickupTimeSlot || "10 AM - 1 PM",
          status: isAlreadyCompleted ? "COMPLETED" : "ASSIGNED",
          notes: selectedAgentName || "Assigned Agent",
          assignedAt: new Date(),
        },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        agentId: resolvedAgentId || null,
        status: isAlreadyCompleted ? order.status : "PARTNER_ASSIGNED",
      },
      include: {
        agent: true,
        user: true,
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: "Agent assigned successfully",
    order: updatedOrder,
  });
});
