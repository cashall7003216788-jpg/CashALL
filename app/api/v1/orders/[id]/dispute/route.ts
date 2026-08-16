import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const schema = z.object({
  reason: z.string().min(5, "Dispute reason required"),
  evidenceDetails: z.string().optional(),
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

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "ORDER_DISPUTED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "CANCELLED", reason: validation.data.reason, evidence: validation.data.evidenceDetails },
  });

  return NextResponse.json({
    success: true,
    message: "Transaction marked as DISPUTED and frozen for admin investigation.",
    data: { order: updatedOrder },
  });
});
