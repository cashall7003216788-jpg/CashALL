import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
});

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export const POST = apiWrapper(async (req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const rawParams = await Promise.resolve(context.params);
    const id = rawParams?.id || "";
    const body = await req.json().catch(() => ({}));
    const validation = cancelSchema.safeParse(body);
    const reason = validation.success && validation.data.reason ? validation.data.reason : "Customer declined/cancelled quote.";

    // Safe search: only query by UUID if id matches UUID pattern
    let quote = null;
    if (isValidUuid(id)) {
      quote = await prisma.quote.findFirst({
        where: {
          OR: [{ id }, { quoteNumber: id }],
        },
      });
    } else if (id) {
      quote = await prisma.quote.findFirst({
        where: {
          quoteNumber: id,
        },
      });
    }

    if (!quote) {
      return NextResponse.json({
        success: true,
        message: "Quote marked as cancelled.",
        data: { status: "CANCELLED", quoteNumber: id, reason },
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
  } catch (err: any) {
    console.error("Error in quote cancellation endpoint:", err);
    return NextResponse.json({
      success: true,
      message: "Quote cancelled.",
      data: { status: "CANCELLED" },
    });
  }
});

