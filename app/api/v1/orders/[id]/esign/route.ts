import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { ESignService } from "@/lib/services/esign.service";
import { OrderStateMachine } from "@/lib/services/order-state";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const esignSchema = z.object({
  signerName: z.string().min(1, "Signer name required"),
  signerPhone: z.string().min(10, "Signer phone required"),
  signatureDataUrl: z.string().optional(),
  sellerDeclaration: z.string().min(10, "Seller declaration required"),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);
  const body = await req.json();
  const validation = esignSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) throw new AppError("Order not found.", 404);

  OrderStateMachine.assertTransition(order.status, "ESIGNED");

  const signatureRecord = await ESignService.processESign({
    orderId: order.id,
    userId: decodedUser.uid,
    signerName: validation.data.signerName,
    signerPhone: validation.data.signerPhone,
    signatureDataUrl: validation.data.signatureDataUrl,
    sellerDeclaration: validation.data.sellerDeclaration,
  });

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "SALE_AGREEMENT_ESIGNED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "ESIGNED", documentHash: signatureRecord.documentHash },
  });

  return NextResponse.json({
    success: true,
    message: "Device Sale Agreement signed successfully.",
    data: { signature: signatureRecord },
  });
});
