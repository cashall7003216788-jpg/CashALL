import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json().catch(() => ({}));
  const validation = cancelSchema.safeParse(body);
  const reason = validation.success && validation.data.reason ? validation.data.reason : "Customer declined/cancelled quote.";

  // Find quote by ID or quoteNumber
  const quote = await prisma.quote.findFirst({
    where: {
      OR: [
        { id: params.id },
        { quoteNumber: params.id },
      ],
    },
  });

  if (!quote) {
    return NextResponse.json({
      success: true,
      message: "Quote marked as cancelled.",
      data: { status: "CANCELLED", quoteNumber: params.id, reason },
    });
  }

  const updatedQuote = await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: "CANCELLED",
    },
  });

  await AuditService.log({
    actorId: "customer_portal",
    actorRole: "CUSTOMER",
    action: "QUOTE_CANCELLED",
    tableName: "Quote",
    recordId: quote.id,
    oldValues: { status: quote.status },
    newValues: { status: "CANCELLED", reason },
  }).catch(() => null);

  return NextResponse.json({
    success: true,
    message: "Quote successfully cancelled.",
    data: { quote: updatedQuote },
  });
});
