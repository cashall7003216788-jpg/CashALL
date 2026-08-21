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
        orders: {
          include: {
            user: true,
            address: true,
          },
        },
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
    if (deviceName === "Mobile Device" && q.selectedAnswersJson) {
      try {
        const sa = JSON.parse(q.selectedAnswersJson);
        if (sa?.device && sa.device !== "Customer Mobile Device") deviceName = sa.device;
      } catch (e) {}
    }

    const relatedOrder = q.orders?.[0];
    let customerName = relatedOrder?.user?.name || "";
    let customerPhone = relatedOrder?.user?.phone || relatedOrder?.address?.phone || "";

    if (!customerName && q.breakdownJson) {
      try {
        const bd = JSON.parse(q.breakdownJson);
        if (bd.customerName) customerName = bd.customerName;
        if (bd.customerPhone && !customerPhone) customerPhone = bd.customerPhone;
      } catch (e) {}
    }
    if (!customerName && q.selectedAnswersJson) {
      try {
        const sa = JSON.parse(q.selectedAnswersJson);
        if (sa.customerName) customerName = sa.customerName;
        if (sa.customerPhone && !customerPhone) customerPhone = sa.customerPhone;
      } catch (e) {}
    }

    if (!customerName) customerName = "Customer Lead";
    if (!customerPhone) customerPhone = "—";

    let status = "UNCOMPLETED (PENDING CALL)";
    if (relatedOrder?.status === "COMPLETED") {
      status = "COMPLETED";
    } else if (relatedOrder) {
      status = "ORDERED";
    } else if (q.status === "ORDERED" || q.status === "COMPLETED") {
      status = q.status;
    }

    return {
      id: q.id,
      quoteNumber: q.quoteNumber || `CAQ-${q.id.slice(0, 6).toUpperCase()}`,
      customerName,
      customerPhone,
      deviceName,
      basePrice: q.basePrice,
      estimatedPrice: q.estimatedPrice,
      status,
      createdAt: q.createdAt.toISOString(),
      orderNumber: relatedOrder?.orderNumber || null,
      pickupDate: relatedOrder?.pickupDate || null,
      pickupTimeSlot: relatedOrder?.pickupTimeSlot || null,
    };
  });

  return NextResponse.json({
    success: true,
    quotes: mapped,
    total,
    page,
  });
});
