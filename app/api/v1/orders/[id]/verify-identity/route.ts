import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { IdentityService } from "@/lib/services/identity.service";
import { OrderStateMachine } from "@/lib/services/order-state";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const schema = z.object({
  idType: z.enum(["AADHAAR", "PAN", "VOTER_ID", "DRIVING_LICENSE"]),
  idNumber: z.string().min(5, "ID number required"),
  fullName: z.string().min(1, "Full name required"),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  const body = await req.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) throw new AppError("Order not found.", 404);

  // Validate state transition
  OrderStateMachine.assertTransition(order.status, "ACCEPTED");

  const verification = await IdentityService.verifyIdentity({
    orderId: order.id,
    userId: decodedUser.uid,
    idType: validation.data.idType,
    idNumber: validation.data.idNumber,
    fullName: validation.data.fullName,
  });

  // Update order status to ACCEPTED
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "ACCEPTED" },
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "IDENTITY_VERIFIED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "ACCEPTED", verificationId: verification.id },
  });

  return NextResponse.json({
    success: true,
    data: { verification, order: updatedOrder },
  });
});
