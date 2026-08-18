import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const assignPickupSchema = z.object({
  partnerId: z.string().optional(),
  partnerName: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTimeSlot: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const orderIdentifier = params.id;
  const body = await req.json().catch(() => ({}));
  const validation = assignPickupSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const { partnerId: rawPartnerId, partnerName: rawPartnerName, pickupDate: rawDate, pickupTimeSlot: rawTime } = validation.data;

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

  const pickupDate = rawDate || order.pickupDate || "Today";
  const pickupTimeSlot = rawTime || order.pickupTimeSlot || "10 AM - 1 PM";
  const agentName = rawPartnerName || "CashALL In-House Agent";

  // Find or Create Default In-House Partner in DB
  let partner = null;
  if (rawPartnerId && rawPartnerId !== "p-inhouse-custom") {
    partner = await prisma.partner.findUnique({ where: { id: rawPartnerId } });
  }

  if (!partner) {
    partner = await prisma.partner.findFirst({
      where: { phone: "7003216788" },
    });
    if (!partner) {
      partner = await prisma.partner.create({
        data: {
          name: agentName,
          businessName: "CashALL In-House Logistics",
          phone: "7003216788",
          email: "support@cashall.in",
          city: "Kolkata",
          status: "ACTIVE",
        },
      });
    }
  }

  // Update order status and pickup record in PostgreSQL database
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const existingPickup = await tx.pickup.findFirst({
      where: { orderId: order.id },
    });

    if (existingPickup) {
      await tx.pickup.update({
        where: { id: existingPickup.id },
        data: {
          partnerId: partner.id,
          date: pickupDate,
          timeSlot: pickupTimeSlot,
          status: "ASSIGNED",
          notes: agentName,
          assignedAt: new Date(),
        },
      });
    } else {
      await tx.pickup.create({
        data: {
          orderId: order.id,
          partnerId: partner.id,
          date: pickupDate,
          timeSlot: pickupTimeSlot,
          status: "ASSIGNED",
          notes: agentName,
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

  logger.info(`[PARTNER ASSIGNED] Order #${order.orderNumber} assigned to ${agentName}`);

  return NextResponse.json({
    success: true,
    data: updatedOrder,
  });
});
