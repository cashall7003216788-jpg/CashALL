import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { NotificationHelper } from "@/lib/services/notification.helper";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  const orderIdentifier = params.id;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { orderNumber: orderIdentifier },
      ],
      deletedAt: null,
    },
    include: {
      offers: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (order.userId !== decodedUser.uid) {
    throw new AppError("Access denied.", 403);
  }

  const pendingOffer = order.offers[0];
  if (!pendingOffer) {
    throw new AppError("No pending revised offer found for this order.", 400);
  }

  // Update offer status, order status, and finalPrice in a transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id: pendingOffer.id },
      data: {
        status: "ACCEPTED",
        customerResponseAt: new Date(),
      },
    });

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "ACCEPTED",
        finalPrice: pendingOffer.revisedPrice,
      },
    });
  });

  // Log user activity
  await prisma.activityLog.create({
    data: {
      userId: decodedUser.uid,
      action: "ACCEPT_REVISED_OFFER",
      details: JSON.stringify({
        orderNumber: order.orderNumber,
        originalPrice: pendingOffer.originalPrice,
        revisedPrice: pendingOffer.revisedPrice,
      }),
    },
  });

  // Trigger push notification
  await NotificationHelper.triggerMilestoneNotification(
    order.id,
    order.userId,
    "OFFER_ACCEPTED"
  );

  return NextResponse.json({
    success: true,
    data: updatedOrder,
  });
});
