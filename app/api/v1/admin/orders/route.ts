import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
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

  const formattedOrders = orders.map((ord: any) => {
    // Resolve deviceName: breakdownJson → variant→model chain → fallback
    let deviceName = "Mobile Device";
    if (ord.quote?.breakdownJson) {
      try {
        const bd = JSON.parse(ord.quote.breakdownJson);
        if (bd && typeof bd === "object" && !Array.isArray(bd) && bd.deviceName) {
          deviceName = bd.deviceName;
        }
      } catch {}
    }
    if (deviceName === "Mobile Device" && ord.quote?.variant?.model) {
      const m = ord.quote.variant.model;
      deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
    }
    if (deviceName === "Mobile Device" && ord.quote?.selectedAnswersJson) {
      try {
        const sa = JSON.parse(ord.quote.selectedAnswersJson);
        if (sa?.device && sa.device !== "Customer Mobile Device") deviceName = sa.device;
      } catch {}
    }

    const assignedPartner = ord.pickups?.[0]?.partner;
    const assignedPartnerName = assignedPartner ? (assignedPartner.name || assignedPartner.companyName) : null;
    const customerEmail = ord.user?.email || null;

    return {
      ...ord,
      deviceName,
      customerEmail,
      assignedPartnerName,
      agentName: assignedPartnerName,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
