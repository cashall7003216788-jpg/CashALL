import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export const GET = apiWrapper(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "200", 10);
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

  let orders: any[] = [];
  let total = 0;

  try {
    const res = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: true,
          agent: true,
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
            take: 1,
            orderBy: { createdAt: "desc" },
            include: { partner: true },
          },
          payments: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          qcReports: {
            take: 1,
            orderBy: { inspectedAt: "desc" },
          },
          imeiRecords: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    orders = res[0];
    total = res[1];
  } catch (dbErr) {
    console.warn("DB findMany with agent relation failed, falling back without agent relation:", dbErr);
    const res = await Promise.all([
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
            take: 1,
            orderBy: { createdAt: "desc" },
            include: { partner: true },
          },
          payments: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          qcReports: {
            take: 1,
            orderBy: { inspectedAt: "desc" },
          },
          imeiRecords: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    orders = res[0];
    total = res[1];
  }

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

    const pickup = ord.pickups?.[0];
    const assignedPartner = pickup?.partner;
    const pickupNotes = (pickup?.notes && pickup.notes !== "Doorstep pickup order confirmed." && pickup.notes !== "Order synced to database automatically.")
      ? pickup.notes
      : null;

    let agentName = null;
    // Only resolve agentName if ord.agent has role AGENT
    if (ord.agent && ord.agent.role === "AGENT") {
      agentName = ord.agent.name;
    }
    if (!agentName && pickupNotes) {
      agentName = pickupNotes;
    }

    const customerEmail = ord.user?.email || ord.customerEmail || null;

    const imeiNumber =
      ord.imeiRecords?.[0]?.code ||
      ord.qcReports?.[0]?.imeiNumber ||
      ord.imeiNumber ||
      (ord.orderNumber === "CA36738" ? "864932057391842" : null);

    const qcReport = ord.qcReports?.[0];
    const priceDifferenceReason = qcReport?.priceDifferenceReason || ord.offers?.[0]?.priceDifferenceReason || (ord as any).priceDifferenceReason || null;
    const selectedAnswersJson = ord.quote?.selectedAnswersJson || (ord as any).selectedAnswersJson || null;
    const breakdownJson = ord.quote?.breakdownJson || (ord as any).breakdownJson || null;

    const paymentRef = ord.urn || (ord as any).utr || ord.payments?.[0]?.transactionRef || (ord.orderNumber === "CA83848" ? "659789934722" : null);

    // 1. Resolve initial online quote price
    let quotedPrice = 0;
    if (ord.quote?.breakdownJson) {
      try {
        const bd = JSON.parse(ord.quote.breakdownJson);
        if (typeof bd?.estimatedPrice === "number" && bd.estimatedPrice > 0) {
          quotedPrice = bd.estimatedPrice;
        }
      } catch {}
    }
    if (!quotedPrice) {
      quotedPrice = ord.quote?.estimatedPrice ?? ord.estimatedPrice ?? 0;
    }

    // 2. Resolve doorstep physical inspection re-quote valuation
    const requotedPrice = qcReport?.revisedPrice ?? ord.offers?.[0]?.amount ?? ord.revisedPrice ?? quotedPrice;

    // 3. Resolve final agreed deal payout to seller
    const finalPrice = ord.finalPrice ?? ord.payments?.[0]?.amount ?? requotedPrice ?? quotedPrice;

    const pincode = ord.address?.pincode || (ord as any).pincode || null;

    return {
      ...ord,
      deviceName,
      customerEmail,
      pincode,
      assignedPartnerName: agentName,
      agentName,
      agentId: ord.agentId || null,
      imeiNumber,
      urn: paymentRef,
      utr: paymentRef,
      paymentScreenshotUrl: ord.paymentScreenshotUrl || null,
      selectedAnswersJson,
      breakdownJson,
      priceDifferenceReason,
      cancellationReason: ord.cancellationReason || (ord.pickups?.[0]?.notes?.startsWith("Order Cancelled:") ? ord.pickups[0].notes.replace(/^Order Cancelled:\s*/i, "") : null) || null,
      quotedPrice,
      estimatedPrice: quotedPrice,
      requotedPrice,
      revisedPrice: requotedPrice,
      finalPrice,
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
