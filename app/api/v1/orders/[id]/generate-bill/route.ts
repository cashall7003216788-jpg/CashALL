import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { BillService } from "@/lib/services/bill.service";
import { AuditService } from "@/lib/services/audit.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) throw new AppError("Order not found.", 404);

  // BillService enforces full backend completion criteria verification
  const result = await BillService.generateFinalBill(order.id);

  await AuditService.log({
    actorId: decodedUser.uid,
    actorRole: decodedUser.role,
    action: "BILL_GENERATED_AND_COMPLETED",
    tableName: "Order",
    recordId: order.id,
    oldValues: { status: order.status },
    newValues: { status: "COMPLETED", billNumber: result.billRecord.billNumber },
  });

  return NextResponse.json({
    success: true,
    message: "Bill & Purchase Receipt generated. Transaction COMPLETED.",
    data: result,
  });
});
