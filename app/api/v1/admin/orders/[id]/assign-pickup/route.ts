import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { logger } from "@/lib/utils/logger";
import { NotificationHelper } from "@/lib/services/notification.helper";
import { z } from "zod";

const assignPickupSchema = z.object({
  partnerId: z.string({
    required_error: "partnerId is required",
  }),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTimeSlot: z.string().min(1, "Time slot is required"),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const orderIdentifier = params.id;
  const body = await req.json();
  const validation = assignPickupSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const { partnerId, pickupDate, pickupTimeSlot } = validation.data;

  // Verify partner
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  });
  if (!partner) {
    throw new AppError("Pickup partner not found.", 404);
  }

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

  // Update order status and schedule in transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const existingPickup = await tx.pickup.findFirst({
      where: { orderId: order.id, status: "SCHEDULED" },
    });

    if (existingPickup) {
      await tx.pickup.update({
        where: { id: existingPickup.id },
        data: {
          partnerId,
          date: pickupDate,
          timeSlot: pickupTimeSlot,
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });
    } else {
      await tx.pickup.create({
        data: {
          orderId: order.id,
          partnerId,
          date: pickupDate,
          timeSlot: pickupTimeSlot,
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "PARTNER_ASSIGNED",
        pickupDate,
        pickupTimeSlot,
      },
    });
  });

  // Log action
  await prisma.adminLog.create({
    data: {
      adminUserId: decodedUser.uid,
      action: "ASSIGN_PICKUP_PARTNER",
      details: JSON.stringify({
        orderNumber: order.orderNumber,
        partnerId,
        partnerName: partner.name,
      }),
    },
  });

  logger.adminAction(decodedUser.uid, "ASSIGN_PICKUP_PARTNER", {
    orderNumber: order.orderNumber,
    partnerName: partner.name,
  });

  // Trigger push notification
  await NotificationHelper.triggerMilestoneNotification(
    order.id,
    order.userId,
    "PARTNER_ASSIGNED"
  );

  return NextResponse.json({
    success: true,
    data: updatedOrder,
  });
});
