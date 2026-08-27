import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { OrderStateMachine } from "@/lib/services/order-state";
import { AuditService } from "@/lib/services/audit.service";
import { extractClientMetadata, sendServerOfferAcceptedEvent } from "@/lib/analytics/meta-server";
import { z } from "zod";

const schema = z.object({
  accept: z.boolean(),
  declineReason: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  const body = await req.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { offers: true, quote: true },
  });
  if (!order) throw new AppError("Order not found.", 404);

  const pendingOffer = order.offers.find((o) => o.status === "PENDING") || order.offers[0];

  if (validation.data.accept) {
    OrderStateMachine.assertTransition(order.status, "CUSTOMER_ACCEPTED");

    if (pendingOffer) {
      await prisma.offer.update({
        where: { id: pendingOffer.id },
        data: { status: "ACCEPTED", customerResponseAt: new Date() },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "ACCEPTED" },
    });

    await AuditService.log({
      actorId: decodedUser.uid,
      actorRole: decodedUser.role,
      action: "CUSTOMER_ACCEPTED_FINAL_OFFER",
      tableName: "Order",
      recordId: order.id,
      oldValues: { status: order.status },
      newValues: { status: "ACCEPTED", acceptedPrice: order.finalPrice, acceptedAt: new Date() },
    });

    // Fire Meta CAPI OfferAccepted event
    try {
      const clientMeta = extractClientMetadata(req);
      const offerVal = pendingOffer ? pendingOffer.revisedPrice : (order.finalPrice ?? order.quote?.estimatedPrice ?? 0);
      sendServerOfferAcceptedEvent({
        orderId: order.id,
        orderNumber: order.orderNumber,
        value: Number(offerVal),
        userData: {
          clientIpAddress: clientMeta.clientIpAddress,
          clientUserAgent: clientMeta.clientUserAgent,
          fbp: clientMeta.fbp,
          fbc: clientMeta.fbc,
        },
      }).catch(() => null);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Final offer accepted by customer. Seller identity verification is now pending.",
      data: { order: updatedOrder },
    });
  } else {
    OrderStateMachine.assertTransition(order.status, "DECLINED");

    if (pendingOffer) {
      await prisma.offer.update({
        where: { id: pendingOffer.id },
        data: { status: "DECLINED", customerResponseAt: new Date() },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "DECLINED" },
    });

    await AuditService.log({
      actorId: decodedUser.uid,
      actorRole: decodedUser.role,
      action: "CUSTOMER_REJECTED_FINAL_OFFER",
      tableName: "Order",
      recordId: order.id,
      oldValues: { status: order.status },
      newValues: { status: "REJECTED", reason: validation.data.declineReason },
    });

    return NextResponse.json({
      success: true,
      message: "Offer declined by customer. Transaction stopped.",
      data: { order: updatedOrder },
    });
  }
});
