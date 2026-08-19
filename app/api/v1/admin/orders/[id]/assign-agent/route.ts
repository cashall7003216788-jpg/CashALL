import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const orderIdentifier = params.id;
  const body = await req.json().catch(() => ({}));

  const { agentId, agentName } = body;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { orderNumber: orderIdentifier },
      ],
      deletedAt: null,
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  let selectedAgentName = agentName;
  if (agentId) {
    const agentUser = await prisma.user.findUnique({
      where: { id: agentId },
    });
    if (agentUser?.name) {
      selectedAgentName = agentUser.name;
    }
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update or create pickup notes
    const existingPickup = await tx.pickup.findFirst({
      where: { orderId: order.id },
    });

    if (existingPickup) {
      await tx.pickup.update({
        where: { id: existingPickup.id },
        data: {
          notes: selectedAgentName || "Assigned Agent",
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });
    } else {
      await tx.pickup.create({
        data: {
          orderId: order.id,
          date: order.pickupDate || "Today",
          timeSlot: order.pickupTimeSlot || "10 AM - 1 PM",
          status: "ASSIGNED",
          notes: selectedAgentName || "Assigned Agent",
          assignedAt: new Date(),
        },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        agentId: agentId || null,
        status: "PARTNER_ASSIGNED",
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
