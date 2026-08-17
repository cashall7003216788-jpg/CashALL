import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = apiWrapper(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where: { deletedAt: null },
      include: {
        variant: {
          include: {
            model: { include: { brand: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.quote.count({ where: { deletedAt: null } }),
  ]);

  const mapped = quotes.map((q) => {
    let deviceName = q.variant
      ? `${q.variant.model.brand.name} ${q.variant.model.name} (${q.variant.storage})`
      : "Mobile Device";

    if (q.breakdownJson) {
      try {
        const bd = JSON.parse(q.breakdownJson);
        if (bd.deviceName) deviceName = bd.deviceName;
      } catch (e) {}
    }

    return {
      id: q.id,
      quoteNumber: q.quoteNumber || `CAQ-${q.id.slice(0, 6).toUpperCase()}`,
      deviceName,
      basePrice: q.basePrice,
      estimatedPrice: q.estimatedPrice,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    };
  });

  return NextResponse.json({
    success: true,
    quotes: mapped,
    total,
    page,
  });
});
