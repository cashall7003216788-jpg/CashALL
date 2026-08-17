import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { BillService } from "@/lib/services/bill.service";
import { AuditService } from "@/lib/services/audit.service";
import { WhatsAppService } from "@/lib/services/whatsapp.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const decodedUser = await verifyAuthToken(req);

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      quote: true,
    },
  });
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

  // Send WhatsApp bill confirmation to admin
  const deviceName = (() => {
    if (order.quote?.breakdownJson) {
      try {
        const bd = JSON.parse(order.quote.breakdownJson);
        if (bd?.deviceName) return bd.deviceName;
      } catch {}
    }
    return "Customer Device";
  })();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cashall.in";
  const billUrl = `${siteUrl}/admin/bill/${order.orderNumber}`;
  WhatsAppService.notifyBillGenerated({
    orderNumber: order.orderNumber,
    customerName: order.user?.name || "Customer",
    deviceName,
    paidAmount: result.billData?.financials?.finalPurchasePrice || order.finalPrice || 0,
    billUrl,
  }).catch((err) => console.error("WhatsApp bill notification error:", err));

  return NextResponse.json({
    success: true,
    message: "Bill & Purchase Receipt generated. Transaction COMPLETED.",
    data: result,
  });
});

