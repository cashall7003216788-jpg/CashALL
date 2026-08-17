import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
export const dynamic = "force-dynamic";

export const GET = apiWrapper(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const status = searchParams.get("status");
  const query = searchParams.get("query");

  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (query) {
    where.OR = [
      { orderNumber: { contains: query, mode: "insensitive" } },
      { user: { phone: { contains: query, mode: "insensitive" } } },
      { user: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: true,
        address: true,
        quote: {
          include: {
            variant: {
              include: {
                model: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
          },
        },
        pickups: {
          include: { partner: true },
        },
        payments: true,
        qcReports: true,
        imeiRecords: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
