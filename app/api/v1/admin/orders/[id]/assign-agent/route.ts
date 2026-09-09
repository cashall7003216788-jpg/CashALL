import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const dynamic = "force-dynamic";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const rawId = params.id ? decodeURIComponent(params.id).trim() : "";
  const body = await req.json().catch(() => ({}));

  const { agentId, agentName } = body;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
  const cleanOrderNum = rawId.replace(/^#/, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: isUuid
        ? [{ id: rawId }, { orderNumber: cleanOrderNum }]
        : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
      deletedAt: null,
    },
  });

  if (!order) {
    throw new AppError(`Order "${rawId}" not found in database.`, 404);
  }

  let resolvedAgentId: string | null = agentId || null;
  let selectedAgentName = agentName || "";

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

  // Update or create pickup record sequentially (PgBouncer-safe, zero pool exhaustion)
  const existingPickup = await prisma.pickup.findFirst({
    where: { orderId: order.id },
  });

  const isAlreadyCompleted = ["COMPLETED", "PAID"].includes(order.status as string);

  if (existingPickup) {
    await prisma.pickup.update({
      where: { id: existingPickup.id },
      data: {
        notes: selectedAgentName || (resolvedAgentId ? "Assigned Agent" : "Unassigned"),
        status: isAlreadyCompleted ? "COMPLETED" : (resolvedAgentId ? "ASSIGNED" : "SCHEDULED"),
        assignedAt: resolvedAgentId ? new Date() : null,
      },
    });
  } else {
    await prisma.pickup.create({
      data: {
        orderId: order.id,
        date: order.pickupDate || "Today",
        timeSlot: order.pickupTimeSlot || "10 AM - 1 PM",
        status: isAlreadyCompleted ? "COMPLETED" : (resolvedAgentId ? "ASSIGNED" : "SCHEDULED"),
        notes: selectedAgentName || (resolvedAgentId ? "Assigned Agent" : "Unassigned"),
        assignedAt: resolvedAgentId ? new Date() : null,
      },
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      agentId: resolvedAgentId || null,
      status: isAlreadyCompleted
        ? order.status
        : resolvedAgentId
        ? "PARTNER_ASSIGNED"
        : "PICKUP_SCHEDULED",
    },
    include: {
      agent: true,
      user: true,
      pickups: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: resolvedAgentId
      ? `Agent "${selectedAgentName}" assigned successfully to order #${order.orderNumber}`
      : `Agent unassigned from order #${order.orderNumber}`,
    order: updatedOrder,
  });
});
