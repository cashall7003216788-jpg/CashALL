import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
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

  const mapped = quotes.map((q) => ({
    id: q.id,
    quoteNumber: q.quoteNumber || `CAQ-${q.id.slice(0, 6).toUpperCase()}`,
    deviceName: q.variant
      ? `${q.variant.model.brand.name} ${q.variant.model.name} (${q.variant.storage})`
      : "Unknown Device",
    basePrice: q.basePrice,
    estimatedPrice: q.estimatedPrice,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
  }));

  return NextResponse.json({
    success: true,
    quotes: mapped,
    total,
    page,
  });
});
